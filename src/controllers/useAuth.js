import { useState, useEffect } from 'react';

/**
 * Controller hook managing authentication state (admin privileges)
 * and top-level navigation responsive state (scroll & mobile drawer).
 */
export function useAuth() {
  /* ── State ─────────────────────────────────────────────────── */
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  /* ── Scroll Detection ──────────────────────────────────────── */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Auth Synchronization Across Windows/Components ───────── */
  useEffect(() => {
    const handleAuthChange = () => {
      setIsAdmin(localStorage.getItem('isAdmin') === 'true');
    };
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  /* ── Authentication Handlers ───────────────────────────────── */
  const login = (email, password) => {
    if (!email || !password) {
      return 'Please enter both your admin email and password.';
    }
    const cleanEmail = email.trim().toLowerCase();
    if (
      cleanEmail === 'admin@wildtuskers.lk' &&
      password === 'admin123'
    ) {
      localStorage.setItem('isAdmin', 'true');
      localStorage.removeItem('isMember');
      window.dispatchEvent(new Event('authChange'));
      return '';
    } else {
      return 'Invalid admin credentials. Use admin@wildtuskers.lk and admin123.';
    }
  };

  const logout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('isMember');
    window.dispatchEvent(new Event('authChange'));
  };

  /* ── Navigation Drawer Controls ────────────────────────────── */
  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return {
    isAdmin,
    isScrolled,
    isOpen,
    toggleMenu,
    closeMenu,
    login,
    logout,
  };
}
