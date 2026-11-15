import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getGalleryPhotos,
  submitGalleryPhoto,
  approveGalleryPhoto,
  rejectGalleryPhoto,
  deleteGalleryPhoto,
} from '../models/GalleryModel';
import { useAuth } from './useAuth';
import { uploadMediaFile } from '../utils/storageUpload';

export function useGallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' or specific location / year
  const [searchQuery, setSearchQuery] = useState('');
  const [activePhoto, setActivePhoto] = useState(null); // Lightbox modal
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

  const handleDelete = async (id) => {
    if (window.confirm('Delete this photo from the gallery?')) {
      await deleteGalleryPhoto(id);
      await reloadPhotos();
    }
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
  };
}

export function useGallerySubmit(onSuccess) {
  const [formData, setFormData] = useState({
    title: '',
    tuskerName: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    photographer: '',
    photographerContact: '',
    image: null,
    images: [],
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilesAdd = async (filesList) => {
    const rawFiles = Array.from(filesList || []).filter(
      (f) => f.type && f.type.startsWith('image/')
    );
    if (!rawFiles.length) return;

    setUploading(true);
    setError('');
    try {
      const uploadedUrls = await Promise.all(
        rawFiles.map(async (file) => {
          try {
            return await uploadMediaFile(file, 'gallery');
          } catch (err) {
            console.error('[GallerySubmit] upload failed:', err);
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target.result);
              reader.readAsDataURL(file);
            });
          }
        })
      );
      setFormData((prev) => {
        const nextImages = [...prev.images, ...uploadedUrls.filter(Boolean)];
        return {
          ...prev,
          images: nextImages,
          image: nextImages[0] || null,
        };
      });
    } catch (err) {
      console.error('[useGallery] upload error', err);
      setError('Failed to upload one or more photos.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => {
      const nextImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: nextImages,
        image: nextImages[0] || null,
      };
    });
  };

  const handlePhotosChange = (urls) => {
    const list = Array.isArray(urls) ? urls : (urls ? [urls] : []);
    setFormData((prev) => ({
      ...prev,
      images: list,
      image: list[0] || null,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const imagesToSubmit =
      formData.images.length > 0
        ? formData.images
        : formData.image
        ? [formData.image]
        : [];

    if (imagesToSubmit.length === 0) {
      setError('Please select at least one photo to upload.');
      return;
    }
    if (!formData.photographer.trim()) {
      setError("Please provide the photographer's name.");
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      // Submit each photo to gallery_photos table
      await Promise.all(
        imagesToSubmit.map((imgUrl) =>
          submitGalleryPhoto({
            ...formData,
            title: formData.title.trim() || formData.tuskerName || 'Wild Tusker Observation',
            image: imgUrl,
          })
        )
      );
      setSuccessMsg(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit photo(s).');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setFormData({
      title: '',
      tuskerName: '',
      location: '',
      date: new Date().toISOString().split('T')[0],
      photographer: '',
      photographerContact: '',
      image: null,
      images: [],
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

