import React from 'react';
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
import UnlistedMonitoring from './views/pages/UnlistedMonitoring';
import UnlistedTuskerProfile from './views/pages/UnlistedTuskerProfile';
import Login from './views/pages/Login';

/* ── Application Router ────────────────────────────────────── */
function App() {
  const location = useLocation();
  const showNavbar = location.pathname !== '/login';

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
          <Route path="/tuskers/:id/add-sighting" element={<AddTuskerSighting />} />
          <Route path="/projects" element={<OurProjects />} />
          <Route path="/field-notes" element={<FieldNotes />} />
          <Route path="/add-field-note" element={<FieldNoteForm />} />
          <Route path="/observations" element={<SpecialObservations />} />

          {/* Unlisted Monitoring Routes (Admin Protected) */}
          <Route path="/unlisted" element={<UnlistedMonitoring />} />
          <Route path="/unlisted/:id" element={<UnlistedTuskerProfile />} />

          {/* Authentication & Admin Portal Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Navigate to="/login" replace />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/admin/add-tusker" element={<TuskerForm />} />
          <Route path="/admin/edit-tusker/:id" element={<TuskerForm />} />
          <Route path="/admin/add-observation" element={<SpecialObservationForm />} />
          <Route path="/admin/edit-observation/:id" element={<SpecialObservationForm />} />
          <Route path="/admin/create-event" element={<EventForm />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
