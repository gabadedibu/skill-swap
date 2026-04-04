// src/controllers/sessionController.js
const Session = require('../models/Session');
const Message = require('../models/Message');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const cron = require('node-cron');
const {
  sendNewMeetingScheduledNotification,
  sendNotificationForFeedbackRequest,
  sendNotificationForSessionCancellation,
} = require('./notificationController');
const mongoose = require('mongoose');

// ─── Multer ───────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/message-uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }).single('file');

// ─── Socket ───────────────────────────────────────────────────────
let sessionSocket;

const setSocketIO = (socketIO) => {
  sessionSocket = socketIO;

  sessionSocket.on('connection', (socket) => {
    const sessionId = socket.handshake.query.sessionId;
    if (sessionId) {
      socket.join(sessionId);
      console.log(`Socket ${socket.id} joined room: ${sessionId}`);
    }
    socket.on('disconnect', () => console.log(`Socket ${socket.id} disconnected`));
  });

  startMeetingReminderJob();
};

// ─── Cron: every minute ───────────────────────────────────────────
const startMeetingReminderJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const sessions = await Session.find({
        status: 'accepted',
        newMeetingDate: { $exists: true, $ne: null },
        newMeetingTime: { $exists: true, $ne: '' },
      }).populate('userId1', 'name').populate('userId2', 'name');

      for (const session of sessions) {
        const meetingDate = new Date(session.newMeetingDate).toISOString().split('T')[0];
        const meetingTime = session.newMeetingTime.slice(0, 5);

        if (meetingDate === currentDate && meetingTime === currentTime) {
          console.log(`⏰ Meeting time reached for session: ${session._id}`);

          const zoomPart = session.zoomLink
            ? `<br/>🔗 <a href="${session.zoomLink}" target="_blank" rel="noopener noreferrer" style="color:#818cf8;text-decoration:underline;font-weight:500;">${session.zoomLink}</a>`
            : '<br/><em style="opacity:0.6">No Zoom link was provided.</em>';

          const content = `🔔 <strong>Your scheduled meeting is starting now!</strong> (${session.skill})${zoomPart}`;

          const systemMessage = new Message({
            sessionId: session._id,
            senderId: session.userId1._id,
            receiverId: session.userId2._id,
            content,
          });
          await systemMessage.save();

          sessionSocket.to(session._id.toString()).emit('receive_message', {
            content,
            isSystem: true,
            sessionId: session._id,
            sender: null,
            receiver: null,
          });

          session.newMeetingDate = null;
          session.newMeetingTime = null;
          await session.save();

          console.log(`✅ Zoom reminder sent for session: ${session._id}`);
        }
      }
    } catch (err) {
      console.error('Cron job error:', err.message);
    }
  });

  console.log('✅ Meeting reminder cron job started');
};

// ─── Controllers ──────────────────────────────────────────────────

// ✅ FIX: Auto-accept session on creation — status set to 'accepted' immediately
const sendSessionRequest = async (req, res) => {
  const { userId2, sessionDate, sessionTime, skill } = req.body;
  if (!userId2 || !sessionDate || !sessionTime || !skill)
    return res.status(400).json({ msg: 'Please provide all required fields' });
  try {
    const newSession = new Session({
      userId1: req.user.id,
      userId2,
      sessionDate,
      sessionTime,
      skill,
      status: 'accepted', // ✅ auto-accepted, no manual step needed
    });
    await newSession.save();

    // Populate for response
    const populated = await Session.findById(newSession._id)
      .populate('userId1', 'name email profilePicture')
      .populate('userId2', 'name email profilePicture');

    res.json({ msg: 'Session created and accepted successfully', session: populated });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Keep accept route for backward compatibility but it's no longer needed
const acceptSessionRequest = async (req, res) => {
  const { sessionId } = req.body;
  try {
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ msg: 'Session not found' });
    session.status = 'accepted';
    await session.save();
    res.json({ msg: 'Session accepted', session });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// ✅ FIX: Return ALL sessions regardless of date (no date filter on backend)
const getPendingSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      userId2: req.user.id,
      status: 'pending',
    }).populate('userId1');
    res.json(sessions);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const getAcceptedSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await Session.find({
      $or: [
        { userId1: userId, status: 'accepted' },
        { userId2: userId, status: 'accepted' },
        { userId1: userId, status: 'completed' },
        { userId2: userId, status: 'completed' },
        { userId1: userId, status: 'canceled' },
        { userId2: userId, status: 'canceled' },
      ],
    })
      .populate('userId1', 'name email profilePicture')
      .populate('userId2', 'name email profilePicture');
    res.json(sessions);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const getOnlyAcceptedSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await Session.find({
      $or: [
        { userId1: userId, status: 'accepted' },
        { userId2: userId, status: 'accepted' },
      ],
    }).populate('userId1').populate('userId2');
    res.json(sessions);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const getCompletedSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await Session.find({
      $or: [
        { userId1: userId, status: 'completed' },
        { userId2: userId, status: 'completed' },
      ],
    }).populate('userId1').populate('userId2');
    res.json(sessions);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const getCanceledSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await Session.find({
      $or: [
        { userId1: userId, status: 'canceled' },
        { userId2: userId, status: 'canceled' },
      ],
    }).populate('userId1').populate('userId2');
    res.json(sessions);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const sendMessage = async (req, res) => {
  const { sessionId, content } = req.body;
  if (!sessionId) return res.status(400).json({ msg: 'Session ID is required' });

  const session = await Session.findById(sessionId);
  if (!session) return res.status(400).json({ msg: 'Session not found' });

  let mediaUrl = null, mediaType = null;
  if (req.file) {
    mediaUrl = `https://skill-swap-9y9h.onrender.com/uploads/message-uploads/${req.file.filename}`;
    mediaType = req.file.mimetype.startsWith('image') ? 'image'
              : req.file.mimetype.startsWith('video') ? 'video'
              : req.file.mimetype.startsWith('audio') ? 'audio' : null;
  }

  const receiverId = session.userId1.toString() === req.user.id ? session.userId2 : session.userId1;
  const sender = await User.findById(req.user.id);
  const receiver = await User.findById(receiverId);

  const newMessage = new Message({ sessionId, senderId: req.user.id, receiverId, content, mediaUrl, mediaType });
  await newMessage.save();

  sessionSocket.to(sessionId).emit('receive_message', {
    content,
    sender: { name: sender.name, id: sender._id },
    receiver: { name: receiver.name, id: receiver._id },
    sessionId,
    mediaUrl,
    mediaType,
    isSystem: false,
  });

  res.json({ msg: 'Message sent', message: newMessage });
};

const getMessages = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const messages = await Message.find({ sessionId })
      .populate('senderId', 'name')
      .populate('receiverId', 'name');
    res.json(messages);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const scheduleSession = async (req, res) => {
  const { sessionId, newMeetingDate, newMeetingTime, zoomLink } = req.body;
  if (!sessionId || !newMeetingDate || !newMeetingTime)
    return res.status(400).json({ msg: 'sessionId, newMeetingDate, and newMeetingTime are required' });

  try {
    const session = await Session.findById(new mongoose.Types.ObjectId(sessionId));
    if (!session) return res.status(404).json({ msg: 'Session not found' });

    session.newMeetingDate = new Date(newMeetingDate);
    session.newMeetingTime = newMeetingTime;
    if (zoomLink) session.zoomLink = zoomLink;
    await session.save();

    const message = `New meeting scheduled for ${newMeetingDate} at ${newMeetingTime} — ${session.skill}.`;
    sendNewMeetingScheduledNotification(session, message);

    res.json({ msg: 'Session scheduled successfully', session });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const markSessionAsCompletedOrCanceled = async (req, res) => {
  const { sessionId, status, rating, feedback } = req.body;
  const userId = req.user.id;

  try {
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ msg: 'Session not found' });
    if (![session.userId1.toString(), session.userId2.toString()].includes(userId))
      return res.status(403).json({ msg: 'Not authorized' });

    const update = { status };
    if (session.userId1.toString() === userId) {
      update.ratingByUser1 = rating; update.feedbackByUser1 = feedback; update.feedbackGivenByUser1 = true;
    } else {
      update.ratingByUser2 = rating; update.feedbackByUser2 = feedback; update.feedbackGivenByUser2 = true;
    }

    if (status === 'completed') {
      if (session.feedbackGivenByUser1 && session.feedbackGivenByUser2) update.sessionClosed = true;
      await Session.findByIdAndUpdate(sessionId, update, { new: true });
      const other = session.userId1.toString() === userId ? session.userId2 : session.userId1;
      await sendNotificationForFeedbackRequest(other);
      return res.json({ msg: 'Session updated successfully' });
    } else {
      update.sessionClosed = true;
      await Session.findByIdAndUpdate(sessionId, update, { new: true });
      await sendNotificationForSessionCancellation(session.userId1);
      await sendNotificationForSessionCancellation(session.userId2);
      return res.json({ msg: 'Session canceled successfully' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

const getUserAverageRating = async (req, res) => {
  const { userId } = req.params;
  try {
    const sessions = await Session.find({ $or: [{ userId1: userId }, { userId2: userId }] });
    let totalRating = 0, count = 0;
    sessions.forEach((s) => {
      if (s.userId1.toString() === userId && s.ratingByUser2 != null) { totalRating += s.ratingByUser2; count++; }
      else if (s.userId2.toString() === userId && s.ratingByUser1 != null) { totalRating += s.ratingByUser1; count++; }
    });
    res.json({ averageRating: count > 0 ? (totalRating / count).toFixed(2) : 'N/A' });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

module.exports = {
  upload, sendSessionRequest, acceptSessionRequest, getPendingSessions,
  getAcceptedSessions, getCompletedSessions, getCanceledSessions,
  sendMessage, getMessages, setSocketIO, scheduleSession,
  markSessionAsCompletedOrCanceled, getUserAverageRating, getOnlyAcceptedSessions,
};
