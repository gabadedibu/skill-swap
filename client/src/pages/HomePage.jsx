import React from "react";
import { Link } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import Footer from "../components/footer/Footer";
import "./Home.css";
import bgImage from "../assets/auth-bg.jpg";

const Home = () => {
  return (
    <div
      className="home-hero"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="overlay" />

      <div className="hero-content">
        <span className="hero-eyebrow">Peer-to-Peer Learning</span>

        <span className="hero-brand">Skill Swap</span>
        <span className="hero-tagline">Connect, Learn, and Grow</span>

        <p className="hero-subtitle">
          A platform where learners meet learners.
          Share knowledge, teach others, and elevate your skills together.
        </p>

        <div className="cta-buttons">
          <Link to="/login" className="btn primary">
            <LogIn size={18} /> <span>Login</span>
          </Link>
          <Link to="/register" className="btn secondary">
            <UserPlus size={18} /> <span>Register</span>
          </Link>
        </div>
      </div>

      <div className="hero-divider" />

      <section className="glass-panel">
        <div className="info-grid">
          <div>
            <span className="step-num">01 — Explore</span>
            <h3>Discover Skills</h3>
            <p>
              Explore a wide range of topics offered by peers across the globe.
            </p>
          </div>
          <div>
            <span className="step-num">02 — Connect</span>
            <h3>Find Your Match</h3>
            <p>Let smart matching pair you with ideal learning partners.</p>
          </div>
          <div>
            <span className="step-num">03 — Thrive</span>
            <h3>Grow Together</h3>
            <p>Teach what you know, learn what you love—side by side.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
