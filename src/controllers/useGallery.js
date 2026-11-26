/**
 * @file useGallery.js
 * @description Controller hooks for photographic gallery feed, filtering, and submissions.
 * Handles photo uploads, status filtering, and admin moderation workflows.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getGalleryPhotos,
  getCachedGalleryPhotos,
  submitGalleryPhoto,
  approveGalleryPhoto,
  rejectGalleryPhoto,
  deleteGalleryPhoto,
  updateGalleryPhoto,
} from '../models/GalleryModel';
import { useAuth } from './useAuth';
import { uploadMediaFile } from '../utils/storageUpload';
import { todayLocalISO } from '../utils/localDate';
import { friendlyError } from '../utils/friendlyError';

export function useGallery(initialActivePhoto = null) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [photos, setPhotos] = useState(() => getCachedGalleryPhotos(false) || []);
  const [loading, setLoading] = useState(() => !getCachedGalleryPhotos(false));
  const [adminPhotosLoaded, setAdminPhotosLoaded] = useState(false);
  const [filter, setFilterState] = useState(() => (searchParams.get('tab') === 'pending' ? 'PENDING' : 'ALL')); // 'ALL' or 'PENDING'
  const [searchQuery, setSearchQuery] = useState('');
  const [activePhoto, setActivePhoto] = useState(initialActivePhoto); // Instant frame 0 restoration
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const { isAdmin, authLoading } = useAuth();

  const setFilter = useCallback((nextFilter) => {
    setFilterState(nextFilter);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextFilter === 'PENDING') {
        next.set('tab', 'pending');
      } else {
        next.delete('tab');
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  useEffect(() => {
    if (!authLoading && !isAdmin && filter === 'PENDING') {
      setFilter('ALL');
    }
  }, [authLoading, isAdmin, filter, setFilter]);

  const reloadPhotos = useCallback(async () => {
    try {
      const data = await getGalleryPhotos({ admin: isAdmin, force: true });
      setPhotos(data);
      if (isAdmin) setAdminPhotosLoaded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!authLoading) reloadPhotos();
  }, [authLoading, reloadPhotos]);

  const approvedPhotos = useMemo(() => {
    return photos.filter((p) => p.status === 'approved');
  }, [photos]);

  const pendingPhotos = useMemo(() => {
    return photos.filter((p) => p.status === 'pending');
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    const list =
      filter === 'PENDING'
        ? (isAdmin && !authLoading && adminPhotosLoaded ? pendingPhotos : [])
        : approvedPhotos;
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (p) =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.tuskerName && p.tuskerName.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.photographer && p.photographer.toLowerCase().includes(q))
    );
  }, [isAdmin, authLoading, adminPhotosLoaded, filter, approvedPhotos, pendingPhotos, searchQuery]);

  const handleApprove = async (id) => {
    await approveGalleryPhoto(id);
    await reloadPhotos();
  };

  const handleReject = async (id) => {
    await rejectGalleryPhoto(id);
    await reloadPhotos();
  };

  const handleDelete = async (id, skipConfirm = false) => {
    if (!skipConfirm && typeof window !== 'undefined' && !window.confirm('Delete this photo from the gallery?')) {
      return;
    }
    await deleteGalleryPhoto(id);
    await reloadPhotos();
  };

  const handleUpdate = async (id, updates) => {
    const updated = await updateGalleryPhoto(id, updates);
    setPhotos((prev) =>
      prev.map((p) => (Number(p.id) === Number(id) ? { ...p, ...updated } : p))
    );
    if (activePhoto && Number(activePhoto.id) === Number(id)) {
      setActivePhoto((prev) => (prev ? { ...prev, ...updated } : prev));
    }
    return updated;
  };

  return {
    photos: filteredPhotos,
    allApproved: approvedPhotos,
    pendingCount: pendingPhotos.length,
    loading: loading || (filter === 'PENDING' && (authLoading || (isAdmin && !adminPhotosLoaded))),
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    activePhoto,
    setActivePhoto,
    showSubmitModal,
    setShowSubmitModal,
    isAdmin,
    reloadPhotos,
    handleApprove,
    handleReject,
    handleDelete,
    handleUpdate,
  };
}

export function useGallerySubmit(onSuccess) {
  const [formData, setFormData] = useState({
    title: '',
    tuskerName: '',
    location: '',
    date: '',
    photographer: '',
    photographerContact: '',
    image: null,
    images: [],
    pendingFiles: [],
    consentAgreed: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const uploading = false;
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleFilesAdd = async (filesList) => {
    const rawFiles = Array.from(filesList || []).filter(
      (f) => f.type && f.type.startsWith('image/')
    );
    if (!rawFiles.length) return;

    // Defer upload to submit: create local preview object URLs
    const previewUrls = rawFiles.map((file) => URL.createObjectURL(file));
    setFormData((prev) => {
      const nextImages = [...prev.images, ...previewUrls];
      const nextFiles = [...(prev.pendingFiles || []), ...rawFiles];
      return {
        ...prev,
        images: nextImages,
        image: nextImages[0] || null,
        pendingFiles: nextFiles,
      };
    });
    setError('');
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => {
      const removed = prev.images[index];
      if (removed && typeof removed === 'string' && removed.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(removed);
        } catch {
          /* ignore */
        }
      }
      const nextImages = prev.images.filter((_, i) => i !== index);
      const nextFiles = (prev.pendingFiles || []).filter((_, i) => i !== index);
      return {
        ...prev,
        images: nextImages,
        image: nextImages[0] || null,
        pendingFiles: nextFiles,
      };
    });
  };

  const handlePhotosChange = (urls, primaryUrl, files) => {
    // Gallery form strictly accepts a single photo
    const list = Array.isArray(urls) ? urls : (urls ? [urls] : []);
    const singleUrl = list[0] || (typeof urls === 'string' ? urls : null);

    // Extract file safely from any argument position (files, primaryUrl, or urls)
    let singleFile = null;
    if (files instanceof File || files instanceof Blob) {
      singleFile = files;
    } else if (Array.isArray(files) && files.length > 0 && (files[0] instanceof File || files[0] instanceof Blob)) {
      singleFile = files[0];
    } else if (primaryUrl instanceof File || primaryUrl instanceof Blob) {
      singleFile = primaryUrl;
    } else if (Array.isArray(primaryUrl) && primaryUrl.length > 0 && (primaryUrl[0] instanceof File || primaryUrl[0] instanceof Blob)) {
      singleFile = primaryUrl[0];
    } else if (urls instanceof File || urls instanceof Blob) {
      singleFile = urls;
    }

    setFormData((prev) => ({
      ...prev,
      images: singleUrl ? [singleUrl] : [],
      image: singleUrl || null,
      pendingFiles: singleFile ? [singleFile] : [],
    }));
    if (singleUrl || singleFile) {
      setError((prevErr) => (prevErr && prevErr.includes('photo') ? '' : prevErr));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const imageToSubmit =
      formData.images.length > 0
        ? formData.images[0]
        : formData.image;

    const errors = [];
    if (!imageToSubmit) {
      errors.push('Please select a photo to upload.');
    }
    if (!formData.photographer.trim()) {
      errors.push("Please provide the photographer's name.");
    }
    if (!formData.location.trim()) {
      errors.push('Please provide the sighting location.');
    }
    if (!formData.date) {
      errors.push('Please select the date taken.');
    } else if (formData.date > todayLocalISO()) {
      errors.push('Date taken cannot be in the future.');
    }
    if (!formData.consentAgreed) {
      errors.push('You must confirm copyright ownership and consent.');
    }

    if (errors.length > 0) {
      setError(errors.join(' • '));
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Upload deferred File object to Supabase Storage only on actual submit
      const files = formData.pendingFiles || [];
      let uploadedUrl = null;
      try {
        if (files.length > 0 && (files[0] instanceof File || files[0] instanceof Blob)) {
          uploadedUrl = await uploadMediaFile(files[0], 'gallery');
        } else if (typeof imageToSubmit === 'string' && imageToSubmit.startsWith('blob:')) {
          // Fallback: recover Blob from local blob URL if pendingFiles was detached
          try {
            const res = await fetch(imageToSubmit);
            const blob = await res.blob();
            if (blob && blob.size > 0) {
              uploadedUrl = await uploadMediaFile(blob, 'gallery');
            }
          } catch (fetchErr) {
            console.error('[useGallerySubmit] Fallback blob fetch failed:', fetchErr);
          }
        } else if (typeof imageToSubmit === 'string' && !imageToSubmit.startsWith('blob:')) {
          uploadedUrl = imageToSubmit;
        }
      } catch (uploadErr) {
        console.error('[useGallerySubmit] Upload failed:', uploadErr);
        throw new Error(`Photo upload failed: ${uploadErr.message || 'Storage error'}`);
      }

      if (!uploadedUrl) {
        throw new Error('No photo could be uploaded to storage. Please try again.');
      }

      // Submit photo to gallery_photos table
      await submitGalleryPhoto({
        ...formData,
        title: formData.title.trim() || formData.tuskerName || 'Wild Tusker Observation',
        location: formData.location.trim(),
        photographer: formData.photographer.trim(),
        photographerContact: formData.photographerContact.trim(),
        image: uploadedUrl,
      });

      // Revoke temporary object URL
      if (typeof imageToSubmit === 'string' && imageToSubmit.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(imageToSubmit);
        } catch {
          /* ignore */
        }
      }

      setSuccessMsg(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(friendlyError(err) || 'Failed to submit photo.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    formData.images.forEach((url) => {
      if (typeof url === 'string' && url.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          /* ignore */
        }
      }
    });
    setFormData({
      title: '',
      tuskerName: '',
      location: '',
      date: '',
      photographer: '',
      photographerContact: '',
      image: null,
      images: [],
      pendingFiles: [],
      consentAgreed: false,
    });
    setError('');
    setSuccessMsg(false);
  };

  return {
    formData,
    images: formData.images,
    preview: formData.image,
    uploading,
    submitting,
    error,
    successMsg,
    handleChange,
    handlePhotosChange,
    handleFilesAdd,
    handleRemoveImage,
    submit,
    reset,
  };
}

