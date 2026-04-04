// src/controllers/sessionController.js
const Session = require('../models/Session');
const Message = require('../models/Message');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const cron = require('node-cron');
const { sendNewMeetingScheduledNotification, sendNotification, sendNotificationForFeedbackRequest, sendNotificationForSessionCancellation } = require('./notificationController');
const mongoose = require('mongoose');

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/message-uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('file');

let sessionSocket;

const setSocketIO = (socketIO) => {
  sessionSocket = socketIO;

  // ✅ FIX 1: Join users into session rooms when they connect
  sessionSocket.on('connection', (socket) => {
    const sessionId = socket.handshake.query.sessionId;
    if (sessionId) {
      socket.join(sessionId); // Join the specific session room
      console.log(`Socket ${socket.id} joined room: ${sessionId}`);
    }

    socket.on('disconnect', () => {
      console.log(`Socket ${socket.id} disconnected`);
    });
  });

  // ✅ FIX 2: Start the cron job AFTER socketIO is ready
  startMeetingReminderJob();
};

// ✅ FIX 3: Cron job that runs every minute and checks for sessions whose meeting time has arrived
const startMeetingReminderJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`; // "HH:MM"

      // Find accepted sessions whose newMeetingDate and newMeetingTime match right now
      const sessions = await Session.find({
        status: 'accepted',
        newMeetingDate: { $exists: true, $ne: null },
        newMeetingTime: { $exists: true, $ne: null },
      }).populate('userId1', 'name').populate('userId2', 'name');

      for (const session of sessions) {
        const meetingDate = new Date(session.newMeetingDate).toISOString().split('T')[0];
        const meetingTime = session.newMeetingTime.slice(0, 5); // trim seconds if any

        if (meetingDate === currentDate && meetingTime === currentTime) {
          console.log(`⏰ Meeting time reached for session: ${session._id}`);

          // Create a system message in the DB
          const systemMessage = new Message({
            sessionId: session._id,
            senderId: session.userId1._id,   // use userId1 as sender for system msg
            receiverId: session.userId2._id,
            content: `🔔 <strong>Your scheduled meeting is starting now!</strong> (${session.skill})`,
          });
          await systemMessage.save();

          // ✅ Emit only to the specific session room
          sessionSocket.to(session._id.toString()).emit('receive_message', {
            content: systemMessage.content,
            sender: { name: 'System', id: null },
            receiver: { name: session.userId2.name, id: session.userId2._id },
            sessionId: session._id,
            isSystem: true, // flag so frontend can style it differently
          });

          // Clear the scheduled time so it doesn't fire again next minute
          session.newMeetingDate = null;
          session.newMeetingTime = null;
          await session.save();
        }
      }
    } catch (err) {
      console.error('Error in meeting reminder cron job:', err.message);
    }
  });

  console.log('✅ Meeting reminder cron job started');
};

// Create a new session request
const sendSessionRequest = async (req, res) => {
  const { userId2, sessionDate, sessionTime, skill } = req.body;

  if (!userId2 || !sessionDate || !sessionTime || !skill) {
    return res.status(400).json({ msg: 'Please provide all required fields (userId2, sessionDate, sessionTime)' });
  }

  try {
    const userId1 = req.user.id;
    const newSession = new Session({
      userId1,
      userId2,
      sessionDate,
      sessionTime,
      skill,
      status: 'pending',
    });
    await newSession.save();
    res.json({ msg: 'Session request sent successfully', session: newSession });
  } catch (err) {
    console.error('Error creating session:', err.message);
    res.status(500).send('Server error');
  }
};

// Accept session request
const acceptSessionRequest = async (req, res) => {
  const { sessionId } = req.body;
  try {
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ msg: 'Session request not found' });
    if (session.userId2.toString() !== req.user.id)
      return res.status(400).json({ msg: 'You are not authorized to accept this session' });
    session.status = 'accepted';
    await session.save();
    res.json({ msg: 'Session request accepted', session });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get pending session requests
const getPendingSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await Session.find({ userId2: userId, status: 'pending' }).populate('userId1');
    res.json(sessions);
  } catch (err) {
    console.error(err.message);
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
    console.error(err.message);
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
    console.error(err.message);
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
    console.error(err.message);
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
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Send a new message in a session
const sendMessage = async (req, res) => {
  const { sessionId, content } = req.body;

  if (!sessionId) return res.status(400).json({ msg: 'Session ID is required' });

  const session = await Session.findById(sessionId);
  if (!session) return res.status(400).json({ msg: 'Session ID unknown' });

  let mediaUrl = null;
  let mediaType = null;

  if (req.file) {
    mediaUrl = `https://skill-swap-9y9h.onrender.com/uploads/message-uploads/${req.file.filename}`;
    mediaType = req.file.mimetype.startsWith('image') ? 'image' :
                req.file.mimetype.startsWith('video') ? 'video' :
                req.file.mimetype.startsWith('audio') ? 'audio' : null;
  }

  const receiverId = session.userId1.toString() === req.user.id ? session.userId2 : session.userId1;
  const sender = await User.findById(req.user.id);
  const receiver = await User.findById(receiverId);

  const newMessage = new Message({
    sessionId,
    senderId: req.user.id,
    receiverId,
    content,
    mediaUrl,
    mediaType,
  });

  await newMessage.save();

  // ✅ FIX 4: Emit only to the specific session room, not everyone
  sessionSocket.to(sessionId).emit('receive_message', {
    content,
    sender: { name: sender.name, id: sender._id },
    receiver: { name: receiver.name, id: receiver._id },
    sessionId,
    mediaUrl,
    mediaType,
  });

  res.json({ msg: 'Message sent successfully', message: newMessage });
};

// Get all messages for a specific session
const getMessages = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const messages = await Message.find({ sessionId })
      .populate('senderId', 'name')
      .populate('receiverId', 'name');
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err.message);
    res.status(500).send('Server error');
  }
};

// Schedule a new session
const scheduleSession = async (req, res) => {
  const { sessionId, newMeetingDate, newMeetingTime } = req.body;

  if (!sessionId || !newMeetingDate || !newMeetingTime) {
    return res.status(400).json({ msg: 'SessionId, newMeetingDate, and newMeetingTime are required' });
  }

  try {
    const session = await Session.findById(new mongoose.Types.ObjectId(sessionId));
    if (!session) return res.status(404).json({ msg: 'Session not found' });

    session.newMeetingDate = new Date(newMeetingDate);
    session.newMeetingTime = newMeetingTime;
    await session.save();

    const skill = session.skill;
    const message = `You have a new meeting scheduled for ${newMeetingDate} at ${newMeetingTime} regarding the skill: ${skill}.`;
    sendNewMeetingScheduledNotification(session, message);

    res.json({ msg: 'Session scheduled successfully', session });
  } catch (err) {
    console.error('Error scheduling session:', err.message);
    res.status(500).send('Server error');
  }
};

const markSessionAsCompletedOrCanceled = async (req, res) => {
  const { sessionId, status, rating, feedback } = req.body;
  const userId = req.user.id;

  try {
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ msg: 'Session not found' });

    if (![session.userId1.toString(), session.userId2.toString()].includes(userId)) {
      return res.status(403).json({ msg: 'You are not authorized to mark this session' });
    }

    const update = { status };

    if (status === 'completed') {
      if (session.userId1.toString() === userId) {
        update.ratingByUser1 = rating;
        update.feedbackByUser1 = feedback;
        update.feedbackGivenByUser1 = true;
      } else {
        update.ratingByUser2 = rating;
        update.feedbackByUser2 = feedback;
        update.feedbackGivenByUser2 = true;
      }
      if (session.feedbackGivenByUser1 && session.feedbackGivenByUser2) {
        session.sessionClosed = true;
      }
      await Session.findByIdAndUpdate(sessionId, update, { new: true });
      const otherUserId = session.userId1.toString() === userId ? session.userId2 : session.userId1;
      await sendNotificationForFeedbackRequest(otherUserId);
      return res.json({ msg: 'Session updated successfully' });
    } else {
      if (session.userId1.toString() === userId) {
        update.ratingByUser1 = rating;
        update.feedbackByUser1 = feedback;
        update.feedbackGivenByUser1 = true;
      } else {
        update.ratingByUser2 = rating;
        update.feedbackByUser2 = feedback;
        update.feedbackGivenByUser2 = true;
      }
      update.sessionClosed = true;
      await Session.findByIdAndUpdate(sessionId, update, { new: true });
      await sendNotificationForSessionCancellation(session.userId1);
      await sendNotificationForSessionCancellation(session.userId2);
      return res.json({ msg: 'Session canceled successfully' });
    }
  } catch (error) {
    console.error('Error marking session:', error);
    return res.status(500).send('Server error');
  }
};

const getUserAverageRating = async (req, res) => {
  const { userId } = req.params;
  try {
    const sessions = await Session.find({
      $or: [{ userId1: userId }, { userId2: userId }]
    });

    let totalRating = 0;
    let count = 0;

    sessions.forEach(session => {
      if (session.userId1.toString() === userId && session.ratingByUser2 !== null) {
        totalRating += session.ratingByUser2;
        count++;
      } else if (session.userId2.toString() === userId && session.ratingByUser1 !== null) {
        totalRating += session.ratingByUser1;
        count++;
      }
    });

    const averageRating = count > 0 ? (totalRating / count).toFixed(2) : 'N/A';
    res.json({ averageRating });
  } catch (err) {
    console.error('Error fetching user ratings:', err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  upload,
  sendSessionRequest,
  acceptSessionRequest,
  getPendingSessions,
  getAcceptedSessions,
  getCompletedSessions,
  getCanceledSessions,
  sendMessage,
  getMessages,
  setSocketIO,
  scheduleSession,
  markSessionAsCompletedOrCanceled,
  getUserAverageRating,
  getOnlyAcceptedSessions,
};
