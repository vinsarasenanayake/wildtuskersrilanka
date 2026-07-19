import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, PlusCircle, LogOut, Home, Info, Database, BookOpen, Calendar } from 'lucide-react';
import wtsLogo from '../assets/images/wtslogo.png';
import './Navbar.css';

// Official Facebook Brand Logo (Blue Circle with white 'f')
const Facebook = ({ size = 26, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
  >
    <circle cx="12" cy="12" r="11.5" fill="#ffffff" />
    <path
      fill="#1877F2"
      d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.35c0-3 1.8-4.66 4.52-4.66 1.3 0 2.66.23 2.66.23v2.93h-1.5c-1.49 0-1.95.93-1.95 1.88V12h3.3l-.53 3.47h-2.77v8.38A12 12 0 0 0 24 12z"
    />
  </svg>
);

const navItems = [
  { name: 'Home',              path: '/',         icon: Home },
  { name: 'About Us',          path: '/about',    icon: Info },
  { name: 'Wild Tuskers List', path: '/tuskers',  icon: Database },
  { name: 'Our Research',      path: '/research', icon: BookOpen },
  { name: 'Our Projects',      path: '/projects', icon: Calendar },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      setIsAdmin(localStorage.getItem('isAdmin') === 'true');
    };
    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, []);

  // Close drawer on route change
  useEffect(() => { setIsOpen(false); }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const isHome = location.pathname === '/';
  const isScrolledState = isScrolled || !isHome;

  return (
    <header className={`wts-header ${isScrolledState ? 'scrolled' : ''}`}>
      <div className="container header-container">

        {/* Brand / Logo */}
        <Link to="/" className="wts-brand">
          <div className="logo-wrapper">
            <img src={wtsLogo} className="wts-logo-img" alt="Wild Tusker Sri Lanka Logo" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <ul className="nav-list">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.name} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  >
                    <IconComponent size={15} className="nav-tab-icon" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* CTA + Mobile Toggle */}
        <div className="header-actions">
          <a
            href="https://www.facebook.com/wildtuskersrilanka/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-nav-link facebook-link"
            title="Follow us on Facebook"
          >
            <Facebook size={26} />
          </a>

          {isAdmin ? (
            <>
              <Link to="/admin/add-tusker" className="cta-button btn-add-tusker">
                <PlusCircle size={15} />
                <span>Add New Tusker</span>
              </Link>
              <button onClick={handleLogout} className="cta-button btn-logout">
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/admin" className="cta-button">
              <span>Admin</span>
            </Link>
          )}

          <button
            className="mobile-menu-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Navigation"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      <div className={`mobile-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <span className="drawer-title">Navigation</span>
          <button className="drawer-close" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="mobile-nav">
          <ul className="mobile-nav-list">
            {navItems.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <li
                  key={item.name}
                  className="mobile-nav-item"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <Link
                    to={item.path}
                    className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                  >
                    <IconComponent size={18} className="mobile-nav-tab-icon" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="drawer-footer">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <a
              href="https://www.facebook.com/wildtuskersrilanka/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-nav-link facebook-link"
              title="Follow us on Facebook"
            >
              <Facebook size={32} />
            </a>
          </div>

          {isAdmin ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/admin/add-tusker" className="cta-button full-width btn-add-tusker">
                <PlusCircle size={16} />
                <span>Add New Tusker</span>
              </Link>
              <button onClick={handleLogout} className="cta-button full-width btn-logout">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link to="/admin" className="cta-button full-width">
              <span>Admin</span>
            </Link>
          )}
          <p className="drawer-copyright">© 2026 Wild Tusker Sri Lanka</p>
        </div>
      </div>
    </header>
  );
}
