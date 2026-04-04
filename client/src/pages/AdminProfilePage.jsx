// client/src/pages/AdminProfile.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProfile,
  updateProfile,
  changePassword,
  clearPasswordMessage
} from '../redux/slices/adminProfileSlice';
import { FiUpload, FiLock, FiUser, FiMail, FiClock } from 'react-icons/fi';
import './AdminProfilePage.css';

const AdminProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(s => s.profile);

  const [form, setForm] = useState({ name: '', email: '', profilePicture: '', createdAt: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError]   = useState('');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError]     = useState('');

  useEffect(() => { dispatch(fetchProfile()); }, [dispatch]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || '',
        createdAt: user.createdAt
      });
    }
  }, [user]);

  const onFormChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const onPwdChange  = e => setPasswords(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleImageChange = e => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setForm(f => ({ ...f, profilePicture: URL.createObjectURL(e.target.files[0]) }));
    }
  };

  const onProfileSubmit = async e => {
    e.preventDefault();
    setProfileSuccess(''); setProfileError('');
    setPasswordSuccess(''); setPasswordError('');

    if (passwords.currentPassword && passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    const profileForm = new FormData();
    profileForm.append('name', form.name);
    if (profileImage) profileForm.append('profilePicture', profileImage);

    try {
      await dispatch(updateProfile(profileForm)).unwrap();
      setProfileSuccess('Name and profile picture updated successfully.');
    } catch (err) { setProfileError(err); }

    if (passwords.currentPassword && passwords.newPassword) {
      try {
        const msg = await dispatch(changePassword({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })).unwrap();
        setPasswordSuccess(msg || 'Password changed successfully.');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } catch (err) { setPasswordError(err); }
    }

    dispatch(clearPasswordMessage());
  };

  const avatarSrc = profileImage
    ? form.profilePicture
    : form.profilePicture
    ? `https://skill-swap-9y9h.onrender.com/uploads/${form.profilePicture}`
    : null;

  return (
    <div className="ap-root">
      {/* Header */}
      <div className="ap-header">
        <span className="ap-eyebrow"><span className="ap-eyebrow-dot" />Admin</span>
        <h1 className="ap-title">My Profile</h1>
        <p className="ap-subtitle">Manage your admin account and credentials.</p>
      </div>

      <form onSubmit={onProfileSubmit} className="ap-form-wrap">

        {/* ── Profile info card ── */}
        <div className="ap-card">
          <div className="ap-card-bar" />

          <div className="ap-card-header">
            <FiUser className="ap-section-icon" />
            <h3 className="ap-section-title">Profile Info</h3>
          </div>

          {/* Feedback */}
          {profileError   && <div className="ap-msg ap-msg--error"><span className="ap-msg-dot" />{profileError}</div>}
          {profileSuccess && <div className="ap-msg ap-msg--success"><span className="ap-msg-dot" />{profileSuccess}</div>}

          {/* Avatar */}
          <div className="ap-avatar-section">
            <div className="ap-avatar-wrap">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Profile" className="ap-avatar-img" />
              ) : (
                <div className="ap-avatar-placeholder">
                  {form.name ? form.name.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
            </div>
            <div className="ap-avatar-info">
              <label htmlFor="fileInput" className="ap-upload-btn">
                <FiUpload size={13} />
                Choose Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="ap-hidden"
                id="fileInput"
              />
              <span className="ap-upload-hint">JPG, PNG or GIF · Max 5MB</span>
            </div>
          </div>

          <div className="ap-divider" />

          {/* Fields */}
          <div className="ap-fields">
            <div className="ap-field">
              <label className="ap-label"><FiUser size={11} /> Name</label>
              <input
                name="name"
                value={form.name}
                onChange={onFormChange}
                className="ap-input"
                placeholder="Your name"
              />
            </div>
            <div className="ap-field">
              <label className="ap-label"><FiMail size={11} /> Email</label>
              <input
                name="email"
                value={form.email}
                disabled
                className="ap-input ap-input--disabled"
              />
            </div>
          </div>

          {form.createdAt && (
            <div className="ap-created">
              <FiClock size={12} />
              Account created: {new Date(form.createdAt).toLocaleString()}
            </div>
          )}
        </div>

        {/* ── Change password card ── */}
        <div className="ap-card">
          <div className="ap-card-bar ap-card-bar--red" />

          <div className="ap-card-header">
            <FiLock className="ap-section-icon ap-section-icon--red" />
            <h3 className="ap-section-title">Change Password</h3>
          </div>

          {passwordError   && <div className="ap-msg ap-msg--error"><span className="ap-msg-dot" />{passwordError}</div>}
          {passwordSuccess && <div className="ap-msg ap-msg--success"><span className="ap-msg-dot" />{passwordSuccess}</div>}

          <div className="ap-fields">
            {[
              { name: 'currentPassword', label: 'Current Password' },
              { name: 'newPassword',     label: 'New Password' },
              { name: 'confirmPassword', label: 'Confirm New Password' },
            ].map(({ name, label }) => (
              <div key={name} className="ap-field ap-field--full">
                <label className="ap-label"><FiLock size={11} /> {label}</label>
                <input
                  name={name}
                  type="password"
                  value={passwords[name]}
                  onChange={onPwdChange}
                  className="ap-input"
                  placeholder="••••••••"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button type="submit" className="ap-submit" disabled={loading}>
          {loading ? (
            <><div className="ap-btn-spinner" /> Saving…</>
          ) : (
            <> Save Changes</>
          )}
        </button>
      </form>
    </div>
  );
};

export default AdminProfilePage;
