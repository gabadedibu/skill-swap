import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/admin/Navbar';
import AdminSideBar from "../components/admin/AdminSideBar";
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../redux/slices/adminProfileSlice';
import { FiUsers, FiFlag, FiBarChart2, FiUser } from 'react-icons/fi';
import './AdminDashboardPage.css';

const statCards = [
  {
    title: 'Users',
    icon: <FiUsers />,
    text: 'View and manage all registered users. Control access, update profiles, and monitor activities.',
    colorClass: 'adp-stat--indigo',
  },
  {
    title: 'Reports',
    icon: <FiFlag />,
    text: 'Analyze reported issues, take action on complaints, and maintain platform integrity.',
    colorClass: 'adp-stat--red',
  },
  {
    title: 'Analytics',
    icon: <FiBarChart2 />,
    text: 'Monitor usage stats, trends, and system performance for better decision-making.',
    colorClass: 'adp-stat--emerald',
  },
  {
    title: 'Profile',
    icon: <FiUser />,
    text: 'Update your profile, change settings, and manage your administrator account.',
    colorClass: 'adp-stat--amber',
  },
];

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.profile);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const _toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const profileImage = user?.profilePicture
    ? user.profilePicture.startsWith('http')
      ? user.profilePicture
      : `https://skill-swap-9y9h.onrender.com/uploads/${user.profilePicture}`
    : 'https://placehold.co/150x150?text=Admin';

  return (
    <div className="adp-root">
      {/* Background layers */}
      <div className="adp-bg-base" />
      <div className="adp-bg-grid" />
      <div className="adp-bg-orb adp-bg-orb--tr" />
      <div className="adp-bg-orb adp-bg-orb--bl" />

      <Navbar
        adminName={user?.name || 'Admin'}
        profileImage={profileImage}
        onToggleSidebar={_toggleSidebar}
      />

      <div className="adp-layout">
        {/* Sidebar */}
        <div className={`adp-sidebar-wrap ${sidebarOpen ? 'adp-sidebar-wrap--open' : ''}`}>
          {sidebarOpen && <AdminSideBar />}
        </div>

        {/* Main content */}
        <main className="adp-main">

          {/* Profile hero card */}
          <div className="adp-profile-card adp-animate-in">
            <div className="adp-card-bar" />

            <div className="adp-profile-avatar-wrap">
              <img
                src={profileImage}
                alt="Profile"
                className="adp-profile-avatar"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://placehold.co/150x150?text=Admin';
                }}
              />
              <span className="adp-admin-ring" />
            </div>

            <div className="adp-profile-info">
              <div className="adp-profile-name-row">
                <h2 className="adp-profile-name">{user?.name || 'Admin User'}</h2>
                <span className="adp-admin-badge">
                  <span className="adp-admin-badge-dot" />
                  Administrator
                </span>
              </div>
              <p className="adp-profile-desc">
                Responsible for overseeing platform operations and ensuring user compliance.
                Manages user data, handles reports, and maintains system integrity.
                Monitors analytics to drive informed decisions and improvements.
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="adp-stat-grid">
            {statCards.map(({ title, icon, text, colorClass }) => (
              <div key={title} className={`adp-stat-card ${colorClass}`}>
                <div className="adp-stat-bar" />
                <div className="adp-stat-icon-wrap">
                  <span className="adp-stat-icon">{icon}</span>
                </div>
                <h3 className="adp-stat-title">{title}</h3>
                <p className="adp-stat-text">{text}</p>
              </div>
            ))}
          </div>

          {/* Nested routes */}
          <div className="adp-outlet">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
