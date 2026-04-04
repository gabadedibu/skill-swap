// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/navbar/Navbar";
import NotificationBell from "../components/NotificationBell";
import ProfileCard from "../components/ProfileCard";
import { FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiCalendar, FiClock, FiMessageSquare, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { setNotifications } from "../redux/slices/notificationSlice";
import Background from "../components/background/Background";
import "../components/background/Background.css";
import Footer from "../components/footer/Footer";
import defaultAvatar from "../assets/avatar.jpeg";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./ProfilePage.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [skillsToTeach, setSkillsToTeach] = useState([]);
  const [skillsToLearn, setSkillsToLearn] = useState([]);
  const [modalTeach, setModalTeach] = useState("");
  const [modalLearn, setModalLearn] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingSessions, setPendingSessions] = useState([]);
  const [acceptedSessions, setAcceptedSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [canceledSessions, setCanceledSessions] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const { data } = await axios.get("https://skill-swap-9y9h.onrender.com/api/users/profile", {
          headers: { "x-auth-token": token },
        });
        setUser(data);
        setSkillsToTeach(data.skillsToTeach);
        setSkillsToLearn(data.skillsToLearn);
        const notifRes = await axios.get(`https://skill-swap-9y9h.onrender.com/api/notifications/${data._id}`, {
          headers: { "x-auth-token": token },
        });
        dispatch(setNotifications(notifRes.data));
      } catch {
        setError("Failed to load profile or notifications.");
      }
    };
    fetchUserProfile();
  }, [dispatch]);

  useEffect(() => {
    const fetchSessions = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const [p, a, co, c] = await Promise.all([
          axios.get("https://skill-swap-9y9h.onrender.com/api/sessions/pending", { headers: { "x-auth-token": token } }),
          axios.get("https://skill-swap-9y9h.onrender.com/api/sessions/acceptedOnly", { headers: { "x-auth-token": token } }),
          axios.get("https://skill-swap-9y9h.onrender.com/api/sessions/completed", { headers: { "x-auth-token": token } }),
          axios.get("https://skill-swap-9y9h.onrender.com/api/sessions/canceled", { headers: { "x-auth-token": token } }),
        ]);
        const now = new Date();
        setPendingSessions(p.data.filter((s) => new Date(s.sessionDate) >= now));
        setAcceptedSessions(a.data);
        setCompletedSessions(co.data);
        setCanceledSessions(c.data);
      } catch {
        setError("Error fetching sessions");
      }
    };
    fetchSessions();
  }, []);

  const openModal = () => {
    setModalTeach(skillsToTeach.join(", "));
    setModalLearn(skillsToLearn.join(", "));
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError("");
    setSuccess("");
  };

  const handleUpdateProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      const { data } = await axios.put(
        "https://skill-swap-9y9h.onrender.com/api/users/profile",
        {
          name: user.name,
          status: user.status,
          socials: user.socials,
          skillsToTeach: modalTeach.split(",").map((s) => s.trim()),
          skillsToLearn: modalLearn.split(",").map((s) => s.trim()),
        },
        { headers: { "x-auth-token": token } }
      );
      setUser(data);
      setSkillsToTeach(data.skillsToTeach);
      setSkillsToLearn(data.skillsToLearn);
      setSuccess("Profile updated successfully!");
      closeModal();
    } catch {
      setError("Failed to update profile.");
    }
  };

  const handleAccept = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        "https://skill-swap-9y9h.onrender.com/api/sessions/accept",
        { sessionId: id },
        { headers: { "x-auth-token": token } }
      );
      setPendingSessions((ps) => ps.filter((s) => s._id !== id));
      setAcceptedSessions((as) => [...as, res.data.session]);
      setSuccess("Session accepted");
    } catch {
      setError("Failed to accept session.");
    }
  };

  const handleStartChat = (id) => navigate(`/chat/${id}`);

  const getSessionPartnerName = (session) => {
    const partner = session.userId1?._id === user?._id ? session.userId2 : session.userId1;
    return partner?.name ?? "Unknown User";
  };

  const totalSessions =
    pendingSessions.length + completedSessions.length + canceledSessions.length + acceptedSessions.length;

  const progressStats = [
    { label: "Completed", count: completedSessions.length, color: "#34d399" },
    { label: "Pending",   count: pendingSessions.length,   color: "#fbbf24" },
    { label: "Upcoming",  count: acceptedSessions.length,  color: "#818cf8" },
    { label: "Canceled",  count: canceledSessions.length,  color: "#f87171" },
  ];

  const tabs = ["pending", "upcoming", "completed", "canceled"];
  const sessionMap = {
    pending: pendingSessions,
    upcoming: acceptedSessions,
    completed: completedSessions,
    canceled: canceledSessions,
  };

  if (!user) {
    return (
      <div className="pp-loading">
        <div className="pp-spinner" />
      </div>
    );
  }

  return (
    <div className="pp-root">
      <Background />
      <div className="pp-grid" />
      <div className="pp-orb" />

      <div className="pp-content">
        <Navbar />

        <div className="pp-inner">
          {/* ── Hero profile card ── */}
          <div className="pp-hero-card">
            <div className="pp-card-bar" />

            {/* Controls */}
            <div className="pp-hero-controls">
              <NotificationBell />
              <button onClick={() => navigate("/profile-settings")} className="pp-edit-btn" title="Edit Profile">
                <FiEdit size={18} />
              </button>
            </div>

            {/* Avatar + Info */}
            <div className="pp-hero-left">
              <div className="pp-avatar-ring">
                <img
                  src={user?.profilePicture
                    ? `https://skill-swap-9y9h.onrender.com/uploads/profile-pictures/${user.profilePicture}`
                    : defaultAvatar}
                  alt="Profile"
                  className="pp-avatar-img"
                />
              </div>
              <div className="pp-hero-info">
                <h2 className="pp-hero-name">{user?.name || "User"}</h2>
                <p className="pp-hero-welcome">Welcome to your profile!</p>
                {user?.status && (
                  <span className="pp-status-badge">{user.status}</span>
                )}
                {user?.socials && (
                  <div className="pp-socials">
                    {user.socials.linkedin && (
                      <a href={user.socials.linkedin} target="_blank" rel="noreferrer" className="pp-social-link">
                        <FaLinkedin />
                      </a>
                    )}
                    {user.socials.facebook && (
                      <a href={user.socials.facebook} target="_blank" rel="noreferrer" className="pp-social-link">
                        <FaFacebook />
                      </a>
                    )}
                    {user.socials.twitter && (
                      <a href={user.socials.twitter} target="_blank" rel="noreferrer" className="pp-social-link">
                        <FaInstagram />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Progress rings */}
            <div className="pp-progress-row">
              {progressStats.map(({ label, count, color }) => (
                <div key={label} className="pp-progress-item">
                  <CircularProgressbar
                    value={(count / (totalSessions || 1)) * 100}
                    text={`${count}`}
                    styles={buildStyles({
                      textSize: "28px",
                      textColor: "#e0e7ff",
                      pathColor: color,
                      trailColor: "rgba(255,255,255,0.08)",
                    })}
                  />
                  <p className="pp-progress-label">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {success && <div className="pp-feedback pp-feedback--success"><span className="pp-feedback-dot" />{success}</div>}
          {error   && <div className="pp-feedback pp-feedback--error"><span className="pp-feedback-dot" />{error}</div>}

          {/* ── Two-column section ── */}
          <div className="pp-two-col">
            {/* Skills card */}
            <div className="pp-card">
              <div className="pp-card-bar" />
              <div className="pp-card-header">
                <span className="pp-card-title">Your Skills</span>
                <button onClick={openModal} className="pp-icon-btn"><FiEdit size={15} /></button>
              </div>

              <div className="pp-skills-section">
                <p className="pp-skills-label">Can Teach</p>
                <div className="pp-tags">
                  {skillsToTeach.length > 0
                    ? skillsToTeach.flatMap(s => s.split(",").map(x => x.trim())).map((s, i) => (
                        <span key={i} className="pp-tag pp-tag--teach">{s}</span>
                      ))
                    : <span className="pp-tag-empty">None added yet</span>}
                </div>
              </div>

              <div className="pp-skills-section">
                <p className="pp-skills-label">Want to Learn</p>
                <div className="pp-tags">
                  {skillsToLearn.length > 0
                    ? skillsToLearn.flatMap(s => s.split(",").map(x => x.trim())).map((s, i) => (
                        <span key={i} className="pp-tag pp-tag--learn">{s}</span>
                      ))
                    : <span className="pp-tag-empty">None added yet</span>}
                </div>
              </div>
            </div>

            {/* Sessions card */}
            <div className="pp-card pp-card--sessions">
              <div className="pp-card-bar" />
              <div className="pp-card-header">
                <span className="pp-card-title">Your Sessions</span>
              </div>

              {/* Tabs */}
              <div className="pp-tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pp-tab ${activeTab === tab ? "pp-tab--active" : ""}`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Session list */}
              <div className="pp-session-list">
                {sessionMap[activeTab].length > 0 ? (
                  sessionMap[activeTab].map((s) => (
                    <div key={s._id} className="pp-session-item">
                      <div className="pp-session-top">
                        <div className="pp-session-initials">
                          {(s.userId1?.name || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <div className="pp-session-info">
                          <span className="pp-session-name">{getSessionPartnerName(s)}</span>
                          <span className="pp-session-skill">{s.skill}</span>
                        </div>
                      </div>
                      <div className="pp-session-meta">
                        <span className="pp-session-meta-item"><FiCalendar size={11} />{formatDate(s.sessionDate)}</span>
                        <span className="pp-session-meta-item"><FiClock size={11} />{formatTime(s.sessionDate)}</span>
                      </div>
                      <button
                        onClick={() => activeTab === "pending" ? handleAccept(s._id) : handleStartChat(s._id)}
                        className={`pp-session-btn ${activeTab === "pending" ? "pp-session-btn--accept" : "pp-session-btn--chat"}`}
                      >
                        {activeTab === "pending" ? <><FiCheck size={12} /> Accept</> :
                         activeTab === "upcoming" ? <><FiMessageSquare size={12} /> Start Chat</> : "View Feedback"}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="pp-session-empty">
                    No {activeTab} sessions.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Edit Skills Modal ── */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className="pp-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="pp-modal"
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              >
                <div className="pp-modal-bar" />
                <h2 className="pp-modal-title">Update Your Skills</h2>

                {error   && <div className="pp-feedback pp-feedback--error"><span className="pp-feedback-dot" />{error}</div>}
                {success && <div className="pp-feedback pp-feedback--success"><span className="pp-feedback-dot" />{success}</div>}

                <div className="pp-modal-field">
                  <label className="pp-modal-label">Skills You Can Teach</label>
                  <input
                    type="text"
                    value={modalTeach}
                    onChange={(e) => setModalTeach(e.target.value)}
                    className="pp-modal-input"
                    placeholder="e.g. JavaScript, Python"
                  />
                </div>
                <div className="pp-modal-field">
                  <label className="pp-modal-label">Skills You Want to Learn</label>
                  <input
                    type="text"
                    value={modalLearn}
                    onChange={(e) => setModalLearn(e.target.value)}
                    className="pp-modal-input"
                    placeholder="e.g. React, Data Science"
                  />
                </div>

                <div className="pp-modal-actions">
                  <button onClick={closeModal} className="pp-modal-cancel">Cancel</button>
                  <button onClick={handleUpdateProfile} className="pp-modal-save">Save Changes</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </div>
  );
};

export default ProfilePage;
