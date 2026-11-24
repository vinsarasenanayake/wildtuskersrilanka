/**
 * @file useProjects.js
 * @description Controller hooks for conservation projects, outreach events, and event forms.
 */

import { useState, useEffect } from 'react';
import { getEvents, getCachedEvents, addEvent, getEventById, updateEvent, deleteEvent } from '../models/ProjectModel';
import { useAuth } from './useAuth';

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/* ==============================================================
   SECTION 1: PROJECTS & EVENTS TIMELINE CONTROLLER
============================================================== */
export function useProjectFeed() {
  const cached = getCachedEvents();
  const [events, setEvents] = useState(() => cached || { upcoming: [], past: [] });
  const [loading, setLoading] = useState(() => !cached);
  const { isAdmin } = useAuth();

  const fetchEvents = async () => {
    try {
      const data = await getEvents(true);
      setEvents(data);
      return data;
    } catch (err) {
      console.error('Failed to load project events:', err);
      throw err;
    }
  };

  useEffect(() => {
    let active = true;
    getEvents()
      .then(data => { if (active) setEvents(data); })
      .catch(err => console.error(err))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const removeEvent = async (id) => {
    await deleteEvent(id);
    await fetchEvents();
  };

  return {
    upcomingEvents: events.upcoming,
    pastEvents: events.past,
    loading,
    isAdmin,
    removeEvent,
    refreshEvents: fetchEvents,
  };
}

/* ==============================================================
   SECTION 2: EVENT CREATION FORM CONTROLLER
============================================================== */
export function useEventForm(eventId) {
  const todayStr = getTodayDateString();

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
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
        const isPast = ev.date && ev.date < getTodayDateString();
        setFormData({
          title: ev.title || '',
          date: ev.date || '',
          time: ev.time || '',
          location: ev.location || '',
          type: isPast ? 'past' : (ev.type === 'past' ? 'past' : 'upcoming'),
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

  const isPastDate = Boolean(formData.date && formData.date < todayStr);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'date') {
        const curToday = getTodayDateString();
        if (value && value < curToday) {
          updated.type = 'past';
        }
      }
      return updated;
    });
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
    const { title, date, time, location, type, description, sharedBy, image, images } = formData;

    if (!title || !date || !description || !sharedBy) {
      setError('Please fill in all required fields.');
      return false;
    }

    const curToday = getTodayDateString();
    const effectiveType = (date && date < curToday) ? 'past' : type;

    const finalImage = (images && images.length > 0)
      ? images.join(', ')
      : (image ? image : null);

    try {
      const payload = {
        title,
        date,
        time: time || null,
        location: location || null,
        description,
        sharedBy,
        image: finalImage,
      };
      if (eventId) await updateEvent(eventId, payload, effectiveType);
      else await addEvent(payload, effectiveType);
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
    isPastDate,
  };
}
