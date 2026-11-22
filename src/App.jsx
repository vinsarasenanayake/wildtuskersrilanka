/**
 * @file App.jsx
 * @description Main application routing configuration, top-level layout,
 * navigation scroll restoration, and global crash fallback error boundary.
 */

import React, { useEffect } from 'react';
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
import SpecialObservations from './views/pages/SpecialObservations';
import SpecialObservationForm from './views/pages/SpecialObservationForm';
import Gallery from './views/pages/Gallery';
import UnlistedMonitoring from './views/pages/UnlistedMonitoring';
import UnlistedTuskerProfile from './views/pages/UnlistedTuskerProfile';
import Login from './views/pages/Login';
// AIApp component hidden until separate project is ready for release
// import AIApp from './views/pages/AIApp';
import NotFound from './views/pages/NotFound';
import TuskerMap from './views/pages/TuskerMap';
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

/* ── Application Router ────────────────────────────────────── */
function App() {
  const location = useLocation();
  const navType = useNavigationType();
  const showNavbar = location.pathname !== '/login';

  // Automatically ensure body overflow and padding are never locked across page transitions
  useEffect(() => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.documentElement.style.overflow = '';

    if (navType === 'PUSH') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, navType]);

  return (
    <>
      {showNavbar && <Navbar />}
      <main key={location.pathname} className="animate-fade-in">
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
            <Route path="/observations" element={<SpecialObservations />} />
            <Route path="/gallery" element={<Gallery />} />

            {/* AI Re-identification routes hidden until separate standalone app release */}
            <Route path="/ai-app" element={<Navigate to="/" replace />} />
            <Route path="/ai-reidentification" element={<Navigate to="/" replace />} />

            {/* Unlisted Monitoring Routes (Admin Protected) */}
            <Route path="/unlisted" element={<UnlistedMonitoring />} />
            <Route path="/unlisted/:id" element={<UnlistedTuskerProfile />} />

            {/* Authentication & Admin Portal Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Navigate to="/login" replace />} />
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="/admin/add-tusker" element={<RequireAdmin><TuskerForm /></RequireAdmin>} />
            <Route path="/admin/edit-tusker/:id" element={<RequireAdmin><TuskerForm /></RequireAdmin>} />
            <Route path="/admin/add-observation" element={<RequireAdmin><SpecialObservationForm /></RequireAdmin>} />
            <Route path="/admin/edit-observation/:id" element={<RequireAdmin><SpecialObservationForm /></RequireAdmin>} />
            <Route path="/admin/tusker-map" element={<RequireAdmin><TuskerMap /></RequireAdmin>} />
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
