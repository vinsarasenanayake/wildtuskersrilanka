import { useState, useEffect } from 'react';
import { getEvents, addEvent, getEventById, updateEvent } from '../models/ProjectModel';
import { useAuth } from './useAuth';

/* ==============================================================
   SECTION 1: PROJECTS & EVENTS TIMELINE CONTROLLER
============================================================== */
export function useProjectFeed() {
  const [events, setEvents] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    let active = true;
    getEvents()
      .then(data => { if (active) setEvents(data); })
      .catch(err => console.error(err))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return {
    upcomingEvents: events.upcoming,
    pastEvents: events.past,
    loading,
    isAdmin,
  };
}

/* ==============================================================
   SECTION 2: EVENT CREATION FORM CONTROLLER
============================================================== */
export function useEventForm(eventId) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: 'upcoming', // 'upcoming' or 'past'
    description: '',
    sharedBy: '',
    image: '',
    images: [],
  });
  const [error, setError] = useState('');
  const [loadingEvent, setLoadingEvent] = useState(Boolean(eventId));

  // Editing: load the saved event into the form
  useEffect(() => {
    if (!eventId) return;
    let active = true;
    getEventById(eventId)
      .then(ev => {
        if (!active) return;
        if (!ev) { setError('This event could not be found.'); return; }
        const images = ev.image ? ev.image.split(',').map(s => s.trim()).filter(Boolean) : [];
        setFormData({
          title: ev.title || '',
          date: ev.date || '',
          type: ev.type === 'past' ? 'past' : 'upcoming',
          description: ev.description || '',
          sharedBy: ev.sharedBy || '',
          image: ev.image || '',
          images,
        });
      })
      .catch(err => { if (active) setError(`Could not load event: ${err.message}`); })
      .finally(() => { if (active) setLoadingEvent(false); });
    return () => { active = false; };
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (urls) => {
    const list = Array.isArray(urls) ? urls : (urls ? [urls] : []);
    setFormData(prev => ({
      ...prev,
      images: list,
      image: list.join(', ')
    }));
  };

  const createEvent = async () => {
    const { title, date, type, description, sharedBy, image, images } = formData;

    if (!title || !date || !description || !sharedBy) {
      setError('Please fill in all required fields.');
      return false;
    }

    const finalImage = (images && images.length > 0)
      ? images.join(', ')
      : (image ? image : null);

    try {
      const payload = { title, date, description, sharedBy, image: finalImage };
      if (eventId) await updateEvent(eventId, payload, type);
      else await addEvent(payload, type);
    } catch (err) {
      setError(`Could not save event: ${err.message}`);
      return false;
    }

    return true;
  };

  return {
    formData,
    setFormData,
    error,
    handleChange,
    handleImagesChange,
    createEvent,
    loadingEvent,
  };
}
