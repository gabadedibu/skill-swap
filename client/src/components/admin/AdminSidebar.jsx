import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaUsers, FaChartBar, FaFlag, FaUserShield, FaBolt, FaSignOutAlt } from 'react-icons/fa';
import './AdminSideBar.css';

const navItems = [
  { to: 'users',               label: 'Users',            icon: <FaUsers /> },
  { to: 'reports',             label: 'Reports',           icon: <FaFlag /> },
  { to: 'analytics',           label: 'Analytics',         icon: <FaChartBar /> },
  { to: 'engagement-analytics',label: 'Engagement Stats',  icon: <FaBolt /> },
  { to: 'profile',             label: 'Profile',           icon: <FaUserShield /> },
];

const AdminSideBar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="asb">
      {/* Shimmer top bar */}
      <div className="asb-shimmer" />
      {/* Glow orb */}
      <div className="asb-orb" />
      {/* Grid texture */}
      <div className="asb-grid" />

      <div className="asb-body">
        {/* Header */}
        <div className="asb-header">
          <span className="asb-logo">
            Skill<span className="asb-logo-accent">Swap</span>
          </span>
          <span className="asb-badge">
            <span className="asb-badge-dot" />
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="asb-nav">
          <p className="asb-nav-label">Navigation</p>
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `asb-link ${isActive ? 'asb-link--active' : ''}`
              }
            >
              <span className="asb-link-icon">{icon}</span>
              <span className="asb-link-label">{label}</span>
              <span className="asb-link-arrow">›</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout */}
      {isAdmin && (
        <div className="asb-footer">
          <div className="asb-divider" />
          <button onClick={handleLogout} className="asb-logout">
            <FaSignOutAlt className="asb-logout-icon" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default AdminSideBar;
