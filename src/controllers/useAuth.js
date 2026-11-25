/**
 * @file useAuth.js
 * @description Central authentication state hook and store. Subscribes to Supabase Auth
 * session events and synchronizes administrative privileges with public.admin_users table.
 */

import { useState, useEffect, useSyncExternalStore } from 'react';
import { supabase } from '../lib/supabaseClient';

/* ==============================================================
   SECTION 1: SHARED AUTH STORE (Supabase Auth)
   One subscription for the whole app. `isAdmin` is true only when
   the signed-in user is listed in public.admin_users - the same
   check the database's Row Level Security uses.
============================================================== */
let authState = { isAdmin: false, authLoading: true, user: null };
if (import.meta.env.DEV) {
  try {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('wts_qa_admin') === 'true') {
      authState = {
        user: { id: 'test-admin-qa', email: 'admin@wildtuskersrilanka.com' },
        isAdmin: true,
        authLoading: false,
      };
    }
  } catch { /* ignore */ }
}
const listeners = new Set();

function setAuthState(next) {
  authState = { ...authState, ...next };
  listeners.forEach(l => l());
}

async function checkAdmin(user) {
  if (!user) return false;
  const { data, error } = await supabase
    .from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
  if (error) console.error('[Auth] admin check failed', error);
  return Boolean(data);
}

async function applySession(session) {
  if (import.meta.env.DEV) {
    try {
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('wts_qa_admin') === 'true') {
        setAuthState({
          user: { id: 'test-admin-qa', email: 'admin@wildtuskersrilanka.com' },
          isAdmin: true,
          authLoading: false,
        });
        return;
      }
    } catch { /* ignore */ }
  }
  const user = session?.user ?? null;
  const isAdmin = await checkAdmin(user);
  setAuthState({ user, isAdmin, authLoading: false });
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__setAdminForTesting = (val = true) => {
    try {
      if (val) sessionStorage.setItem('wts_qa_admin', 'true');
      else sessionStorage.removeItem('wts_qa_admin');
    } catch { /* ignore */ }
    setAuthState({
      user: val ? { id: 'test-admin-qa', email: 'admin@wildtuskersrilanka.com' } : null,
      isAdmin: val,
      authLoading: false,
    });
  };
}

supabase.auth.getSession().then(({ data }) => applySession(data.session));
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return;
  // Defer: Supabase recommends not awaiting other calls inside this callback.
  setTimeout(() => applySession(session), 0);
});

const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
const getSnapshot = () => authState;

/* ==============================================================
   SECTION 2: HOOK
   Authentication state (admin privileges) plus top-level
   navigation responsive state (scroll & mobile drawer).
============================================================== */
export function useAuth() {
  const { isAdmin, authLoading, user } = useSyncExternalStore(subscribe, getSnapshot);
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

  /* ── Authentication Handlers ───────────────────────────────── */
  /** Resolves to '' on success, or an error message. */
  const login = async (email, password) => {
    if (!email || !password) {
      return 'Please enter both your admin email and password.';
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      return error.message === 'Invalid login credentials'
        ? 'Invalid admin credentials.'
        : error.message;
    }
    const admin = await checkAdmin(data.user);
    if (!admin) {
      await supabase.auth.signOut();
      return 'This account does not have admin access.';
    }
    setAuthState({ user: data.user, isAdmin: true, authLoading: false });
    return '';
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAuthState({ user: null, isAdmin: false, authLoading: false });
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
    authLoading,
    user,
    isScrolled,
    isOpen,
    toggleMenu,
    closeMenu,
    login,
    logout,
  };
}
