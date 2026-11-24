/**
 * @file useGallery.js
 * @description Controller hooks for photographic gallery feed, filtering, and submissions.
 * Handles photo uploads, status filtering, and admin moderation workflows.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  const [photos, setPhotos] = useState(() => getCachedGalleryPhotos(false) || []);
  const [loading, setLoading] = useState(() => !getCachedGalleryPhotos(false));
  const [filter, setFilter] = useState('ALL'); // 'ALL' or specific location / year
  const [searchQuery, setSearchQuery] = useState('');
  const [activePhoto, setActivePhoto] = useState(initialActivePhoto); // Instant frame 0 restoration
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const { isAdmin, authLoading } = useAuth();

  const reloadPhotos = useCallback(async () => {
    try {
      const data = await getGalleryPhotos({ admin: isAdmin });
      setPhotos(data);
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
    const list = isAdmin && filter === 'PENDING' ? pendingPhotos : approvedPhotos;
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (p) =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.tuskerName && p.tuskerName.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.photographer && p.photographer.toLowerCase().includes(q))
    );
  }, [isAdmin, filter, approvedPhotos, pendingPhotos, searchQuery]);

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
    loading,
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
    date: todayLocalISO(),
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
    const list = Array.isArray(urls) ? urls : (urls ? [urls] : []);
    setFormData((prev) => ({
      ...prev,
      images: list,
      image: list[0] || null,
      pendingFiles: files !== undefined ? files : (prev.pendingFiles || []),
    }));
    if (list.length > 0) {
      setError((prevErr) => (prevErr && prevErr.includes('at least one photo') ? '' : prevErr));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const imagesToSubmit =
      formData.images.length > 0
        ? formData.images
        : formData.image
        ? [formData.image]
        : [];

    const errors = [];
    if (imagesToSubmit.length === 0) {
      errors.push('Please select at least one photo to upload.');
    }
    if (!formData.photographer.trim()) {
      errors.push("Please provide the photographer's name.");
    }
    if (!formData.location.trim()) {
      errors.push('Please provide the sighting location.');
    }
    if (formData.date && formData.date > todayLocalISO()) {
      errors.push('Date taken cannot be in the future.');
    }
    if (!formData.consentAgreed) {
      errors.push('You must confirm copyright ownership and consent.');
    }
    if ((formData.tuskerName || '').length > 200) {
      errors.push('Too many tuskers selected for one photo.');
    }

    if (errors.length > 0) {
      setError(errors.join(' • '));
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Upload deferred File objects to Supabase Storage only on actual submit
      const files = formData.pendingFiles || [];
      let uploadedUrls = [];
      if (files.length > 0) {
        uploadedUrls = await Promise.all(
          files.map(async (file) => {
            if (file instanceof File || file instanceof Blob) {
              return await uploadMediaFile(file, 'gallery');
            }
            return file;
          })
        );
      }

      // Combine pre-existing URLs (if non-blob) with newly uploaded storage URLs
      const finalUrls = [
        ...imagesToSubmit.filter((url) => typeof url === 'string' && !url.startsWith('blob:')),
        ...uploadedUrls.filter(Boolean),
      ];

      if (finalUrls.length === 0) {
        throw new Error('No photos could be uploaded to storage. Please try again.');
      }

      // Submit each photo to gallery_photos table
      await Promise.all(
        finalUrls.map((imgUrl) =>
          submitGalleryPhoto({
            ...formData,
            title: formData.title.trim() || formData.tuskerName || 'Wild Tusker Observation',
            location: formData.location.trim(),
            photographer: formData.photographer.trim(),
            photographerContact: formData.photographerContact.trim(),
            image: imgUrl,
          })
        )
      );

      // Revoke any temporary object URLs
      imagesToSubmit.forEach((url) => {
        if (typeof url === 'string' && url.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(url);
          } catch {
            /* ignore */
          }
        }
      });

      setSuccessMsg(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(friendlyError(err) || 'Failed to submit photo(s).');
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
      date: todayLocalISO(),
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

