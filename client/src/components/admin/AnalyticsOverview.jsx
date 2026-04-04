// client/src/components/admin/AnalyticsOverview.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics } from '../../redux/slices/adminSlice';
import { motion } from 'framer-motion';
import { FaUsers, FaCalendarCheck, FaFlag } from 'react-icons/fa';
import './AnalyticsOverview.css';

const cards = [
  {
    key: 'userCount',
    label: 'Total Users',
    icon: <FaUsers />,
    colorClass: 'ao-card--indigo',
  },
  {
    key: 'sessionCount',
    label: 'Total Sessions',
    icon: <FaCalendarCheck />,
    colorClass: 'ao-card--emerald',
  },
  {
    key: 'reportCount',
    label: 'Total Reports',
    icon: <FaFlag />,
    colorClass: 'ao-card--red',
  },
];

const containerVariant = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.6, ease: 'easeOut', when: 'beforeChildren', staggerChildren: 0.15 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const AnalyticsOverview = () => {
  const dispatch = useDispatch();
  const { analytics, loading, error } = useSelector(state => state.admin);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  return (
    <motion.div
      className="ao-root"
      variants={containerVariant}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="ao-header">
        <span className="ao-eyebrow"><span className="ao-eyebrow-dot" />Admin Analytics</span>
        <h2 className="ao-title">Analytics Overview</h2>
        <p className="ao-subtitle">Real-time platform metrics at a glance.</p>
      </div>

      {loading ? (
        <div className="ao-loading">
          <div className="ao-spinner" />
          <span>Loading analytics…</span>
        </div>
      ) : error ? (
        <div className="ao-error">
          <span className="ao-error-dot" />
          {error}
        </div>
      ) : (
        <div className="ao-grid">
          {cards.map(({ key, label, icon, colorClass }) => (
            <motion.div
              key={key}
              variants={cardVariant}
              className={`ao-card ${colorClass}`}
              whileHover={{ y: -4 }}
            >
              <div className="ao-card-bar" />

              <div className="ao-card-icon-wrap">
                <span className="ao-card-icon">{icon}</span>
              </div>

              <div className="ao-card-body">
                <span className="ao-card-num">{analytics?.[key] ?? '—'}</span>
                <span className="ao-card-label">{label}</span>
              </div>

              {/* Subtle glow blob */}
              <div className="ao-card-glow" />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AnalyticsOverview;
