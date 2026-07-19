import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronRight, PlusCircle, LogOut } from 'lucide-react';
import wtsLogo from '../assets/images/wtslogo.png';
import './Navbar.css';

const navItems = [
  { name: 'Home',              path: '/' },
  { name: 'About Us',          path: '/about' },
  { name: 'Wild Tuskers List', path: '/tuskers' },
  { name: 'Our Research',      path: '/research' },
  { name: 'Our Projects',      path: '/projects' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <header className="wts-header scrolled">
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
            {navItems.map((item) => (
              <li key={item.name} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* CTA + Mobile Toggle */}
        <div className="header-actions">
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
            {navItems.map((item, idx) => (
              <li
                key={item.name}
                className="mobile-nav-item"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <Link
                  to={item.path}
                  className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="drawer-footer">
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
