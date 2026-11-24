/**
 * @file useTuskerIdentification.js
 * @description Controller hooks for the Tusker Identification learning hub,
 * topic filtering, search query handling, and administrative material uploads.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  getIdentifications,
  getCachedIdentifications,
  getIdentificationById,
  addIdentification,
  updateIdentification,
  deleteIdentification,
} from '../models/TuskerIdentificationModel';
import { useAuth } from './useAuth';
import { extractPresentationCover } from '../utils/presentationThumbnail';

/* ==============================================================
   SECTION 1: PUBLIC LEARNING FEED CONTROLLER
============================================================== */
export function useTuskerIdentificationFeed() {
  const cached = getCachedIdentifications();
  const [identifications, setIdentifications] = useState(() => cached || []);
  const [loading, setLoading] = useState(() => !cached);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const { isAdmin } = useAuth();

  const loadIdentifications = useCallback(async (force = false) => {
    try {
      const data = await getIdentifications(force);
      setIdentifications(data || []);
    } catch (err) {
      console.error('[useTuskerIdentificationFeed] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIdentifications();
  }, [loadIdentifications]);

  // Dynamic topic categories
  const categories = useMemo(() => {
    const catSet = new Set();
    identifications.forEach((item) => {
      if (item.category && item.category.trim()) {
        catSet.add(item.category.trim());
      }
    });
    return ['ALL', ...Array.from(catSet)];
  }, [identifications]);

  // Filtered materials
  const filteredIdentifications = useMemo(() => {
    return identifications.filter((item) => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.author && item.author.toLowerCase().includes(q)) ||
        (item.fileName && item.fileName.toLowerCase().includes(q))
      );
    });
  }, [identifications, selectedCategory, searchQuery]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this identification material?')) {
      try {
        await deleteIdentification(id);
        await loadIdentifications(true);
      } catch (err) {
        alert(`Delete failed: ${err.message}`);
      }
    }
  };

  return {
    loading,
    identifications: filteredIdentifications,
    allIdentifications: identifications,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    canAddIdentification: isAdmin,
    isAdmin,
    handleDelete,
    refresh: () => loadIdentifications(true),
  };
}

/* ==============================================================
   SECTION 2: ADMIN IDENTIFICATION FORM CONTROLLER
============================================================== */
export function useTuskerIdentificationForm(id) {
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Ear Biometrics',
    description: '',
    author: 'Wild Tuskers Sri Lanka Research Team',
    coverImage: '',
    file: null,
    fileUrl: '',
    fileName: '',
    fileType: '',
    fileSize: 0,
    slideImages: [],
  });

  const [loadingInitial, setLoadingInitial] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load existing data in edit mode
  useEffect(() => {
    if (!id) return;
    let mounted = true;

    async function loadData() {
      try {
        const item = await getIdentificationById(id);
        if (item && mounted) {
          setFormData({
            title: item.title || '',
            category: item.category || 'General',
            description: item.description || '',
            author: item.author || 'Wild Tuskers Sri Lanka Research Team',
            coverImage: item.coverImage || '',
            file: null,
            fileUrl: item.fileUrl || '',
            fileName: item.fileName || '',
            fileType: item.fileType || '',
            fileSize: item.fileSize || 0,
            slideImages: item.slideImages || [],
          });
        }
      } catch (err) {
        console.error('[useTuskerIdentificationForm] Load error:', err);
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoadingInitial(false);
      }
    }

    loadData();
    return () => { mounted = false; };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleCoverImageSelect = (fileOrUrl) => {
    if (!fileOrUrl) {
      setFormData((prev) => ({
        ...prev,
        coverImage: prev.autoCoverBackup || '',
        isCustomCover: false,
        isAutoCover: Boolean(prev.autoCoverBackup),
      }));
      return;
    }
    if (typeof fileOrUrl === 'string') {
      setFormData((prev) => ({
        ...prev,
        coverImage: fileOrUrl,
        isCustomCover: true,
        isAutoCover: false,
      }));
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          coverImage: e.target.result,
          isCustomCover: true,
          isAutoCover: false,
        }));
      };
      reader.readAsDataURL(fileOrUrl);
    }
  };

  const handleDocumentFileSelect = async (file) => {
    if (!file) return;
    const parts = file.name.split('.');
    const ext = (parts.length > 1 ? parts.pop() : '').toLowerCase();

    // Auto extract first slide cover image and slide images from PPTX / presentation
    let autoCover = null;
    let autoSlideCount = 1;
    let autoSlides = [];
    try {
      const extracted = await extractPresentationCover(file);
      if (extracted) {
        if (extracted.coverUrl) autoCover = extracted.coverUrl;
        autoSlideCount = extracted.slideCount || 1;
        if (Array.isArray(extracted.slideImages) && extracted.slideImages.length > 0) {
          autoSlides = extracted.slideImages;
        }
      }
    } catch (err) {
      console.warn('[useTuskerIdentification] Cover extraction note:', err);
    }

    setFormData((prev) => {
      const shouldApplyAutoCover = !prev.isCustomCover;
      const combinedSlides = autoSlides.length > 0
        ? autoSlides
        : (autoCover ? [autoCover] : prev.slideImages);

      return {
        ...prev,
        file,
        fileName: file.name,
        fileType: ext,
        fileSize: file.size,
        coverImage: shouldApplyAutoCover && autoCover ? autoCover : prev.coverImage,
        isAutoCover: shouldApplyAutoCover && Boolean(autoCover),
        autoCoverBackup: autoCover || prev.autoCoverBackup,
        slideCount: autoSlideCount,
        slideImages: combinedSlides,
      };
    });
  };

  const handleRemoveDocument = () => {
    setFormData((prev) => ({
      ...prev,
      file: null,
      fileUrl: '',
      fileName: '',
      fileType: '',
      fileSize: 0,
      coverImage: prev.isAutoCover ? '' : prev.coverImage,
      isAutoCover: false,
      autoCoverBackup: null,
    }));
  };

  const handleAddSlideImages = (files) => {
    if (!files || files.length === 0) return;
    const filesArray = Array.from(files);

    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          slideImages: [...prev.slideImages, e.target.result],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveSlideImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      slideImages: prev.slideImages.filter((_, i) => i !== index),
    }));
  };

  const saveIdentification = async () => {
    if (!formData.title.trim()) {
      setError('Please provide a title for this identification material.');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Please provide an overview or description.');
      return false;
    }
    if (!formData.file && !formData.fileUrl && formData.slideImages.length === 0 && !formData.coverImage) {
      setError('Please attach at least one presentation file, slide image, or cover document.');
      return false;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isEditMode) {
        await updateIdentification(id, formData);
      } else {
        await addIdentification(formData);
      }
      return true;
    } catch (err) {
      console.error('[useTuskerIdentificationForm] Save error:', err);
      setError(err.message || 'Failed to save presentation material');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    formData,
    loadingInitial,
    submitting,
    error,
    isEditMode,
    handleChange,
    handleCoverImageSelect,
    handleDocumentFileSelect,
    handleRemoveDocument,
    handleAddSlideImages,
    handleRemoveSlideImage,
    saveIdentification,
  };
}
