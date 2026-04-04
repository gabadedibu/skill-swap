import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  addUser,
  deleteUser,
  unblockUser
} from '../../redux/slices/adminSlice';
import { FiUserPlus, FiTrash2, FiUnlock } from 'react-icons/fi';
import './UserManagement.css';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector(state => state.admin);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'user'
  });

  useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);

  const handleChange = e =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAdd = e => {
    e.preventDefault();
    dispatch(addUser(formData)).then(() => {
      setFormData({ name: '', email: '', password: '', role: 'user' });
      dispatch(fetchUsers());
    });
  };

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(id)).then(() => dispatch(fetchUsers()));
    }
  };

  const handleUnblock = id => {
    dispatch(unblockUser(id)).then(() => dispatch(fetchUsers()));
  };

  const userRows = useMemo(() =>
    users.map(u => {
      const isBlocked = u.status === 'blocked';
      return (
        <tr key={u._id} className="um-row">
          <td className="um-td">
            <div className="um-name-cell">
              <div className="um-initial">{u.name.charAt(0).toUpperCase()}</div>
              {u.name}
            </div>
          </td>
          <td className="um-td um-email">{u.email}</td>
          <td className="um-td">
            <span className={`um-role-badge ${u.role === 'admin' ? 'um-role-badge--admin' : ''}`}>
              {u.role}
            </span>
          </td>
          <td className="um-td">
            <span className={`um-status-badge ${isBlocked ? 'um-status-badge--blocked' : 'um-status-badge--active'}`}>
              {isBlocked ? 'Blocked' : 'Active'}
            </span>
          </td>
          <td className="um-td um-td-actions">
            {isBlocked ? (
              <button onClick={() => handleUnblock(u._id)} className="um-btn um-btn--unblock">
                <FiUnlock size={12} /> Unblock
              </button>
            ) : (
              <button onClick={() => handleDelete(u._id)} className="um-btn um-btn--delete">
                <FiTrash2 size={12} /> Delete
              </button>
            )}
          </td>
        </tr>
      );
    }),
    [users]
  );

  return (
    <div className="um-root">
      {/* Page header */}
      <div className="um-header">
        <span className="um-eyebrow"><span className="um-eyebrow-dot" />Users</span>
        <h2 className="um-title">User Management</h2>
        <p className="um-subtitle">Add, manage, and moderate platform users.</p>
      </div>

      {/* Add user form */}
      <div className="um-form-card">
        <div className="um-card-bar" />
        <div className="um-form-header">
          <FiUserPlus size={16} className="um-form-icon" />
          <h3 className="um-form-title">Add New User</h3>
        </div>

        <form onSubmit={handleAdd} className="um-form">
          <div className="um-form-grid">
            <div className="um-field">
              <label className="um-label">Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name"
                className="um-input"
                required
              />
            </div>
            <div className="um-field">
              <label className="um-label">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                className="um-input"
                required
              />
            </div>
            <div className="um-field">
              <label className="um-label">Password</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="um-input"
                required
              />
            </div>
            <div className="um-field">
              <label className="um-label">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="um-input um-select"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <button type="submit" className="um-submit-btn">
            <FiUserPlus size={14} />
            Add User
          </button>
        </form>
      </div>

      {/* Users table */}
      <div className="um-table-card">
        <div className="um-card-bar" />

        {loading ? (
          <div className="um-state">
            <div className="um-spinner" />
            <span>Loading users…</span>
          </div>
        ) : error ? (
          <div className="um-error-banner">
            <span className="um-error-dot" />{error}
          </div>
        ) : (
          <div className="um-table-wrap">
            <table className="um-table">
              <thead>
                <tr className="um-thead-row">
                  <th className="um-th">Name</th>
                  <th className="um-th">Email</th>
                  <th className="um-th">Role</th>
                  <th className="um-th">Status</th>
                  <th className="um-th">Actions</th>
                </tr>
              </thead>
              <tbody>{userRows}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
