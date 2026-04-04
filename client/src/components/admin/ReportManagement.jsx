import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchReports,
  resolveReport,
  fetchSessionChats,
  blockUser
} from '../../redux/slices/adminSlice';
import { FaComments } from 'react-icons/fa';
import { FiCheck, FiSlash, FiX } from 'react-icons/fi';
import './ReportManagement.css';

const ReportManagement = () => {
  const dispatch = useDispatch();
  const storeReports = useSelector(state => state.admin.reports);
  const { loading, error, sessionChats, loadingChats, errorChats } = useSelector(state => state.admin);

  const [reports, setReports] = useState([]);
  const [blockedUserName, setBlockedUserName] = useState('');
  const [activeSession, setActiveSession] = useState('');

  useEffect(() => { dispatch(fetchReports()); }, [dispatch]);
  useEffect(() => { setReports(storeReports); }, [storeReports]);

  const handleResolve = id => {
    dispatch(resolveReport(id)).then(() => {
      setReports(prev => prev.filter(r => r._id !== id));
    });
  };

  const handleBlock = (userId, userName) => {
    dispatch(blockUser(userId)).then(() => setBlockedUserName(userName));
  };

  const viewChats = sessionId => {
    setActiveSession(sessionId);
    dispatch(fetchSessionChats(sessionId));
  };

  return (
    <div className="rm-root">
      {/* Page header */}
      <div className="rm-header">
        <span className="rm-eyebrow"><span className="rm-eyebrow-dot" />Reports</span>
        <h2 className="rm-title">Report Management</h2>
        <p className="rm-subtitle">Review, resolve, and act on user-submitted reports.</p>
      </div>

      {/* Blocked banner */}
      {blockedUserName && (
        <div className="rm-banner rm-banner--block">
          <span className="rm-banner-dot" />
          <span>User <strong>{blockedUserName}</strong> has been blocked.</span>
          <button className="rm-banner-close" onClick={() => setBlockedUserName('')}>
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* States */}
      {loading && (
        <div className="rm-state">
          <div className="rm-spinner" />
          <span>Loading reports…</span>
        </div>
      )}
      {error && (
        <div className="rm-banner rm-banner--error">
          <span className="rm-banner-dot" />{error}
        </div>
      )}

      {/* Report cards */}
      <div className="rm-list">
        {reports.map(r => (
          <div key={r._id} className="rm-card">
            <div className="rm-card-bar" />

            {/* Card header */}
            <div className="rm-card-header">
              <div className="rm-card-meta">
                {r.reporter && (
                  <div className="rm-meta-row">
                    <span className="rm-meta-label">Reporter</span>
                    <span className="rm-meta-value">{r.reporter.name}
                      <span className="rm-meta-email"> · {r.reporter.email}</span>
                    </span>
                  </div>
                )}
                {r.targetUser && (
                  <div className="rm-meta-row">
                    <span className="rm-meta-label">Target User</span>
                    <span className="rm-meta-value rm-meta-value--danger">{r.targetUser.name}
                      <span className="rm-meta-email"> · {r.targetUser.email}</span>
                    </span>
                  </div>
                )}
                {r.session && (
                  <div className="rm-meta-row">
                    <span className="rm-meta-label">Session ID</span>
                    <span className="rm-meta-mono">{r.session._id}</span>
                  </div>
                )}
              </div>

              <button onClick={() => viewChats(r.session._id)} className="rm-chat-btn">
                <FaComments size={13} />
                View Chats
              </button>
            </div>

            <div className="rm-divider" />

            {/* Card body */}
            <div className="rm-card-body">
              <div className="rm-field">
                <span className="rm-field-label">Reason</span>
                <span className="rm-field-value rm-reason-badge">{r.reason}</span>
              </div>

              <div className="rm-field">
                <span className="rm-field-label">Description</span>
                <p className="rm-description">{r.description}</p>
              </div>

              {r.screenshot && (
                <div className="rm-field">
                  <span className="rm-field-label">Screenshot</span>
                  <a
                    href={`https://skill-swap-9y9h.onrender.com${r.screenshot}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rm-screenshot-link"
                  >
                    <img
                      src={`https://skill-swap-9y9h.onrender.com${r.screenshot}`}
                      alt="Report screenshot"
                      className="rm-screenshot"
                    />
                    <span className="rm-screenshot-overlay">View full</span>
                  </a>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="rm-actions">
              <button onClick={() => handleResolve(r._id)} className="rm-btn rm-btn--resolve">
                <FiCheck size={13} /> Resolve
              </button>
              {r.targetUser && (
                <button
                  onClick={() => handleBlock(r.targetUser._id, r.targetUser.name)}
                  className="rm-btn rm-btn--block"
                >
                  <FiSlash size={13} /> Block User
                </button>
              )}
            </div>
          </div>
        ))}

        {!loading && reports.length === 0 && (
          <div className="rm-empty">No reports to review.</div>
        )}
      </div>

      {/* Chat viewer */}
      {activeSession && (
        <div className="rm-chat-panel">
          <div className="rm-card-bar" />
          <div className="rm-chat-header">
            <h3 className="rm-chat-title">Chat History</h3>
            <span className="rm-chat-session-id">{activeSession}</span>
            <button className="rm-chat-close" onClick={() => setActiveSession('')}>
              <FiX size={15} />
            </button>
          </div>

          {loadingChats && (
            <div className="rm-state rm-state--sm">
              <div className="rm-spinner" /><span>Loading chats…</span>
            </div>
          )}
          {errorChats && (
            <div className="rm-banner rm-banner--error">
              <span className="rm-banner-dot" />{errorChats}
            </div>
          )}

          <div className="rm-chat-list">
            {sessionChats.map(msg => (
              <div key={msg._id} className="rm-msg">
                <div className="rm-msg-header">
                  <span className="rm-msg-sender">{msg.senderId.name}</span>
                  <span className="rm-msg-time">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </div>
                {msg.content && <p className="rm-msg-content">{msg.content}</p>}
                {msg.mediaUrl && msg.mediaType === 'image' && (
                  <img src={msg.mediaUrl} alt="attachment" className="rm-msg-img" />
                )}
              </div>
            ))}
            {!sessionChats.length && !loadingChats && (
              <p className="rm-empty">No messages found for this session.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;
