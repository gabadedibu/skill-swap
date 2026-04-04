import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import Navbar from '../components/navbar/Navbar';
import MessageInput from '../components/chat/MessageInput';
import { useNavigate, useParams } from 'react-router-dom';
import { FiCalendar } from 'react-icons/fi';
import Footer from "../components/footer/Footer";
import { IoMdWarning } from 'react-icons/io';
import './ChatPage.css';

const ChatPage = () => {
  const { sessionId } = useParams();
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [notificationSocket, setNotificationSocket] = useState(null);
  const [rating, setRating] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const loggedInUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch accepted session connections
  useEffect(() => {
    const fetchConnections = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('https://skill-swap-9y9h.onrender.com/api/sessions/accepted', {
          headers: { 'x-auth-token': token },
        });
        setConnections(response.data);
        if (sessionId) {
          const connection = response.data.find((conn) => conn._id === sessionId);
          setSelectedConnection(connection);
        }
      } catch (err) {
        console.error('Error fetching connections:', err);
      }
    };
    fetchConnections();
  }, [sessionId]);

  // Socket.io chat connection
  useEffect(() => {
    if (!sessionId) return;
    const socketIo = io('https://skill-swap-9y9h.onrender.com/sessions', {
      transports: ['websocket'],
      query: { sessionId },
    });

    socketIo.on('connect', () => console.log('WebSocket connected:', socketIo.id));

    socketIo.on('receive_message', (data) => {
      if (data.isSystem) {
        // ✅ System message (meeting reminder)
        setMessages((prev) => [...prev, {
          content: data.content,
          senderName: 'System',
          isSystem: true,
          senderId: null,
        }]);
      } else if (data.sender && data.receiver) {
        // ✅ Regular user message
        setMessages((prev) => [...prev, {
          ...data,
          senderName: data.sender.name,
          receiverName: data.receiver.name,
          senderId: { _id: data.sender.id },
        }]);
      }
    });

    setSocket(socketIo);
    return () => socketIo.disconnect();
  }, [sessionId]);

  // Notification socket
  useEffect(() => {
    const socketIoNotification = io('https://skill-swap-9y9h.onrender.com/notifications', {
      transports: ['websocket'],
    });
    socketIoNotification.on('connect', () => console.log('Notification WebSocket connected'));
    setNotificationSocket(socketIoNotification);
    const userId = JSON.parse(localStorage.getItem('user'))._id;
    socketIoNotification.emit('subscribeToNotifications', userId);
    return () => socketIoNotification.disconnect();
  }, []);

  // Fetch messages for selected connection
  useEffect(() => {
    if (!selectedConnection) return;
    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(
          `https://skill-swap-9y9h.onrender.com/api/sessions/message/${selectedConnection._id}`,
          { headers: { 'x-auth-token': token } }
        );
        setMessages(response.data.map((msg) => ({
          ...msg,
          senderName: msg.senderId?.name || 'System',
          receiverName: msg.receiverId?.name || 'Unknown',
          // ✅ Mark as system if senderId is null
          isSystem: !msg.senderId,
        })));
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    fetchMessages();
  }, [selectedConnection]);

  const handleSelectConnection = (connection) => {
    setSelectedConnection(connection);
    navigate(`/chat/${connection._id}`);
  };

  // ✅ FIX: Now accepts 3 args — message, file, link
  const handleSendMessage = (message, file, link) => {
    if (selectedConnection?.status === 'completed' || selectedConnection?.status === 'canceled') {
      alert('You cannot send messages for completed or canceled sessions.');
      return;
    }
    if (message.trim() === '' && !file && !link) return;

    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user'));
    const formData = new FormData();
    formData.append('sessionId', selectedConnection._id);
    formData.append('content', message);
    if (file) formData.append('file', file);
    if (link) formData.append('link', link);

    socket.emit('send_message', {
      sessionId: selectedConnection._id,
      content: message,
      senderId: userData?._id,
      receiverId: selectedConnection.userId1._id === userData?._id
        ? selectedConnection.userId2._id
        : selectedConnection.userId1._id,
      file,
      link,
    });

    axios.post('https://skill-swap-9y9h.onrender.com/api/sessions/message', formData, {
      headers: { 'x-auth-token': token },
    }).catch((err) => console.error('Error sending message:', err));
  };

  const handleScheduleSession = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        'https://skill-swap-9y9h.onrender.com/api/sessions/schedule',
        { sessionId, newMeetingDate: scheduledDate, newMeetingTime: scheduledTime },
        { headers: { 'x-auth-token': token } }
      );
      setIsScheduleModalOpen(false);
    } catch (error) {
      console.error('Error scheduling session:', error);
    }
  };

  const handleMarkSession = async (status) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!feedback) { alert('Please provide feedback before marking the session.'); return; }
    try {
      await axios.post(
        'https://skill-swap-9y9h.onrender.com/api/sessions/mark-session',
        { sessionId, status, rating, feedback },
        { headers: { 'x-auth-token': token } }
      );
      setIsFeedbackModalOpen(false);
      const updated = await axios.get('https://skill-swap-9y9h.onrender.com/api/sessions/accepted', {
        headers: { 'x-auth-token': token },
      });
      setSelectedConnection(updated.data.find((s) => s._id === sessionId));
    } catch (error) {
      console.error('Error marking session:', error);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    const currentSessionId = selectedConnection._id;
    const targetUser = selectedConnection.userId1._id === loggedInUser._id
      ? selectedConnection.userId2._id
      : selectedConnection.userId1._id;
    if (!targetUser || !currentSessionId) { alert('Invalid session or target user.'); return; }

    const formData = new FormData();
    formData.append('reason', reason);
    formData.append('description', description);
    formData.append('reporter', loggedInUser._id);
    formData.append('targetUser', targetUser);
    formData.append('session', currentSessionId);
    if (screenshot) formData.append('screenshot', screenshot);

    const token = localStorage.getItem('token');
    try {
      await axios.post('https://skill-swap-9y9h.onrender.com/api/reports', formData, {
        headers: { 'x-auth-token': token },
      });
      alert('Report submitted successfully');
      setReason(''); setDescription(''); setScreenshot(null);
      setIsReportModalOpen(false);
    } catch (error) {
      alert('Error submitting report: ' + (error.response?.data?.message || error.message));
    }
  };

  const isUser1 = selectedConnection?.userId1?._id === loggedInUser?._id;
  const isUser2 = selectedConnection?.userId2?._id === loggedInUser?._id;
  const bothUsersProvidedFeedback = selectedConnection?.feedbackByUser1 && selectedConnection?.feedbackByUser2;
  const isSessionCompletedOrCanceled = selectedConnection?.status === 'completed' || selectedConnection?.status === 'canceled';
  const isChatBlocked = isSessionCompletedOrCanceled && bothUsersProvidedFeedback;
  const shouldShowScheduleButton = !isSessionCompletedOrCanceled && !bothUsersProvidedFeedback;

  const getOtherUserName = (connection) => {
    if (!connection) return 'Unknown';
    return connection.userId1?._id === loggedInUser._id
      ? connection.userId2?.name || 'Unknown'
      : connection.userId1?.name || 'Unknown';
  };

  const getChatUserName = () => {
    if (!selectedConnection?.userId1 || !selectedConnection?.userId2) return 'Unknown';
    return selectedConnection.userId1._id === loggedInUser._id
      ? selectedConnection.userId2?.name || 'Unknown'
      : selectedConnection.userId1?.name || 'Unknown';
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  return (
    <div className="chat-root">
      <div className="chat-grid" />
      <div className="chat-glow" />
      <div className="chat-glow-2" />

      <Navbar />

      <button className="chat-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
      <div className={`chat-backdrop ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)} />

      <div className="chat-body">
        {/* Left Panel */}
        <div className={`chat-left ${isMenuOpen ? 'open' : ''}`}>
          <h2 className="chat-left-title">Connections</h2>
          <div className="chat-connections">
            {connections.length > 0 ? (
              connections.map((connection) => (
                <div
                  key={connection._id}
                  className={`chat-conn-card ${selectedConnection?._id === connection._id ? 'active' : ''}`}
                  onClick={() => { handleSelectConnection(connection); setIsMenuOpen(false); }}
                >
                  <p className="chat-conn-name">{getOtherUserName(connection)}</p>
                  <p className="chat-conn-skill">Skill: {connection.skill || 'Eclipse OCL'}</p>
                  <p className="chat-conn-date">{formatDate(connection.sessionDate)} at {connection.sessionTime}</p>
                </div>
              ))
            ) : (
              <p className="chat-no-connections">No connections available.</p>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="chat-right">
          {selectedConnection ? (
            <>
              <div className="chat-header">
                <h2 className="chat-header-name">Chat with {getChatUserName()}</h2>
                <p className="chat-header-skill">Skill: {selectedConnection.skill || 'Eclipse OCL'}</p>
              </div>

              <div className="chat-messages">
                {messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <div key={index} className={`chat-msg ${msg.isSystem ? 'chat-msg-system' : ''}`}>
                      {!msg.isSystem && <strong>{msg.senderName}: </strong>}
                      <span dangerouslySetInnerHTML={{ __html: msg.content }} />
                      {msg.mediaType === 'image' && <img src={msg.mediaUrl} alt="file" />}
                      {msg.mediaType === 'audio' && <audio controls><source src={msg.mediaUrl} /></audio>}
                      {msg.mediaType === 'video' && <video controls><source src={msg.mediaUrl} /></video>}
                    </div>
                  ))
                ) : (
                  <p className="chat-no-messages">No messages yet</p>
                )}
                <div ref={messagesEndRef} />
              </div>

              {isSessionCompletedOrCanceled && (
                <div className="chat-feedback-display">
                  <h3>Feedback from User 1:</h3>
                  <p>{selectedConnection?.feedbackByUser1 || '—'}</p>
                  <h3>Feedback from User 2:</h3>
                  <p>{selectedConnection?.feedbackByUser2 || '—'}</p>
                </div>
              )}

              {/* ✅ Pass loggedInUserId to MessageInput isn't needed but pass it to history if used */}
              {!isChatBlocked && <MessageInput sendMessage={handleSendMessage} />}

              <div className="chat-actions">
                {shouldShowScheduleButton && (
                  <button className="chat-btn chat-btn-primary" onClick={() => setIsScheduleModalOpen(true)}>
                    <FiCalendar /> Schedule Next Meeting
                  </button>
                )}
                {!isChatBlocked && !isSessionCompletedOrCanceled && (
                  <>
                    <button className="chat-btn chat-btn-success" onClick={() => handleMarkSession('completed')}>Mark as Completed</button>
                    <button className="chat-btn chat-btn-danger" onClick={() => handleMarkSession('canceled')}>Mark as Canceled</button>
                  </>
                )}
                <button className="chat-btn chat-btn-danger" onClick={() => { setIsReportModalOpen(true); setReportSuccess(false); }}>
                  <IoMdWarning /> Report User
                </button>
                {!isChatBlocked && !bothUsersProvidedFeedback && (
                  <button className="chat-btn chat-btn-primary" onClick={() => setIsFeedbackModalOpen(true)}>Provide Feedback</button>
                )}
              </div>
            </>
          ) : (
            <div className="chat-empty">
              <span className="chat-empty-icon">💬</span>
              <p className="chat-empty-text">Select a connection to start chatting</p>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Feedback Modal */}
      {isFeedbackModalOpen && (
        <div className="chat-modal-overlay">
          <div className="chat-modal">
            <div className="chat-modal-bar" />
            <button className="chat-modal-close" onClick={() => setIsFeedbackModalOpen(false)}>&times;</button>
            <h3 className="chat-modal-title">We'd Love Your Feedback</h3>
            <label className="chat-modal-label">Rating
              <select className="chat-modal-select" value={rating} onChange={(e) => setRating(e.target.value)}>
                {[...Array(5)].map((_, i) => <option key={i} value={i + 1}>{i + 1} Star{i + 1 > 1 ? 's' : ''}</option>)}
              </select>
            </label>
            <label className="chat-modal-label">Your feedback
              <textarea className="chat-modal-textarea" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Write your feedback..." />
            </label>
            <button className="chat-modal-btn" onClick={() => setIsFeedbackModalOpen(false)}>Submit Feedback</button>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="chat-modal-overlay">
          <div className="chat-modal">
            <div className="chat-modal-bar" />
            <button className="chat-modal-close" onClick={() => setIsScheduleModalOpen(false)}>&times;</button>
            <h3 className="chat-modal-title">Schedule Next Meeting</h3>
            <label className="chat-modal-label">Select Date
              <input type="date" className="chat-modal-input" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
            </label>
            <label className="chat-modal-label">Select Time
              <input type="time" className="chat-modal-input" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
            </label>
            <button className="chat-modal-btn" onClick={handleScheduleSession}>Confirm Schedule</button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="chat-modal-overlay">
          <div className="chat-modal">
            <div className="chat-modal-bar" />
            <button className="chat-modal-close" onClick={() => setIsReportModalOpen(false)}>&times;</button>
            <h3 className="chat-modal-title">Report User</h3>
            <form onSubmit={handleReportSubmit}>
              <label className="chat-modal-label">Reason
                <select className="chat-modal-select" value={reason} onChange={(e) => setReason(e.target.value)} required>
                  <option value="">Select Reason</option>
                  <option value="Spam">Spam</option>
                  <option value="Harassment">Harassment</option>
                  <option value="Inappropriate Behavior">Inappropriate Behavior</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="chat-modal-label">Description
                <textarea className="chat-modal-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue" required />
              </label>
              <label className="chat-modal-label">Screenshot (optional)
                <input type="file" className="chat-modal-input" accept="image/*" onChange={(e) => setScreenshot(e.target.files[0])} />
              </label>
              <button type="submit" className="chat-modal-btn">Submit Report</button>
            </form>
            {reportSuccess && <div className="chat-report-success">✓ Report submitted successfully!</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
