import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

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
import AIApp from './views/pages/AIApp';
import NotFound from './views/pages/NotFound';
import TuskerMap from './views/pages/TuskerMap';
import { RequireAdmin, VisitorOnly } from './views/components/RouteGuards';

/* ── Application Router ────────────────────────────────────── */
function App() {
  const location = useLocation();
  const showNavbar = location.pathname !== '/login';

  // Automatically ensure body overflow and padding are never locked across page transitions
  useEffect(() => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.documentElement.style.overflow = '';
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {showNavbar && <Navbar />}
      <main key={location.pathname} className="animate-fade-in">
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
          <Route path="/ai-app" element={<AIApp />} />
          <Route path="/ai-reidentification" element={<Navigate to="/ai-app" replace />} />

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

          {/* Anything else */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
