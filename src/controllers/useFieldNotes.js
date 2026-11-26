/**
 * @file useFieldNotes.js
 * @description Controller hooks for field notes feed, submission, and admin review.
 * Manages chronological sorting, year grouping, image uploads, and approval lifecycles.
 */

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { isFutureDateTime } from '../utils/localDate';
import {
  getFieldNotes,
  getCachedFieldNotes,
  addFieldNote,
  approveFieldNote,
  rejectFieldNote,
  deleteFieldNote
} from '../models/FieldNotesModel';
import { useAuth } from './useAuth';
import { uploadMediaFile } from '../utils/storageUpload';
import { friendlyError } from '../utils/friendlyError';

/* ==============================================================
   SECTION 1: FIELD NOTES PUBLIC FEED & ADMIN REVIEW CONTROLLER
============================================================== */
export function useFieldNotesFeed() {
  const [allNotes, setAllNotes] = useState(() => getCachedFieldNotes(false) || []);
  const [loading, setLoading] = useState(() => !getCachedFieldNotes(false));
  const { isAdmin, authLoading } = useAuth();

  const reloadNotes = useCallback(async () => {
    try {
      setAllNotes(await getFieldNotes({ admin: isAdmin }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Reload once auth is known (admins also see pending notes)
  useEffect(() => {
    if (!authLoading) reloadNotes();
  }, [authLoading, reloadNotes]);

  // Approved notes visible to all visitors
  const approvedNotes = useMemo(() => {
    return allNotes.filter(note => note.status === 'approved');
  }, [allNotes]);

  // Pending notes awaiting admin review
  const pendingNotes = useMemo(() => {
    return allNotes.filter(note => note.status === 'pending');
  }, [allNotes]);

  // Group approved notes by year
  const notesByYear = useMemo(() => {
    const grouped = {};
    approvedNotes.forEach(note => {
      const year = new Date(note.date).getFullYear().toString();
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(note);
    });
    return grouped;
  }, [approvedNotes]);

  const availableYears = useMemo(() => {
    return Object.keys(notesByYear).sort((a, b) => b - a); // Descending
  }, [notesByYear]);

  const runAndReload = async (action, id) => {
    try {
      await action(id);
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
    await reloadNotes();
  };

  const handleApprove = (id) => runAndReload(approveFieldNote, id);
  const handleReject = (id) => runAndReload(rejectFieldNote, id);
  const handleDelete = (id) => runAndReload(deleteFieldNote, id);

  return {
    loading,
    notes: approvedNotes,
    approvedNotes,
    pendingNotes,
    notesByYear,
    availableYears,
    canAddNote: true, // Field notes can be added by anyone
    isAdmin,
    authLoading,
    approveNote: handleApprove,
    rejectNote: handleReject,
    deleteNote: handleDelete,
    refreshNotes: reloadNotes,
  };
}

/* ==============================================================
   SECTION 2: FIELD NOTE SUBMISSION FORM CONTROLLER
============================================================== */
export function useFieldNoteForm() {
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    author: isAdmin ? 'WTS Admin' : '',
    authorContact: '',
    title: '',
    date: '',
    time: '',
    description: '',
    specialNote: '',
    images: [], // array of image attachment data URLs
    consentAgreed: false,
  });
  const pendingImageFilesRef = useRef([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auth resolves asynchronously; prefill author for admins once known
  useEffect(() => {
    if (isAdmin) {
      setFormData(prev => (prev.author ? prev : { ...prev, author: 'WTS Admin' }));
    }
  }, [isAdmin]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleAddImages = async (newFilesOrUrls) => {
    if (!newFilesOrUrls || newFilesOrUrls.length === 0) return;
    const items = Array.from(newFilesOrUrls);

    // Validate size (<15MB) and type client-side before creating preview
    const validItems = [];
    for (const item of items) {
      if (typeof item === 'string') {
        validItems.push(item);
      } else if (item instanceof File || item instanceof Blob) {
        if (item.size > 15 * 1024 * 1024) {
          setError(`"${item.name || 'Photo'}" is too large (max 15 MB).`);
          return;
        }
        if (item.size < 100) {
          setError(`"${item.name || 'Photo'}" is corrupted or empty.`);
          return;
        }
        validItems.push(item);
      }
    }

    // Generate local preview URLs; defer storage upload until form submit
    const previewUrls = [];
    const filesToUpload = [];
    for (const item of validItems) {
      if (typeof item === 'string') {
        previewUrls.push(item);
      } else {
        const previewUrl = URL.createObjectURL(item);
        previewUrls.push(previewUrl);
        filesToUpload.push({ previewUrl, file: item });
      }
    }

    pendingImageFilesRef.current = [...pendingImageFilesRef.current, ...filesToUpload];
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...previewUrls]
    }));
    setError('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => {
      const removedUrl = prev.images[indexToRemove];
      if (removedUrl && typeof removedUrl === 'string' && removedUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(removedUrl);
        } catch {
          /* ignore */
        }
      }
      return {
        ...prev,
        images: prev.images.filter((_, idx) => idx !== indexToRemove)
      };
    });
    pendingImageFilesRef.current = pendingImageFilesRef.current.filter((_, idx) => idx !== indexToRemove);
  };

  const createNote = async () => {
    const { title, date, time, description, images, author, authorContact, consentAgreed } = formData;

    const errors = [];
    if (!author || !author.trim()) {
      errors.push("Please fill in the Contributor's Name.");
    }
    if (!date) {
      errors.push('Please select the Date.');
    }
    if (!time || !time.trim()) {
      errors.push('Please specify the Time of sighting.');
    }
    if (isFutureDateTime(date, time)) {
      errors.push('Date and time of sighting cannot be in the future.');
    }
    if (!title || !title.trim()) {
      errors.push('Please fill in the Location.');
    }
    if (!description || !description.trim()) {
      errors.push('Please fill in the Description / Observation Details.');
    }
    if (!consentAgreed) {
      errors.push('You must confirm copyright ownership and consent.');
    }

    if (errors.length > 0) {
      setError(errors.join(' • '));
      return null;
    }

    setError('');
    setSubmitting(true);

    try {
      // Upload pending File objects to Supabase Storage NOW upon submit
      const uploadedMap = new Map();
      if (pendingImageFilesRef.current.length > 0) {
        await Promise.all(
          pendingImageFilesRef.current.map(async ({ previewUrl, file }) => {
            try {
              const publicUrl = await uploadMediaFile(file, 'fieldnotes');
              if (publicUrl) uploadedMap.set(previewUrl, publicUrl);
            } catch (err) {
              console.error('[useFieldNotes] upload failed:', err);
              throw new Error(`Failed to upload "${file.name || 'photo'}": ${err.message || 'Storage error'}`);
            }
          })
        );
      }

      // Replace preview blob URLs with uploaded storage URLs
      const finalImageUrls = images
        .map(img => (uploadedMap.has(img) ? uploadedMap.get(img) : img))
        .filter(img => typeof img === 'string' && !img.startsWith('blob:'));

      const finalAuthor = author.trim();
      const status = isAdmin ? 'approved' : 'pending';

      const saved = await addFieldNote({
        title: title.trim(),
        date,
        time: time.trim(),
        description: description.trim(),
        specialNote: (formData.specialNote || '').trim(),
        images: finalImageUrls,
        author: finalAuthor,
        authorContact: (authorContact || '').trim(),
        status
      });

      // Clean up object URLs
      images.forEach(img => {
        if (typeof img === 'string' && img.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(img);
          } catch {
            /* ignore */
          }
        }
      });
      pendingImageFilesRef.current = [];

      return {
        success: true,
        isPending: status === 'pending',
        note: saved
      };
    } catch (err) {
      setError(`Could not submit your field note: ${friendlyError(err)}`);
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    formData,
    error,
    submitting,
    isAdmin,
    handleChange,
    handleAddImages,
    handleRemoveImage,
    createNote,
  };
}
