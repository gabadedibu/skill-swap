// client/src/components/admin/Navbar.jsx
import React from 'react';
import { FaBars } from 'react-icons/fa';
import './AdminNavbar.css';

const AdminNavbar = ({ adminName, profileImage, onToggleSidebar }) => {
  return (
    <header className="an-root">
      <div className="an-shimmer" />

      {/* Left — Hamburger */}
      <button onClick={onToggleSidebar} className="an-burger" aria-label="Toggle sidebar">
        <FaBars />
      </button>

      {/* Centre — Brand */}
      <span className="an-brand">
        Skill<span className="an-brand-accent">Swap</span>
        <span className="an-brand-badge">
          <span className="an-badge-dot" />
          Admin
        </span>
      </span>

      {/* Right — Admin info */}
      <div className="an-right">
        <div className="an-greeting">
          <span className="an-greeting-label">Hello,</span>
          <span className="an-greeting-name">Mr. {adminName}</span>
        </div>
        <div className="an-avatar-wrap">
          <img
            src={profileImage}
            alt="Admin"
            className="an-avatar"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <span className="an-avatar-initials">
            {adminName ? adminName.charAt(0).toUpperCase() : 'A'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
