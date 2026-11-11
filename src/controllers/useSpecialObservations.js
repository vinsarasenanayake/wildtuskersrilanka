import { useState, useMemo, useEffect } from 'react';
import {
  getSpecialObservations,
  addSpecialObservation,
  updateSpecialObservation,
  deleteSpecialObservation,
} from '../models/SpecialObservationsModel';
import { useAuth } from './useAuth';

/* ==============================================================
   SECTION 1: SPECIAL OBSERVATIONS PUBLIC FEED CONTROLLER
============================================================== */
export function useSpecialObservationsFeed() {
  const [observations, setObservations] = useState([]);
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const { isAdmin } = useAuth();

  const loadObservations = () => {
    const data = getSpecialObservations();
    setObservations(data);
  };

  useEffect(() => {
    loadObservations();
  }, []);

  // Compute available years (sorted descending)
  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    observations.forEach(item => {
      const yr = item.year || (item.date ? new Date(item.date).getFullYear().toString() : '');
      if (yr) yearsSet.add(yr);
    });
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [observations]);

  // Filtered observations
  const filteredObservations = useMemo(() => {
    return observations.filter(item => {
      const matchesYear =
        selectedYear === 'ALL' ||
        item.year === selectedYear ||
        (item.date && new Date(item.date).getFullYear().toString() === selectedYear);

      if (!matchesYear) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.tuskerName && item.tuskerName.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    });
  }, [observations, selectedYear, searchQuery]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this special observation?')) {
      deleteSpecialObservation(id);
      loadObservations();
    }
  };

  return {
    observations: filteredObservations,
    allObservations: observations,
    availableYears,
    selectedYear,
    setSelectedYear,
    searchQuery,
    setSearchQuery,
    canAddObservation: isAdmin,
    isAdmin,
    handleDelete,
    refresh: loadObservations,
  };
}

/* ==============================================================
   SECTION 2: SPECIAL OBSERVATION ADD/EDIT FORM CONTROLLER
============================================================== */
export function useSpecialObservationForm(id) {
  const isEditMode = Boolean(id);
  const { isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    tuskerName: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    description: '',
    images: '',
    author: isAdmin ? 'Admin' : 'WTS Researcher',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const all = getSpecialObservations();
      const existing = all.find(item => item.id === Number(id));
      if (existing) {
        setFormData({
          title: existing.title || '',
          tuskerName: existing.tuskerName || '',
          date: existing.date || '',
          location: existing.location || '',
          description: existing.description || '',
          images: Array.isArray(existing.images) ? existing.images.join(', ') : (existing.images || ''),
          author: existing.author || '',
        });
      }
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveObservation = () => {
    const { title, tuskerName, date, location, description, images, author } = formData;

    if (!title || !date || !description || !tuskerName) {
      setError('Please provide Tusker Name, Title, Date, and Description.');
      return false;
    }

    const imageArray = images
      ? images
          .split(',')
          .map(url => url.trim())
          .filter(Boolean)
      : [];

    const payload = {
      title,
      tuskerName,
      date,
      year: new Date(date).getFullYear().toString(),
      location: location || 'Sri Lanka',
      description,
      images: imageArray,
      author: author || 'Admin',
    };

    if (isEditMode) {
      updateSpecialObservation(id, payload);
    } else {
      addSpecialObservation(payload);
    }

    return true;
  };

  return {
    formData,
    error,
    handleChange,
    saveObservation,
    isEditMode,
  };
}
