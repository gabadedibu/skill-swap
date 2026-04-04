import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEngagementStats } from '../../redux/slices/adminSlice';
import { FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import './EngagementAnalytics.css';

const getOrdinal = (i) => {
  const n = i + 1;
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
};

const rankColor = (rank) => {
  if (rank === 0) return 'ea-rank--gold';
  if (rank === 1) return 'ea-rank--silver';
  if (rank === 2) return 'ea-rank--bronze';
  return 'ea-rank--default';
};

const UserCard = React.memo(({ user, rank }) => {
  const {
    name, email, skillsToTeach, skillsToLearn,
    role, profilePicture, socials, status, sessionCount,
  } = user;

  const defaultAvatar = '/default-avatar.png';

  const ordinal    = useMemo(() => getOrdinal(rank), [rank]);
  const pictureUrl = useMemo(() =>
    profilePicture
      ? `https://skill-swap-9y9h.onrender.com/uploads/profile-pictures/${profilePicture}`
      : defaultAvatar,
    [profilePicture]
  );
  const teachSkills = useMemo(() =>
    skillsToTeach.map((s, i) => <span key={i} className="ea-tag ea-tag--teach">{s}</span>),
    [skillsToTeach]
  );
  const learnSkills = useMemo(() =>
    skillsToLearn.map((s, i) => <span key={i} className="ea-tag ea-tag--learn">{s}</span>),
    [skillsToLearn]
  );

  return (
    <div className="ea-card">
      <div className="ea-card-bar" />

      {/* Rank ribbon */}
      <div className={`ea-rank ${rankColor(rank)}`}>#{ordinal}</div>

      {/* Header */}
      <div className="ea-card-header">
        <img
          className="ea-avatar"
          src={pictureUrl}
          alt={`${name}'s avatar`}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultAvatar; }}
        />
        <div className="ea-card-user">
          <h3 className="ea-card-name">{name}</h3>
          <p className="ea-card-email">{email}</p>
        </div>
        <span className="ea-session-badge">
          {sessionCount} session{sessionCount !== 1 && 's'}
        </span>
      </div>

      {/* Body */}
      <div className="ea-card-body">
        {/* Role + Status */}
        <div className="ea-meta-row">
          <div className="ea-meta-item">
            <span className="ea-meta-label">Role</span>
            <span className="ea-meta-value">{role}</span>
          </div>
          <div className="ea-meta-item">
            <span className="ea-meta-label">Status</span>
            <span className="ea-meta-value">{status || '—'}</span>
          </div>
        </div>

        {/* Skills to Teach */}
        <div className="ea-skills-section">
          <span className="ea-skills-label">Skills to Teach</span>
          <div className="ea-tags">
            {skillsToTeach.length ? teachSkills : <span className="ea-tag-empty">None</span>}
          </div>
        </div>

        {/* Skills to Learn */}
        <div className="ea-skills-section">
          <span className="ea-skills-label">Skills to Learn</span>
          <div className="ea-tags">
            {skillsToLearn.length ? learnSkills : <span className="ea-tag-empty">None</span>}
          </div>
        </div>

        {/* Socials */}
        <div className="ea-socials-section">
          <span className="ea-skills-label">Socials</span>
          <div className="ea-socials">
            {socials.facebook && (
              <a href={socials.facebook} target="_blank" rel="noopener noreferrer"
                aria-label="Facebook" className="ea-social-link">
                <FaFacebookF />
              </a>
            )}
            {socials.twitter && (
              <a href={socials.twitter} target="_blank" rel="noopener noreferrer"
                aria-label="Twitter" className="ea-social-link">
                <FaTwitter />
              </a>
            )}
            {socials.linkedin && (
              <a href={socials.linkedin} target="_blank" rel="noopener noreferrer"
                aria-label="LinkedIn" className="ea-social-link">
                <FaLinkedinIn />
              </a>
            )}
            {!socials.facebook && !socials.twitter && !socials.linkedin && (
              <span className="ea-tag-empty">No links</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const EngagementAnalytics = () => {
  const dispatch = useDispatch();
  const { engagementStats, loading, error } = useSelector(state => state.admin);

  useEffect(() => {
    dispatch(fetchEngagementStats());
  }, [dispatch]);

  const users     = useMemo(() => engagementStats.mostActiveUsers || [], [engagementStats]);
  const userCards = useMemo(() =>
    users.map((user, idx) => <UserCard key={user.userId} user={user} rank={idx} />),
    [users]
  );

  if (loading) return (
    <div className="ea-state">
      <div className="ea-spinner" />
      <span>Loading engagement stats…</span>
    </div>
  );

  if (error) return (
    <div className="ea-state">
      <div className="ea-error-msg">
        <span className="ea-error-dot" />
        Error: {error}
      </div>
    </div>
  );

  return (
    <div className="ea-root">
      {/* Header */}
      <div className="ea-header">
        <span className="ea-eyebrow"><span className="ea-eyebrow-dot" />Engagement</span>
        <h1 className="ea-title">Most Active Users</h1>
        <p className="ea-subtitle">Ranked by session count across the platform.</p>
      </div>

      {/* Cards */}
      <div className="ea-list">
        {users.length
          ? userCards
          : <p className="ea-empty">No active user data available.</p>}
      </div>
    </div>
  );
};

export default EngagementAnalytics;
