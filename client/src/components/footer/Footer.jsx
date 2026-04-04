import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  const internalLinks = [
    { name: "Home",          to: "/" },
    { name: "Profile",       to: "/profile" },
    { name: "Login",         to: "/login" },
    { name: "Sign Up",       to: "/register" },
    { name: "Chat",          to: "/chat" },
    { name: "Skill Matching",to: "/skill-matching" },
    { name: "Settings",      to: "/profile-settings" },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <footer className="footer">
      {/* Top shimmer */}
      <div className="footer-shimmer" />

      <div className="footer-inner">
        {/* Brand */}
        <div className="footer-brand">
          <span className="footer-logo">
            Skill<span className="footer-logo-accent">Swap</span>
          </span>
          <p className="footer-brand-desc">
            A collaborative platform for peer-to-peer learning and skill development.
          </p>
          {/* Social icons */}
          <div className="footer-socials">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-social">
              <FaGithub />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social">
              <FaLinkedin />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-social">
              <FaTwitter />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-links-col">
          <h3 className="footer-col-title">Quick Links</h3>
          <div className="footer-links-grid">
            {internalLinks.map(({ name, to }) => (
              <Link key={name} to={to} className="footer-link">
                <span className="footer-link-dot" />
                {name}
              </Link>
            ))}
          </div>
        </div>

        {/* Tagline / connect */}
        <div className="footer-connect-col">
          <h3 className="footer-col-title">About</h3>
          <p className="footer-connect-text">
            SkillSwap connects curious minds. Teach what you know, learn what you love — together.
          </p>
          <div className="footer-eyebrow">
            <span className="footer-eyebrow-dot" />
            Peer-to-Peer Learning
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Skill Swap. All rights reserved.</span>
        <span className="footer-bottom-sep">·</span>
        <span>Built with passion for learners everywhere.</span>
      </div>
    </footer>
  );
};

export default Footer;
