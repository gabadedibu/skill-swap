import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../redux/slices/authSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import loginImage from "../assets/auth-bg.jpg";
import { FiMail, FiLock } from "react-icons/fi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    dispatch(loginStart());
    try {
      const response = await axios.post("https://skill-swap-9y9h.onrender.com/api/auth/login", {
        email,
        password,
      });

      const token = response.data.token;
      const decoded = jwtDecode(token);
      const role = decoded?.user?.role || "user";

      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: response.data.name,
          email: response.data.email,
          _id: response.data.id,
          role: decoded.user.role,
        })
      );

      dispatch(loginSuccess(token));

      if (decoded.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.msg || "Something went wrong!";
      dispatch(loginFailure(errorMessage));
      setError(errorMessage);
    }
  };

  return (
    <div className="login-root">
      {/* ── Left panel ── */}
      <motion.div
        className="login-left"
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Grid overlay */}
        <div className="login-grid" />
        {/* Glow */}
        <div className="login-glow" />

        {/* Brand */}
        <motion.div
          className="login-brand"
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="login-brand-name">Skill Swap</span>
          <span className="login-brand-sub">Empower your skills. Connect. Grow.</span>
        </motion.div>

        {/* Card */}
        <motion.div
          className="login-card"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Top accent bar */}
          <div className="login-card-bar" />

          <h2 className="login-card-title">Welcome Back</h2>
          <p className="login-card-hint">Sign in to continue your journey</p>

          {error && (
            <div className="login-error">
              <span className="login-error-dot" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email */}
            <div className="login-field">
              <FiMail className="login-field-icon" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (
                    error === "Please enter your email address." ||
                    error === "Please enter a valid email address."
                  )
                    setError("");
                }}
                className="login-input"
              />
            </div>

            {/* Password */}
            <div className="login-field">
              <FiLock className="login-field-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error === "Password is required.") setError("");
                }}
                className="login-input"
              />
              <button
                type="button"
                className="login-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>

            {/* Submit */}
            <button type="submit" className="login-btn">
              <span>Login</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>

          <p className="login-register-text">
            Don't have an account?{" "}
            <Link to="/register" className="login-register-link">
              Register here
            </Link>
          </p>
        </motion.div>
      </motion.div>

      {/* ── Right panel: image ── */}
      <motion.div
        className="login-right"
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ backgroundImage: `url(${loginImage})` }}
      >
        <div className="login-right-overlay" />
        <div className="login-right-quote">
          <span>"The best investment you can make is in yourself."</span>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
