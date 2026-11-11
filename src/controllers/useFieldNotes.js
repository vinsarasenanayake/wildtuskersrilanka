import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  getFieldNotes,
  addFieldNote,
  approveFieldNote,
  rejectFieldNote,
  deleteFieldNote
} from '../models/FieldNotesModel';
import { useAuth } from './useAuth';

/* ==============================================================
   SECTION 1: FIELD NOTES PUBLIC FEED & ADMIN REVIEW CONTROLLER
============================================================== */
export function useFieldNotesFeed() {
  const [allNotes, setAllNotes] = useState(() => getFieldNotes());
  const { isAdmin } = useAuth();

  const reloadNotes = useCallback(() => {
    setAllNotes(getFieldNotes());
  }, []);

  useEffect(() => {
    const handleNotesChange = () => reloadNotes();
    window.addEventListener('fieldNotesChange', handleNotesChange);
    window.addEventListener('storage', handleNotesChange);
    return () => {
      window.removeEventListener('fieldNotesChange', handleNotesChange);
      window.removeEventListener('storage', handleNotesChange);
    };
  }, [reloadNotes]);

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

  const handleApprove = (id) => {
    approveFieldNote(id);
    reloadNotes();
  };

  const handleReject = (id) => {
    rejectFieldNote(id);
    reloadNotes();
  };

  const handleDelete = (id) => {
    deleteFieldNote(id);
    reloadNotes();
  };

  return {
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
    author: isAdmin ? 'Admin' : '',
    authorContact: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    description: '',
    images: [] // array of image attachment data URLs
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddImages = (newImages) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const createNote = () => {
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

    const saved = addFieldNote({
      title: title.trim(),
      date,
      time: time.trim(),
      description: description.trim(),
      images: imageArray,
      author: finalAuthor,
      authorContact: authorContact.trim(),
      status
    });

    return {
      success: true,
      isPending: status === 'pending',
      note: saved
    };
  };

  return {
    formData,
    error,
    isAdmin,
    handleChange,
    handleAddImages,
    handleRemoveImage,
    createNote,
  };
}
