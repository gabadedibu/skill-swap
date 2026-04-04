import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin = user?.role === 'admin';
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `nav-link ${isActive ? 'nav-link--active' : ''}`;

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      {/* Top shimmer line */}
      <div className="navbar-shimmer" />

      <div className="navbar-inner">
        {/* Logo */}
        <NavLink to="/" className="navbar-logo">
          Skill<span className="navbar-logo-accent">Swap</span>
        </NavLink>

        {/* Desktop links */}
        <div className="navbar-links">
          <NavLink to="/" className={navLinkClass}>Home</NavLink>
          {token ? (
            <>
              <NavLink to="/profile"        className={navLinkClass}>Profile</NavLink>
              <NavLink to="/skill-matching" className={navLinkClass}>Skill Matching</NavLink>
              <NavLink to="/chat"           className={navLinkClass}>Chat</NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
              )}
            </>
          ) : (
            <>
              <NavLink to="/login"    className={navLinkClass}>Login</NavLink>
              <NavLink to="/register" className={navLinkClass}>Sign Up</NavLink>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="navbar-right">
          {token ? (
            <button onClick={handleLogout} className="navbar-logout">
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          ) : null}

          {/* Mobile hamburger */}
          <button
            className="navbar-burger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`navbar-mobile ${menuOpen ? 'navbar-mobile--open' : ''}`}>
        <NavLink to="/" className={navLinkClass} onClick={() => setMenuOpen(false)}>Home</NavLink>
        {token ? (
          <>
            <NavLink to="/profile"        className={navLinkClass} onClick={() => setMenuOpen(false)}>Profile</NavLink>
            <NavLink to="/skill-matching" className={navLinkClass} onClick={() => setMenuOpen(false)}>Skill Matching</NavLink>
            <NavLink to="/chat"           className={navLinkClass} onClick={() => setMenuOpen(false)}>Chat</NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass} onClick={() => setMenuOpen(false)}>Admin</NavLink>
            )}
            <button onClick={handleLogout} className="navbar-logout navbar-logout--mobile">
              <LogOut size={14} /><span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login"    className={navLinkClass} onClick={() => setMenuOpen(false)}>Login</NavLink>
            <NavLink to="/register" className={navLinkClass} onClick={() => setMenuOpen(false)}>Sign Up</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
