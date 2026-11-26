/**
 * @file App.jsx
 * @description Main application routing configuration, top-level layout,
 * navigation scroll restoration, and global crash fallback error boundary.
 */

import React, { useEffect, useLayoutEffect } from 'react';
import { Routes, Route, useLocation, useNavigationType, Navigate } from 'react-router-dom';

/* ── Components & Views ────────────────────────────────────── */
import Navbar from './views/components/Navbar';
import Home from './views/pages/Home';
import AboutUs from './views/pages/AboutUs';
import WildTuskersList from './views/pages/WildTuskersList';
import OurProjects from './views/pages/OurProjects';
import TuskerProfile from './views/pages/TuskerProfile';
import AddTuskerSighting from './views/pages/AddTuskerSighting';
import AdminPortal from './views/pages/AdminPortal';
import TuskerForm from './views/pages/TuskerForm';
import EventForm from './views/pages/EventForm';
import FieldNotes from './views/pages/FieldNotes';
import FieldNoteForm from './views/pages/FieldNoteForm';
import SpecialObservationForm from './views/pages/SpecialObservationForm';
import TuskerIdentificationForm from './views/pages/TuskerIdentificationForm';
import Learn from './views/pages/Learn';
import Gallery from './views/pages/Gallery';
import UnlistedMonitoring from './views/pages/UnlistedMonitoring';
import UnlistedTuskerProfile from './views/pages/UnlistedTuskerProfile';
import Login from './views/pages/Login';
// AIApp component hidden until separate project is ready for release
// import AIApp from './views/pages/AIApp';
import NotFound from './views/pages/NotFound';
import TuskerMap from './views/pages/TuskerMap';
import DistrictMap from './views/pages/DistrictMap';
import { RequireAdmin, VisitorOnly } from './views/components/RouteGuards';

/* ── Error Boundary ────────────────────────────────────────── */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center font-sans pt-[100px]">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-600 max-w-md mb-6">
            {this.state.error?.message || 'An unexpected error occurred while loading this view.'}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 bg-[#0b2518] hover:bg-[#133824] text-white rounded-lg text-sm font-semibold transition-all cursor-pointer border-none shadow-xs"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Legacy Route Redirect Helper ──────────────────────────── */
function LearnRedirect() {
  const loc = useLocation();
  return <Navigate to={{ pathname: '/tusker-insights', search: loc.search }} replace />;
}

/* ── Application Router ────────────────────────────────────── */
function App() {
  const location = useLocation();
  const navType = useNavigationType();
  const showNavbar = location.pathname !== '/login';

  // Use manual history scroll restoration so async-loaded pages restore accurately on
  // Desktop Browser Back, iPhone swipe-right, and Android Back (POP navigation)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Continuously save scroll position per history entry key so POP back works everywhere
  useEffect(() => {
    const key = location.key || 'default';
    const saveScroll = () => {
      // Do not overwrite saved scroll with 0 while a modal/lightbox has body fixed-locked
      if (document.body.style.position === 'fixed') return;
      try {
        sessionStorage.setItem(`wts_scroll_${key}`, String(window.scrollY || 0));
      } catch { /* ignore */ }
    };

    let rafId = null;
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        saveScroll();
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
      saveScroll();
    };
  }, [location.key]);

  // Restore scroll on POP (browser back / iOS swipe / Android back), waiting for async content if needed
  useLayoutEffect(() => {
    if (navType !== 'POP') return;

    // Gallery has its own card-centering restoration when returning from a Tusker Profile
    if (location.pathname === '/gallery') {
      try {
        if (
          sessionStorage.getItem('wts_last_gallery_photo_id') ||
          sessionStorage.getItem('wts_last_gallery_scroll')
        ) {
          return;
        }
      } catch { /* ignore */ }
    }

    let savedY = null;
    try {
      const raw = sessionStorage.getItem(`wts_scroll_${location.key || 'default'}`);
      if (raw !== null) {
        const parsed = parseInt(raw, 10);
        if (!Number.isNaN(parsed) && parsed >= 0) savedY = parsed;
      }
    } catch { /* ignore */ }

    if (savedY === null) return;

    let cancelled = false;
    const cancelOnUserScroll = () => {
      cancelled = true;
    };
    window.addEventListener('wheel', cancelOnUserScroll, { passive: true, once: true });
    window.addEventListener('touchstart', cancelOnUserScroll, { passive: true, once: true });

    const tryRestore = () => {
      if (cancelled) return false;
      window.scrollTo({ top: savedY, behavior: 'instant' });
      return document.documentElement.scrollHeight >= savedY + window.innerHeight * 0.5;
    };

    tryRestore();

    const mainEl = document.getElementById('main-content');
    let observer = null;
    if (mainEl && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        if (tryRestore()) {
          observer?.disconnect();
        }
      });
      observer.observe(mainEl);
    }

    const stopTimer = setTimeout(() => {
      observer?.disconnect();
      window.removeEventListener('wheel', cancelOnUserScroll);
      window.removeEventListener('touchstart', cancelOnUserScroll);
    }, 1800);

    return () => {
      cancelled = true;
      observer?.disconnect();
      clearTimeout(stopTimer);
      window.removeEventListener('wheel', cancelOnUserScroll);
      window.removeEventListener('touchstart', cancelOnUserScroll);
    };
  }, [location.key, location.pathname, navType]);

  // Automatically ensure body overflow and padding are never locked across page transitions
  useEffect(() => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.documentElement.style.overflow = '';

    let hasGalleryReturn = false;
    if (location.pathname === '/gallery') {
      try {
        hasGalleryReturn = Boolean(
          sessionStorage.getItem('wts_last_gallery_scroll') ||
          sessionStorage.getItem('wts_last_gallery_photo_id')
        );
      } catch { /* ignore */ }
    }

    const isDirectZoneOrRisk =
      location.state?.scrollToMap ||
      location.hash?.includes('zones-map') ||
      location.search?.includes('zone=') ||
      location.state?.scrollToRiskFramework ||
      location.hash?.includes('risk-framework');

    if (
      navType === 'PUSH' &&
      !location.state?.returnPhotoId &&
      !location.state?.restoreScroll &&
      !hasGalleryReturn &&
      !isDirectZoneOrRisk
    ) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.state, location.hash, location.search, navType]);

  const skipMainFade = Boolean(
    location.state?.scrollToRiskFramework ||
    location.hash?.includes('risk-framework') ||
    location.state?.scrollToMap ||
    location.hash?.includes('zones-map') ||
    location.search?.includes('zone=') ||
    location.state?.returnPhotoId ||
    location.state?.restoreScroll
  );

  return (
    <>
      {showNavbar && <Navbar />}
      <main id="main-content" key={location.pathname} className={`${skipMainFade ? '' : 'animate-fade-in '}flex-1 flex flex-col w-full max-w-full overflow-x-hidden`}>
        <ErrorBoundary>
          <Routes>
            {/* Public Core Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/tuskers" element={<WildTuskersList />} />
            <Route path="/tuskers/:id" element={<TuskerProfile />} />
            <Route path="/tuskers/:id/add-sighting" element={<RequireAdmin><AddTuskerSighting /></RequireAdmin>} />
            <Route path="/projects" element={<OurProjects />} />
            <Route path="/field-notes" element={<FieldNotes />} />
            <Route path="/add-field-note" element={<VisitorOnly adminTo="/field-notes"><FieldNoteForm /></VisitorOnly>} />
            <Route path="/tusker-insights" element={<Learn />} />
            <Route path="/special-observations" element={<LearnRedirect />} />
            <Route path="/learn" element={<LearnRedirect />} />
            <Route path="/observations" element={<Navigate to="/tusker-insights?tab=observations" replace />} />
            <Route path="/special-observation" element={<Navigate to="/tusker-insights" replace />} />
            <Route path="/tusker-identification" element={<Navigate to="/tusker-insights?tab=identification" replace />} />
            <Route path="/gallery" element={<Gallery />} />

            {/* AI Re-identification routes hidden until separate standalone app release */}
            <Route path="/ai-app" element={<Navigate to="/" replace />} />
            <Route path="/ai-reidentification" element={<Navigate to="/" replace />} />

            {/* Unlisted Monitoring Routes (Admin Protected) */}
            <Route path="/unlisted" element={<RequireAdmin><UnlistedMonitoring /></RequireAdmin>} />
            <Route path="/unlisted/:id" element={<RequireAdmin><UnlistedTuskerProfile /></RequireAdmin>} />

            {/* Authentication & Admin Portal Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Navigate to="/login" replace />} />
            <Route path="/admin" element={<RequireAdmin><AdminPortal /></RequireAdmin>} />
            <Route path="/admin/add-tusker" element={<RequireAdmin><TuskerForm /></RequireAdmin>} />
            <Route path="/admin/edit-tusker/:id" element={<RequireAdmin><TuskerForm /></RequireAdmin>} />
            <Route path="/admin/add-observation" element={<RequireAdmin><SpecialObservationForm /></RequireAdmin>} />
            <Route path="/admin/edit-observation/:id" element={<RequireAdmin><SpecialObservationForm /></RequireAdmin>} />
            <Route path="/admin/add-identification" element={<RequireAdmin><TuskerIdentificationForm /></RequireAdmin>} />
            <Route path="/admin/edit-identification/:id" element={<RequireAdmin><TuskerIdentificationForm /></RequireAdmin>} />
            <Route path="/admin/tusker-map" element={<RequireAdmin><TuskerMap /></RequireAdmin>} />
            <Route path="/admin/zone-map" element={<RequireAdmin><TuskerMap /></RequireAdmin>} />
            <Route path="/admin/district-map" element={<RequireAdmin><DistrictMap /></RequireAdmin>} />
            <Route path="/admin/create-event" element={<RequireAdmin><EventForm /></RequireAdmin>} />
            <Route path="/admin/edit-event/:id" element={<RequireAdmin><EventForm /></RequireAdmin>} />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </>
  );
}

export default App;
