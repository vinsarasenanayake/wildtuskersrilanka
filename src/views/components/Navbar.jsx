import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Home, Info, Database, BookOpen, Binoculars, Calendar, Shield, Camera } from 'lucide-react';
import { SITE_ASSETS } from '../../constants/siteAssets';
const wtsLogo = SITE_ASSETS.wtsLogo;
import { useAuth } from '../../controllers/useAuth';

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

  const handleLogoutClick = async () => {
    await logout();
    closeMenu();
    navigate('/');
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const visibleNavItems = navItems;

  const isHome = location.pathname === '/';
  const isScrolledState = isScrolled || !isHome;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[1000] flex items-center transition-all duration-300 ${
        isScrolledState ? 'h-[70px] bg-gradient-to-r from-primary to-primary-light shadow-md' : 'h-[80px] bg-transparent'
      }`}
    >
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between h-full">

        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-[0.75rem] shrink-0">
          <div className="flex items-center justify-center">
            <img src={wtsLogo} className="block h-[52px] w-auto object-contain" alt="Wild Tuskers Sri Lanka Logo" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        {/* Full menu from 1280 px. Between 1280 and 1535 px it is a little
            more compact (no icons, tighter spacing) so every tab fits;
            narrower screens use the ☰ menu. */}
        <nav className="hidden xl:flex items-center flex-1 justify-center px-2 2xl:px-4">
          <ul className="flex list-none items-center gap-4 min-[1440px]:gap-5 2xl:gap-8">
            {visibleNavItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`inline-flex items-center gap-2 font-medium text-[0.9rem] 2xl:text-[0.96rem] whitespace-nowrap relative py-2 px-1 transition-all duration-300 group ${
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
        <div className={`flex items-center gap-3 2xl:gap-4 shrink-0 ${
          isAdmin && location.pathname === '/admin'
            ? ''
            : 'ml-3 2xl:ml-6 pl-3 2xl:pl-6 border-l border-white/20'
        }`}>
          {!isAdmin && (
            <a
              href="https://www.facebook.com/groups/785810441596309/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center opacity-85 hover:opacity-100 hover:scale-110 transition-all duration-200 cursor-pointer mr-1"
              title="Wild Tuskers Sri Lanka Facebook Group"
            >
              <Facebook size={26} />
            </a>
          )}

          {isAdmin ? (
            <>
              {location.pathname !== '/admin' && (
                <Link
                  to="/admin"
                  className="font-semibold text-[0.86rem] px-3 2xl:px-4 py-[0.55rem] rounded-[4px] hidden sm:inline-flex whitespace-nowrap items-center gap-1.5 transition-all duration-300 bg-white/15 text-white hover:bg-white/25"
                >
                  <Shield size={15} />
                  <span>Admin Portal</span>
                </Link>
              )}
              <button
                onClick={handleLogoutClick}
                className="bg-primary-light text-white font-semibold text-[0.85rem] px-3 2xl:px-4 py-[0.55rem] rounded-[4px] hidden sm:inline-flex whitespace-nowrap items-center gap-1 shadow-[0_4px_10px_rgba(11,37,24,0.15)] hover:-translate-y-[0.5px] hover:bg-white/10! hover:border-white! transition-all duration-300 cursor-pointer"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={`hidden sm:inline-flex items-center gap-[0.45rem] xl:gap-2 font-medium text-[0.88rem] xl:text-[0.94rem] 2xl:text-[0.96rem] whitespace-nowrap relative py-2 px-1 transition-all duration-300 group ${
                isActive('/login') || isActive('/admin')
                  ? 'opacity-100 text-accent font-semibold'
                  : 'text-white/85 hover:opacity-100 hover:text-accent'
              }`}
            >
              <Shield
                size={15}
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
            className={`flex xl:hidden items-center justify-center p-2 text-white opacity-85 hover:opacity-100 transition-opacity duration-200`}
            onClick={toggleMenu}
            aria-label="Toggle Navigation"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-[#0b2518]/40 backdrop-blur-sm z-[998] transition-opacity duration-350 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMenu}
      />

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full max-w-[320px] bg-bg-card z-[999] flex flex-col px-8 py-6 shadow-[-10px_0_30px_rgba(0,0,0,0.05)] transition-transform duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between pb-6 border-b border-border mb-8">
          <span className="font-serif text-[1.25rem] font-bold text-text-dark">Navigation</span>
          <button
            className="flex items-center justify-center p-1.5 text-text-dark rounded-[4px] hover:bg-border transition-colors cursor-pointer"
            onClick={closeMenu}
            aria-label="Close navigation"
          >
            <X size={24} />
          </button>
        </div>

        <nav>
          <ul className="flex flex-col list-none gap-6">
            {visibleNavItems.map((item, idx) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              return (
                <li
                  key={item.name}
                  className={`transition-all duration-400 ease-out ${
                    isOpen ? 'translate-x-0 opacity-100' : 'translate-x-5 opacity-0'
                  }`}
                  style={{ transitionDelay: `${idx * 0.05}s` }}
                >
                  <Link
                    to={item.path}
                    onClick={closeMenu}
                    className={`font-sans text-[1.15rem] font-medium inline-flex items-center gap-[0.6rem] py-2 transition-all duration-200 hover:text-accent hover:pl-1 group ${
                      active ? 'text-accent pl-1' : 'text-text-dark'
                    }`}
                  >
                    <IconComponent
                      size={18}
                      className={`text-text-muted transition-colors group-hover:text-accent ${
                        active ? 'text-accent' : ''
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

        <div className="mt-auto flex flex-col gap-4 pt-6 border-t border-border">
          {!isAdmin && (
            <div className="flex justify-center mb-1">
              <a
                href="https://www.facebook.com/groups/785810441596309/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-200 cursor-pointer"
                title="Wild Tuskers Sri Lanka Facebook Group"
              >
                <Facebook size={30} />
              </a>
            </div>
          )}

          {isAdmin ? (
            <div className="flex flex-col gap-2">
              <Link
                to="/admin"
                onClick={closeMenu}
                className="bg-accent! text-primary! font-semibold text-[0.95rem] py-[0.8rem] px-6 rounded-[4px] w-full flex items-center justify-center gap-2 shadow-[0_4px_10px_rgba(11,37,24,0.15)] hover:bg-accent-hover! transition-all duration-300"
              >
                <Shield size={16} />
                <span>Admin Portal</span>
              </Link>
              <button
                onClick={handleLogoutClick}
                className="bg-primary-light text-white font-semibold text-[0.95rem] py-[0.8rem] px-6 rounded-[4px] w-full flex items-center justify-center gap-1.5 shadow-[0_4px_10px_rgba(11,37,24,0.15)] hover:bg-primary transition-all duration-300 cursor-pointer"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={closeMenu}
              className="bg-primary-light text-white font-semibold text-[1rem] py-[0.85rem] px-6 rounded-[4px] w-full flex items-center justify-center gap-2 shadow-[0_4px_10px_rgba(11,37,24,0.15)] hover:bg-primary transition-all duration-300"
            >
              <Shield size={16} />
              <span>Admin Login</span>
            </Link>
          )}
          <p className="font-sans text-[0.75rem] text-text-muted text-center mb-0">© 2026 Wild Tuskers Sri Lanka</p>
        </div>
      </div>
    </header>
  );
}
