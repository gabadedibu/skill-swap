import React, { useEffect, useState } from "react";
import "./Background.css";

const generateOrbs = (count = 18) =>
  Array.from({ length: count }, (_, i) => ({
    top:      `${Math.random() * 100}%`,
    left:     `${Math.random() * 100}%`,
    size:     Math.floor(Math.random() * 260 + 120),
    delay:    `${(Math.random() * 6).toFixed(1)}s`,
    duration: `${(20 + Math.random() * 14).toFixed(1)}s`,
    opacity:  +(0.12 + Math.random() * 0.14).toFixed(2),
    variant:  i % 3, // 0 = indigo, 1 = violet, 2 = blue
  }));

const orbs = generateOrbs();

// Tiny star particles
const generateStars = (count = 40) =>
  Array.from({ length: count }, () => ({
    top:      `${Math.random() * 100}%`,
    left:     `${Math.random() * 100}%`,
    size:     Math.floor(Math.random() * 2 + 1),
    delay:    `${(Math.random() * 4).toFixed(1)}s`,
    duration: `${(3 + Math.random() * 4).toFixed(1)}s`,
    opacity:  +(0.2 + Math.random() * 0.5).toFixed(2),
  }));

const stars = generateStars();

const Background = () => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 900);
    }, Math.random() * 1000 + 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-root">
      {/* Deep base gradient */}
      <div className="bg-base" />

      {/* Animated grid */}
      <div className="bg-grid" />

      {/* Large ambient orbs */}
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={`bg-orb bg-orb--${orb.variant} ${pulse ? 'bg-orb--pulse' : ''}`}
          style={{
            width:          `${orb.size}px`,
            height:         `${orb.size}px`,
            top:            orb.top,
            left:           orb.left,
            opacity:        orb.opacity,
            animationDuration: orb.duration,
            animationDelay:    orb.delay,
          }}
        />
      ))}

      {/* Star particles */}
      {stars.map((s, i) => (
        <div
          key={`s${i}`}
          className="bg-star"
          style={{
            width:             `${s.size}px`,
            height:            `${s.size}px`,
            top:               s.top,
            left:              s.left,
            opacity:           s.opacity,
            animationDuration: s.duration,
            animationDelay:    s.delay,
          }}
        />
      ))}

      {/* Corner glow accents */}
      <div className="bg-accent bg-accent--tr" />
      <div className="bg-accent bg-accent--bl" />
    </div>
  );
};

export default Background;
