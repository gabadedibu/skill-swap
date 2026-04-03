// src/pages/SkillMatchingPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import Background from "../components/background/Background";
import "../components/background/Background.css";
import { FaPaperPlane, FaSearch } from 'react-icons/fa';
import MatchList from '../components/MatchList';
import SessionSchedulingModal from '../components/session/SessionSchedulingModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from "../components/footer/Footer";
import "./SkillMatchingPage.css";

const SkillMatchingPage = () => {
  const [matches, setMatches] = useState([]);
  const [ratings, setRatings] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionDetails, setSessionDetails] = useState({});
  const navigate = useNavigate();
  const [errorMessages, setErrorMessages] = useState({ date: '', time: '' });

  useEffect(() => {
    const fetchMatches = async () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (!token || !user) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/matches', {
          headers: { 'x-auth-token': token },
        });

        console.log('Fetched Matches:', response.data);
        setMatches(response.data);

        const ratingsPromises = response.data.map(async (match) => {
          const userId = match.user._id;
          const ratingResponse = await axios.get(`http://localhost:5000/api/sessions/ratings/${userId}`, {
            headers: { 'x-auth-token': token },
          });
          return { userId, averageRating: ratingResponse.data.averageRating };
        });

        const ratingsData = await Promise.all(ratingsPromises);
        const ratingsMap = ratingsData.reduce((acc, { userId, averageRating }) => {
          acc[userId] = averageRating;
          return acc;
        }, {});
        setRatings(ratingsMap);
      } catch (err) {
        console.error('Error fetching matches:', err);
      }
    };

    fetchMatches();
  }, [navigate]);

  const handleScheduleSession = (userId) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  const sendSessionRequest = async (userId) => {
    const token = localStorage.getItem('token');
    const { date, time } = sessionDetails[userId] || {};
    const skill = matches.find(match => match.user._id === userId)?.teachSkill;

    const newErrorMessages = { ...errorMessages };
    newErrorMessages[userId] = {};

    if (!date) {
      newErrorMessages[userId].date = 'Please select a date';
    } else {
      const today = new Date();
      const selectedDate = new Date(date + "T00:00:00");
      if (selectedDate < today.setHours(0, 0, 0, 0)) {
        newErrorMessages[userId].date = 'Selected date is in the past';
      }
    }

    setSessionDetails((prev) => ({
      ...prev,
      [userId]: { date: '', time: '' },
    }));

    if (!time) {
      newErrorMessages[userId].time = 'Please select a time';
    } else {
      const today = new Date();
      const selectedDate = new Date(date + "T00:00:00");
      if (selectedDate.getTime() === today.setHours(0, 0, 0, 0) && time && new Date(`${date}T${time}`).getTime() < Date.now()) {
        newErrorMessages[userId].time = 'Selected time is in the past';
      }
    }

    setErrorMessages(newErrorMessages);

    if (newErrorMessages[userId]?.date || newErrorMessages[userId]?.time) {
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/sessions/request',
        { userId2: userId, sessionDate: date, sessionTime: time, skill },
        { headers: { 'x-auth-token': token } }
      );

      await axios.post(
        'http://localhost:5000/api/notifications/send',
        {
          userId,
          message: `You have a new session request for ${skill} on ${date} at ${time}`,
          type: 'session_request',
        },
        { headers: { 'x-auth-token': token } }
      );

      toast.success('Session request sent successfully!', {
        autoClose: 2000,
        style: {
          background: 'linear-gradient(135deg, #6366f1, #818cf8)',
          color: '#ffffff',
          fontWeight: '500',
          padding: '12px 16px',
          borderRadius: '12px',
        },
        progressStyle: {
          background: 'rgba(255,255,255,0.4)',
          height: '3px',
          borderRadius: '2px',
        },
        icon: false,
      });
    } catch (err) {
      console.error('Error sending session request:', err);
      toast.error('Error sending session request. Please try again.');
    }
  };

  return (
    <div className="smp-root">
      <Background />
      <div className="smp-grid" />
      <div className="smp-orb" />

      <div className="smp-content">
        <Navbar />

        <div className="smp-inner">
          {/* Header */}
          <div className="smp-header">
            <span className="smp-eyebrow">
              <span className="smp-eyebrow-dot" />
              Peer Matching
            </span>
            <h1 className="smp-title">Skill Matching</h1>
            <p className="smp-subtitle">
              Browse your matches and schedule a session to share your skills.
            </p>
          </div>

          {/* Search */}
          <div className="smp-search-wrap">
            <FaSearch className="smp-search-icon" />
            <input
              type="text"
              placeholder="Search by name or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="smp-search-input"
            />
          </div>

          {/* Cards grid */}
          <div className="smp-grid-cards">
            {matches.length > 0 ? (
              matches
                .filter((match) =>
                  match.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  match.teachSkill.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((match) => (
                  <div key={`${match.user._id}-${match.teachSkill}`} className="smp-card">
                    {/* Top shimmer */}
                    <div className="smp-card-bar" />

                    {/* User header */}
                    <div className="smp-card-header">
                      <img
                        className="smp-avatar"
                        src={match.user?.profilePicture
                          ? `http://localhost:5000/uploads/profile-pictures/${match.user.profilePicture}`
                          : '/default-avatar.png'}
                        alt="Avatar"
                      />
                      <div className="smp-card-user">
                        <div className="smp-card-name-row">
                          <span className="smp-card-name">{match.user.name}</span>
                          <span className="smp-skill-badge">{match.teachSkill}</span>
                        </div>
                        <div className="smp-card-meta">
                          <span className="smp-card-status">{match.user.status || ''}</span>
                          <span className="smp-card-rating">
                            {ratings[match.user._id] || 'N/A'} ★
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="smp-card-divider" />

                    {/* Date & Time */}
                    <div className="smp-fields">
                      <div className="smp-field-group">
                        <label className="smp-label">Date</label>
                        <input
                          type="date"
                          value={sessionDetails[match.user._id]?.date || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSessionDetails((prev) => ({
                              ...prev,
                              [match.user._id]: { ...prev[match.user._id], date: value },
                            }));
                            setErrorMessages((prev) => ({
                              ...prev,
                              [match.user._id]: {
                                ...prev[match.user._id],
                                date: value ? '' : prev[match.user._id]?.date,
                              },
                            }));
                          }}
                          className="smp-input"
                        />
                        {errorMessages[match.user._id]?.date && (
                          <p className="smp-error">{errorMessages[match.user._id].date}</p>
                        )}
                      </div>

                      <div className="smp-field-group">
                        <label className="smp-label">Time</label>
                        <input
                          type="time"
                          value={sessionDetails[match.user._id]?.time || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSessionDetails((prev) => ({
                              ...prev,
                              [match.user._id]: { ...prev[match.user._id], time: value },
                            }));
                            setErrorMessages((prev) => ({
                              ...prev,
                              [match.user._id]: {
                                ...prev[match.user._id],
                                time: value ? '' : prev[match.user._id]?.time,
                              },
                            }));
                          }}
                          className="smp-input"
                        />
                        {errorMessages[match.user._id]?.time && (
                          <p className="smp-error">{errorMessages[match.user._id].time}</p>
                        )}
                      </div>
                    </div>

                    {/* Send button */}
                    <button
                      onClick={() => sendSessionRequest(match.user._id)}
                      className="smp-send-btn"
                    >
                      <FaPaperPlane className="smp-send-icon" />
                      Send Session Request
                    </button>
                  </div>
                ))
            ) : (
              <div className="smp-empty">No matches found</div>
            )}
          </div>

          <ToastContainer />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SkillMatchingPage;
