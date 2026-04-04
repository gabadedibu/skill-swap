// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import registerImage from "../assets/auth-bg.jpg";
import { Link } from "react-router-dom";
import "./RegisterPage.css";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post(
        "https://skill-swap-9y9h.onrender.com/api/auth/register",
        { name, email, password }
      );
      setSuccessMessage("Registration successful! Please log in.");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong!");
    }
  };

  return (
    <div className="reg-root">
      {/* ── Left panel ── */}
      <motion.div
        className="reg-left"
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="reg-grid" />
        <div className="reg-glow" />

        {/* Brand */}
        <motion.div
          className="reg-brand"
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="reg-brand-name">Skill Swap</span>
          <span className="reg-brand-sub">Empower your skills. Connect. Grow.</span>
        </motion.div>

        {/* Card */}
        <motion.div
          className="reg-card"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="reg-card-bar" />

          <h2 className="reg-card-title">Create Account</h2>
          <p className="reg-card-hint">Join the community today</p>

          {successMessage && (
            <div className="reg-success">
              <span className="reg-success-dot" />
              {successMessage}
            </div>
          )}
          {error && (
            <div className="reg-error">
              <span className="reg-error-dot" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="reg-form">
            {/* Name */}
            <div className="reg-field">
              <FiUser className="reg-field-icon" />
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error === "Please enter your full name.") setError("");
                }}
                autoComplete="off"
                className="reg-input"
              />
            </div>

            {/* Email */}
            <div className="reg-field">
              <FiMail className="reg-field-icon" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error === "Please enter a valid email address.") setError("");
                }}
                autoComplete="off"
                className="reg-input"
              />
            </div>

            {/* Password */}
            <div className="reg-field">
              <FiLock className="reg-field-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error === "Password must be at least 6 characters long.") setError("");
                }}
                autoComplete="new-password"
                className="reg-input"
              />
              <button
                type="button"
                className="reg-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="reg-field">
              <FiLock className="reg-field-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error === "Passwords do not match!") setError("");
                }}
                autoComplete="new-password"
                className="reg-input"
              />
              <button
                type="button"
                className="reg-eye"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>

            <button type="submit" className="reg-btn">
              <span>Register</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>

          <p className="reg-login-text">
            Already have an account?{" "}
            <Link to="/login" className="reg-login-link">
              Login here
            </Link>
          </p>
        </motion.div>
      </motion.div>

      {/* ── Right panel ── */}
      <motion.div
        className="reg-right"
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ backgroundImage: `url(${registerImage})` }}
      >
        <div className="reg-right-overlay" />
        <div className="reg-right-quote">
          <span>"Every expert was once a beginner."</span>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
