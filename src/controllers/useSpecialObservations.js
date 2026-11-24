/**
 * @file useSpecialObservations.js
 * @description Controller hooks for special observations feed, filtering, and admin editing.
 */

import { useState, useMemo, useEffect } from 'react';
import {
  getSpecialObservations,
  getCachedSpecialObservations,
  getSpecialObservationById,
  addSpecialObservation,
  updateSpecialObservation,
  deleteSpecialObservation,
} from '../models/SpecialObservationsModel';
import { useAuth } from './useAuth';
import { uploadMediaFile } from '../utils/storageUpload';
import { todayLocalISO, isFutureDateTime } from '../utils/localDate';

/* ==============================================================
   SECTION 1: SPECIAL OBSERVATIONS PUBLIC FEED CONTROLLER
============================================================== */
export function useSpecialObservationsFeed() {
  const cached = getCachedSpecialObservations();
  const [observations, setObservations] = useState(() => cached || []);
  const [loading, setLoading] = useState(() => !cached || cached.length === 0);
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const { isAdmin } = useAuth();

  const loadObservations = async (force = false) => {
    try {
      setObservations(await getSpecialObservations(force));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If cached observations exist, immediately refresh in background (stale-while-revalidate)
    loadObservations(true);
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this special observation?')) {
      try {
        await deleteSpecialObservation(id);
      } catch (err) {
        alert(`Delete failed: ${err.message}`);
      }
      await loadObservations();
    }
  };

  return {
    loading,
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
    date: todayLocalISO(),
    time: '',
    location: '',
    description: '',
    images: [],
    author: isAdmin ? 'WTS Admin' : 'WTS Researcher',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;
    let active = true;
    getSpecialObservationById(id).then(existing => {
      if (active && existing) {
        setFormData({
          title: existing.title || '',
          tuskerName: existing.tuskerName || '',
          date: existing.hideDate ? '' : (existing.date || ''),
          time: existing.time || '',
          location: existing.location || '',
          description: existing.description || '',
          images: Array.isArray(existing.images) ? existing.images : [],
          author: existing.author || '',
        });
      }
    }).catch(err => active && setError(err.message));
    return () => { active = false; };
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddImages = async (files) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    try {
      const fileList = Array.from(files).filter((file) => file.type?.startsWith('image/'));
      const uploadedUrls = await Promise.all(
        fileList.map(async (file) => {
          try {
            return await uploadMediaFile(file, 'observations');
          } catch (uploadErr) {
            console.warn('[useSpecialObservations] Direct upload failed, falling back to base64 preview', uploadErr);
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (ev) => resolve(ev.target.result);
              reader.readAsDataURL(file);
            });
          }
        })
      );
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls.filter(Boolean)],
      }));
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  const saveObservation = async () => {
    const { title, tuskerName, date, time, location, description, images, author } = formData;

    if (!title || !description || !tuskerName) {
      setError('Please provide Tusker Name, Title, and Description.');
      return false;
    }
    if (date && date > todayLocalISO()) {
      setError('Observation date cannot be in the future.');
      return false;
    }
    if (date && time && isFutureDateTime(date, time)) {
      setError('Observation time cannot be in the future for today.');
      return false;
    }

    setSubmitting(true);
    setError('');

    try {
      // Ensure any fallback base64 images are uploaded to Supabase Storage before persisting
      const resolvedImages = await Promise.all(
        (images || []).map(async (img) => {
          if (typeof img === 'string' && img.startsWith('data:')) {
            try {
              return await uploadMediaFile(img, 'observations');
            } catch (err) {
              console.warn('[useSpecialObservations] Base64 upload failed on save', err);
              return img;
            }
          }
          return img;
        })
      );

      const hasDate = Boolean(date && String(date).trim());
      const payload = {
        title,
        tuskerName,
        date: hasDate ? date : todayLocalISO(),
        hideDate: !hasDate,
        time: time || null,
        location: location || null,
        description,
        images: Array.isArray(resolvedImages) ? resolvedImages : [],
        author: author || 'WTS Admin',
      };

      if (isEditMode) {
        await updateSpecialObservation(id, payload);
      } else {
        await addSpecialObservation(payload);
      }
    } catch (err) {
      setError(`Could not save observation: ${err.message}`);
      return false;
    } finally {
      setSubmitting(false);
    }

    return true;
  };

  return {
    formData,
    setFormData,
    error,
    submitting,
    uploadingImages,
    handleChange,
    handleAddImages,
    handleRemoveImage,
    saveObservation,
    isEditMode,
  };
}
