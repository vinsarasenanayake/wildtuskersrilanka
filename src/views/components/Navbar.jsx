/**
 * @file Navbar.jsx
 * @description Global responsive navigation bar. Features logo, active route highlighting,
 * social links, mobile drawer navigation, and administrative session controls.
 */

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Home, Info, Database, BookOpen, Binoculars, Calendar, Shield, Camera } from 'lucide-react';
import { SITE_ASSETS } from '../../constants/siteAssets';
import { useAuth } from '../../controllers/useAuth';

const wtsLogo = SITE_ASSETS.wtsLogo;

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
  { name: 'Home',                 path: '/',             icon: Home },
  { name: 'About Us',             path: '/about',        icon: Info },
  { name: 'Wild Tuskers List',    path: '/tuskers',      icon: Database },
  { name: 'The Gallery',          path: '/gallery',      icon: Camera },
  { name: 'Field Notes',          path: '/field-notes',  icon: BookOpen },
  { name: 'Special Observations', path: '/observations', icon: Binoculars },
  { name: 'Our Projects',         path: '/projects',     icon: Calendar },
];

export default function Navbar() {
  const {
    isAdmin,
    isScrolled,
    isOpen,
    toggleMenu,
    closeMenu,
    logout,
  } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const drawerRef = useRef(null);
  const toggleBtnRef = useRef(null);

  // Close mobile drawer on outside click or tap
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(e.target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(e.target)
      ) {
        closeMenu();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeMenu();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeMenu]);

  const handleLogoutClick = async () => {
    await logout();
    closeMenu();
    navigate('/');
  };

  const handleNavClick = (path) => {
    closeMenu();
    if (path === '/tuskers') {
      try {
        sessionStorage.removeItem('wts_last_tusker_id');
        sessionStorage.removeItem('wts_last_tusker_scroll');
      } catch {}
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const visibleNavItems = navItems;

  const isHome = location.pathname === '/';
  const isScrolledState = isScrolled || !isHome;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[1000] flex items-center transition-all duration-300 ${
        isScrolledState
          ? 'h-[66px] sm:h-[70px] lg:h-[74px] bg-gradient-to-r from-primary/95 via-primary-light/95 to-primary/95 backdrop-blur-xl shadow-md border-b border-white/10'
          : 'h-[74px] sm:h-[80px] bg-transparent'
      }`}
    >
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between h-full">

        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-[0.75rem] shrink-0" onClick={closeMenu}>
          <div className="flex items-center justify-center">
            <img
              src={wtsLogo}
              className="block h-[44px] sm:h-[50px] lg:h-[52px] w-auto object-contain"
              alt="Wild Tuskers Sri Lanka Logo"
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        {/* Responsive horizontal menu for laptops, MacBooks, and large screens */}
        <nav className="hidden xl:flex items-center flex-1 justify-center px-2 min-[1440px]:px-4">
          <ul className="flex list-none items-center gap-2.5 min-[1360px]:gap-3.5 min-[1440px]:gap-6 2xl:gap-8 m-0 p-0">
            {visibleNavItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`inline-flex items-center gap-1.5 min-[1440px]:gap-2 font-medium text-[0.86rem] min-[1360px]:text-[0.9rem] 2xl:text-[0.96rem] whitespace-nowrap relative py-2 px-1 transition-all duration-300 group ${
                      active ? 'opacity-100 text-accent font-semibold' : 'text-white/85 hover:opacity-100 hover:text-accent'
                    }`}
                  >
                    <IconComponent
                      size={15}
                      className={`hidden 2xl:block opacity-75 transition-transform duration-200 group-hover:-translate-y-[1px] group-hover:opacity-100 ${
                        active ? 'opacity-100 -translate-y-[1px]' : ''
                      }`}
                    />
                    <span>{item.name}</span>
                    {active && (
                      <span className="absolute bottom-0 left-1 right-1 h-[2px] bg-accent rounded-full transition-all duration-300" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* CTA + Mobile Toggle */}
        <div className={`flex items-center gap-2 sm:gap-3 2xl:gap-4 shrink-0 ${
          isAdmin && location.pathname === '/admin'
            ? ''
            : 'ml-2 sm:ml-3 2xl:ml-6 pl-2 sm:pl-3 2xl:pl-6 border-l border-white/20'
        }`}>
          {!isAdmin && (
            <a
              href="https://www.facebook.com/groups/785810441596309/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center opacity-85 hover:opacity-100 hover:scale-110 transition-all duration-200 cursor-pointer mr-1"
              title="Wild Tuskers Sri Lanka Facebook Group"
            >
              <Facebook size={24} className="sm:w-[26px] sm:h-[26px]" />
            </a>
          )}

          {isAdmin ? (
            <>
              {location.pathname !== '/admin' && (
                <Link
                  to="/admin"
                  className="font-semibold text-xs sm:text-[0.86rem] px-2.5 sm:px-3 2xl:px-4 py-1.5 sm:py-[0.55rem] rounded-[6px] hidden sm:inline-flex whitespace-nowrap items-center gap-1.5 transition-all duration-300 bg-white/15 text-white hover:bg-white/25 shadow-xs"
                >
                  <Shield size={14} />
                  <span>Admin Portal</span>
                </Link>
              )}
              <button
                onClick={handleLogoutClick}
                className="bg-primary-light text-white font-semibold text-xs sm:text-[0.85rem] px-2.5 sm:px-3 2xl:px-4 py-1.5 sm:py-[0.55rem] rounded-[6px] hidden sm:inline-flex whitespace-nowrap items-center gap-1 shadow-[0_4px_10px_rgba(11,37,24,0.15)] hover:-translate-y-[0.5px] hover:bg-white/10! hover:border-white! transition-all duration-300 cursor-pointer border-none"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={`hidden sm:inline-flex items-center gap-1.5 xl:gap-2 font-medium text-xs sm:text-[0.88rem] xl:text-[0.94rem] 2xl:text-[0.96rem] whitespace-nowrap relative py-2 px-1 transition-all duration-300 group ${
                isActive('/login') || isActive('/admin')
                  ? 'opacity-100 text-accent font-semibold'
                  : 'text-white/85 hover:opacity-100 hover:text-accent'
              }`}
            >
              <Shield
                size={14}
                className={`opacity-75 transition-transform duration-200 group-hover:-translate-y-[1px] group-hover:opacity-100 ${
                  isActive('/login') || isActive('/admin') ? 'opacity-100 -translate-y-[1px]' : ''
                }`}
              />
              <span>Admin Login</span>
              {(isActive('/login') || isActive('/admin')) && (
                <span className="absolute bottom-0 left-1 right-1 h-[2px] bg-accent rounded-full transition-all duration-300" />
              )}
            </Link>
          )}

          <button
            ref={toggleBtnRef}
            className="flex xl:hidden items-center justify-center p-2 text-white opacity-90 hover:opacity-100 transition-opacity duration-200 rounded-lg hover:bg-white/10 cursor-pointer border-none bg-transparent"
            onClick={toggleMenu}
            aria-label="Toggle Navigation"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Render Mobile Backdrop & Drawer at document root via createPortal to guarantee full viewport outside-click capture */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {/* Mobile Backdrop Overlay */}
          <div
            className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-[9998] transition-opacity duration-300 ${
              isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={closeMenu}
          />

          {/* Mobile Full-Height Drawer with Solid Opaque Professional Curved Left Edge */}
          <div
            ref={drawerRef}
            className={`fixed top-0 right-0 bottom-0 h-screen h-[100dvh] w-[310px] sm:w-[350px] max-w-[86vw] bg-[#0b2518] bg-gradient-to-b from-[#081d13] via-[#0b2619] to-[#081d13] z-[9999] flex flex-col p-4 sm:p-6 pb-28 sm:pb-8 rounded-l-[26px] sm:rounded-l-[36px] shadow-[-20px_0_60px_rgba(0,0,0,0.85)] border-l border-white/15 text-white transition-all duration-300 ease-out overflow-y-auto overscroll-contain ${
              isOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full opacity-0 pointer-events-none'
            }`}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* Top: Brand Header & Close Button */}
            <div>
              <div className="flex items-center justify-between pb-3 mb-2 sm:pb-4 sm:mb-4 border-b border-white/10">
                <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5">
                  <img src={wtsLogo} className="h-8 sm:h-9 w-auto object-contain" alt="Wild Tuskers Sri Lanka" />
                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-bold uppercase tracking-wider text-accent leading-none">
                      Wild Tuskers
                    </span>
                    <span className="font-sans text-[0.65rem] text-white/60 tracking-widest uppercase mt-0.5">
                      Sri Lanka
                    </span>
                  </div>
                </Link>
                <button
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15"
                  onClick={closeMenu}
                  aria-label="Close navigation"
                >
                  <X size={17} strokeWidth={2.4} />
                </button>
              </div>

              {/* Navigation Items (Clean Glassmorphism List) */}
              <nav>
                <ul className="flex flex-col list-none gap-0.5 sm:gap-1 m-0 p-0">
                  {visibleNavItems.map((item, idx) => {
                    const IconComponent = item.icon;
                    const active = isActive(item.path);
                    return (
                      <li
                        key={item.name}
                        className={`transition-all duration-300 ease-out ${
                          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-0'
                        }`}
                        style={{ transitionDelay: `${idx * 0.025}s` }}
                      >
                        <Link
                          to={item.path}
                          onClick={() => handleNavClick(item.path)}
                          className={`flex items-center gap-2.5 sm:gap-3 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl transition-all duration-200 no-underline cursor-pointer font-sans text-[0.88rem] sm:text-[0.94rem] ${
                            active
                              ? 'bg-accent/20 text-accent font-bold border-l-3 border-accent shadow-xs'
                              : 'text-white/85 font-medium hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <IconComponent size={17} className={active ? 'text-accent' : 'text-white/70'} />
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* Bottom Actions - Glassy Quick Controls & Social Link */}
            <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-2.5">
              {!isAdmin && (
                <div className="flex items-center justify-between px-2">
                  <span className="font-sans text-[0.72rem] sm:text-xs text-white/60 font-medium">Join Community</span>
                  <a
                    href="https://www.facebook.com/groups/785810441596309/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-white/85 hover:text-white transition-all cursor-pointer no-underline"
                    title="Wild Tuskers Sri Lanka Facebook Group"
                  >
                    <Facebook size={18} />
                    <span className="font-medium text-[0.75rem] sm:text-[0.78rem]">Facebook Group</span>
                  </a>
                </div>
              )}

              {isAdmin ? (
                <div className="flex flex-col gap-1.5">
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="bg-accent text-primary font-bold text-[0.82rem] sm:text-[0.86rem] py-2 sm:py-2.5 px-4 rounded-xl w-full flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(202,138,4,0.25)] hover:bg-accent-hover transition-all duration-200 no-underline"
                  >
                    <Shield size={15} />
                    <span>Admin Portal</span>
                  </Link>
                  <button
                    onClick={handleLogoutClick}
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold text-[0.8rem] sm:text-[0.84rem] py-1.5 sm:py-2 px-4 rounded-xl w-full flex items-center justify-center gap-1.5 border border-white/15 transition-all duration-200 cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-[0.82rem] sm:text-[0.86rem] py-2 sm:py-2.5 px-4 rounded-xl w-full flex items-center justify-center gap-2 shadow-xs transition-all duration-200 no-underline"
                >
                  <Shield size={15} className="text-accent" />
                  <span>Admin Login</span>
                </Link>
              )}

              <p className="font-sans text-[0.65rem] text-white/40 text-center mb-0 mt-0.5">
                © 2026 Wild Tuskers Sri Lanka
              </p>
            </div>
          </div>
        </>,
        document.body
      )}
    </header>
  );
}
