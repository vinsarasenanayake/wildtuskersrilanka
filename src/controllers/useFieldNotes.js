import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  getFieldNotes,
  addFieldNote,
  approveFieldNote,
  rejectFieldNote,
  deleteFieldNote
} from '../models/FieldNotesModel';
import { useAuth } from './useAuth';
import { uploadMediaFile } from '../utils/storageUpload';

/* ==============================================================
   SECTION 1: FIELD NOTES PUBLIC FEED & ADMIN REVIEW CONTROLLER
============================================================== */
export function useFieldNotesFeed() {
  const [allNotes, setAllNotes] = useState([]);
  const [loading, setLoading] = useState(true);
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
    date: new Date().toISOString().split('T')[0],
    time: '',
    description: '',
    specialNote: '',
    images: [] // array of image attachment data URLs
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auth resolves asynchronously; prefill author for admins once known
  useEffect(() => {
    if (isAdmin) {
      setFormData(prev => (prev.author ? prev : { ...prev, author: 'WTS Admin' }));
    }
  }, [isAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddImages = async (newFilesOrUrls) => {
    if (!newFilesOrUrls || newFilesOrUrls.length === 0) return;
    const items = Array.from(newFilesOrUrls);
    const uploaded = await Promise.all(
      items.map(async (item) => {
        if (typeof item === 'string') return item;
        try {
          return await uploadMediaFile(item, 'fieldnotes');
        } catch (err) {
          console.warn('[useFieldNotes] upload failed, fallback to local object URL', err);
          return URL.createObjectURL(item);
        }
      })
    );
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...uploaded.filter(Boolean)]
    }));
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const createNote = async () => {
    const { title, date, time, description, images, author, authorContact } = formData;

    if (!author.trim()) {
      setError("Please fill in the Contributor's Name.");
      return null;
    }
    if (!date) {
      setError('Please select the Date.');
      return null;
    }
    if (!time) {
      setError('Please specify the Time of sighting.');
      return null;
    }
    if (!title.trim()) {
      setError('Please fill in the Location / Title.');
      return null;
    }
    if (!description.trim()) {
      setError('Please fill in the Description / Observation Details.');
      return null;
    }

    const imageArray = Array.isArray(images)
      ? images
      : typeof images === 'string' && images
        ? images.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    const finalAuthor = author.trim();
    const status = isAdmin ? 'approved' : 'pending';

    setError('');
    setSubmitting(true);
    let saved;
    try {
      saved = await addFieldNote({
        title: title.trim(),
        date,
        time: time.trim(),
        description: description.trim(),
        specialNote: (formData.specialNote || '').trim(),
        images: imageArray,
        author: finalAuthor,
        authorContact: (authorContact || '').trim(),
        status
      });
    } catch (err) {
      setError(`Could not submit your field note: ${err.message}`);
      return null;
    } finally {
      setSubmitting(false);
    }

    return {
      success: true,
      isPending: status === 'pending',
      note: saved
    };
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
