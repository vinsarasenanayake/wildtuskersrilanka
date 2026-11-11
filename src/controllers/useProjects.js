import { useState, useMemo } from 'react';
import { getEvents, addEvent } from '../models/ProjectModel';

/* ==============================================================
   SECTION 1: PROJECTS & EVENTS TIMELINE CONTROLLER
============================================================== */
export function useProjectFeed() {
  const { upcoming, past } = useMemo(() => getEvents(), []);
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  return {
    upcomingEvents: upcoming,
    pastEvents: past,
    isAdmin,
  };
}

/* ==============================================================
   SECTION 2: EVENT CREATION FORM CONTROLLER
============================================================== */
export function useEventForm() {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: 'upcoming', // 'upcoming' or 'past'
    description: '',
    sharedBy: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createEvent = () => {
    const { title, date, type, description, sharedBy } = formData;

    if (!title || !date || !description || !sharedBy) {
      setError('Please fill in all required fields.');
      return false;
    }

    addEvent({
      title,
      date,
      description,
      sharedBy,
      image: null
    }, type);

    return true;
  };

  return {
    formData,
    error,
    handleChange,
    createEvent,
  };
}
