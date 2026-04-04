// src/pages/ProfileSettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/profileSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import { FaEdit } from 'react-icons/fa';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import defaultAvatar from '../assets/avatar.jpeg';
import Background from '../components/background/Background';
import '../components/background/Background.css';
import Footer from '../components/footer/Footer';
import './ProfileSettingsPage.css';

const ProfileSettingsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    profilePicture: '',
    status: '',
    socials: { linkedin: '', facebook: '', twitter: '' },
    skillsToTeach: '',
    skillsToLearn: ''
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    currentPasswordVisible: false,
    newPasswordVisible: false,
    confirmNewPasswordVisible: false
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [imagePreview, setImagePreview] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('https://skill-swap-9y9h.onrender.com/api/users/profile', {
          headers: { 'x-auth-token': token }
        });
        const data = res.data;
        setFormData({
          name: data.name || '',
          profilePicture: data.profilePicture || '',
          status: data.status || '',
          socials: data.socials || { linkedin: '', facebook: '', twitter: '' },
          skillsToTeach: data.skillsToTeach ? data.skillsToTeach.join(', ') : '',
          skillsToLearn: data.skillsToLearn ? data.skillsToLearn.join(', ') : ''
        });
        if (data.profilePicture) {
          setImagePreview(`https://skill-swap-9y9h.onrender.com/uploads/profile-pictures/${data.profilePicture}`);
        }
      } catch {
        setMessage('Failed to load profile data.');
        setMessageType('error');
      }
    };
    fetchProfile();
  }, []);

  const avatarSrc = imagePreview
    ? imagePreview
    : formData.profilePicture
    ? `https://skill-swap-9y9h.onrender.com/uploads/profile-pictures/${formData.profilePicture}`
    : defaultAvatar;

  const handleUpdate = async () => {
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('status', formData.status);

    const skillsToTeachArray = formData.skillsToTeach.split(',').map(s => s.trim()).filter(s => s !== '');
    const skillsToLearnArray = formData.skillsToLearn.split(',').map(s => s.trim()).filter(s => s !== '');

    skillsToTeachArray.forEach(skill => payload.append('skillsToTeach[]', skill));
    skillsToLearnArray.forEach(skill => payload.append('skillsToLearn[]', skill));

    payload.append('socials[linkedin]', formData.socials.linkedin);
    payload.append('socials[facebook]', formData.socials.facebook);
    payload.append('socials[twitter]', formData.socials.twitter);

    if (formData.profilePicture instanceof File) {
      payload.append('profilePicture', formData.profilePicture);
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('https://skill-swap-9y9h.onrender.com/api/users/profile', payload, {
        headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
      });
      dispatch(setUser(res.data));
      setMessage('Profile updated successfully!');
      setMessageType('success');
      navigate('/profile');
    } catch {
      setMessage('Update failed. Please try again.');
      setMessageType('error');
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setMessage("Passwords don't match!");
      setMessageType('error');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'https://skill-swap-9y9h.onrender.com/api/users/change-password',
        { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword },
        { headers: { 'x-auth-token': token } }
      );
      setMessage('Password updated successfully!');
      setMessageType('success');
    } catch {
      setMessage('Password update failed. Please try again.');
      setMessageType('error');
    }
  };

  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profilePicture: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const passwordFields = [
    { key: 'currentPassword', placeholder: 'Current password', visibleKey: 'currentPasswordVisible', label: 'Current Password', id: 'currentPassword' },
    { key: 'newPassword', placeholder: 'New password', visibleKey: 'newPasswordVisible', label: 'New Password', id: 'newPassword' },
    { key: 'confirmNewPassword', placeholder: 'Confirm new password', visibleKey: 'confirmNewPasswordVisible', label: 'Confirm New Password', id: 'confirmNewPassword' }
  ];

  return (
    <div className="psp-root">
      <Background />
      <div className="psp-grid" />
      <div className="psp-orb" />

      <div className="psp-content">
        <Navbar />

        <div className="psp-inner">
          {/* Page title */}
          <div className="psp-page-header">
            <span className="psp-eyebrow"><span className="psp-eyebrow-dot" />Settings</span>
            <h1 className="psp-page-title">Edit Profile</h1>
          </div>

          <div className="psp-card">
            <div className="psp-card-bar" />

            {/* Feedback message */}
            {message && (
              <div className={`psp-message ${messageType === 'error' ? 'psp-message--error' : 'psp-message--success'}`}>
                <span className="psp-message-dot" />
                {message}
              </div>
            )}

            {/* ── SECTION: Avatar ── */}
            <div className="psp-section">
              <h3 className="psp-section-title">Profile Photo</h3>
              <div className="psp-avatar-wrap">
                <label htmlFor="profilePicture" className="psp-avatar-label">
                  <img src={avatarSrc} alt="Profile" className="psp-avatar-img" />
                  <div className="psp-avatar-overlay">
                    <FaEdit className="psp-avatar-icon" />
                  </div>
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  className="psp-hidden"
                  onChange={handleImageUpload}
                />
                <p className="psp-avatar-hint">Click to upload a new photo</p>
              </div>
            </div>

            <div className="psp-divider" />

            {/* ── SECTION: Basic Info ── */}
            <div className="psp-section">
              <h3 className="psp-section-title">Basic Info</h3>
              <div className="psp-fields">
                <div className="psp-field">
                  <label className="psp-label" htmlFor="name">Name</label>
                  <input id="name" type="text" placeholder="Your full name" value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="psp-input" />
                </div>
                <div className="psp-field">
                  <label className="psp-label" htmlFor="status">Status</label>
                  <input id="status" type="text" placeholder="e.g. Available, Busy..." value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="psp-input" />
                </div>
              </div>
            </div>

            <div className="psp-divider" />

            {/* ── SECTION: Socials ── */}
            <div className="psp-section">
              <h3 className="psp-section-title">Social Links</h3>
              <div className="psp-fields">
                {[
                  { id: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
                  { id: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
                  { id: 'twitter', label: 'Twitter URL', placeholder: 'https://twitter.com/...' }
                ].map(({ id, label, placeholder }) => (
                  <div key={id} className="psp-field">
                    <label className="psp-label" htmlFor={id}>{label}</label>
                    <input id={id} type="text" placeholder={placeholder}
                      value={formData.socials[id]}
                      onChange={e => setFormData({ ...formData, socials: { ...formData.socials, [id]: e.target.value } })}
                      className="psp-input" />
                  </div>
                ))}
              </div>
            </div>

            <div className="psp-divider" />

            {/* ── SECTION: Skills ── */}
            <div className="psp-section">
              <h3 className="psp-section-title">Skills</h3>
              <div className="psp-fields">
                <div className="psp-field psp-field--full">
                  <label className="psp-label" htmlFor="skillsToTeach">Skills You Can Teach</label>
                  <input id="skillsToTeach" type="text" placeholder="e.g. JavaScript, Design, Python"
                    value={formData.skillsToTeach}
                    onChange={e => setFormData({ ...formData, skillsToTeach: e.target.value })}
                    className="psp-input" />
                  <span className="psp-field-hint">Comma-separated</span>
                </div>
                <div className="psp-field psp-field--full">
                  <label className="psp-label" htmlFor="skillsToLearn">Skills You Want to Learn</label>
                  <input id="skillsToLearn" type="text" placeholder="e.g. Go, Machine Learning, Figma"
                    value={formData.skillsToLearn}
                    onChange={e => setFormData({ ...formData, skillsToLearn: e.target.value })}
                    className="psp-input" />
                  <span className="psp-field-hint">Comma-separated</span>
                </div>
              </div>
            </div>

            <button onClick={handleUpdate} className="psp-btn psp-btn--primary">
              Save Changes
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="psp-divider psp-divider--mt" />

            {/* ── SECTION: Change Password ── */}
            <div className="psp-section">
              <h3 className="psp-section-title">Change Password</h3>
              <div className="psp-fields">
                {passwordFields.map(({ key, placeholder, visibleKey, label, id }) => (
                  <div key={key} className="psp-field psp-field--full psp-field--eye">
                    <label className="psp-label" htmlFor={id}>{label}</label>
                    <div className="psp-eye-wrap">
                      <input
                        id={id}
                        type={passwords[visibleKey] ? 'text' : 'password'}
                        placeholder={placeholder}
                        value={passwords[key]}
                        onChange={e => setPasswords(prev => ({ ...prev, [key]: e.target.value }))}
                        className="psp-input"
                      />
                      <button
                        type="button"
                        className="psp-eye"
                        onClick={() => setPasswords(prev => ({ ...prev, [visibleKey]: !prev[visibleKey] }))}
                      >
                        {passwords[visibleKey] ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handlePasswordChange} className="psp-btn psp-btn--danger">
              Change Password
            </button>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
