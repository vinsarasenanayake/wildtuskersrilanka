import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import WildTuskersList from './pages/WildTuskersList';
import OurProjects from './pages/OurProjects';
import TuskerProfile from './pages/TuskerProfile';
import AdminLogin from './pages/AdminLogin';
import TuskerForm from './pages/TuskerForm';
import EventForm from './pages/EventForm';
import './App.css';

function App() {
  const location = useLocation();
  const showNavbar = location.pathname !== '/admin';

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/"                    element={<Home />} />
        <Route path="/about"               element={<AboutUs />} />
        <Route path="/tuskers"             element={<WildTuskersList />} />
        <Route path="/tuskers/:id"         element={<TuskerProfile />} />
        <Route path="/projects"            element={<OurProjects />} />
        <Route path="/admin"               element={<AdminLogin />} />
        <Route path="/admin/add-tusker"    element={<TuskerForm />} />
        <Route path="/admin/edit-tusker/:id" element={<TuskerForm />} />
        <Route path="/admin/create-event"  element={<EventForm />} />
      </Routes>
    </>
  );
}

export default App;
