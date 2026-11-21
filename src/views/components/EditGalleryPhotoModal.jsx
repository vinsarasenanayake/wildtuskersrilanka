import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Save, MapPin, Camera, Calendar, UserCheck } from 'lucide-react';
import TuskerMultiSelect from './TuskerMultiSelect';
import LocationSearchInput from './LocationSearchInput';
import { todayLocalISO } from '../../utils/localDate';

/**
 * EditGalleryPhotoModal
 * Allows admins to correct or update gallery photo details (Tusker ID/Name, Title, Location, Photographer, Date, Status).
 *
 * @param {Object} photo - The photo object to edit
 * @param {Function} onClose - Callback to close the modal
 * @param {Function} onSave - Callback receiving (photoId, updatedFields)
 */
export default function EditGalleryPhotoModal({ photo, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: photo?.title || photo?.tuskerName || '',
    tuskerName: photo?.tuskerName || photo?.title || '',
    location: photo?.location || '',
    photographer: photo?.photographer || '',
    photographerContact: photo?.photographerContact || '',
    date: photo?.date || todayLocalISO(),
    status: photo?.status || 'approved',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Lock background scroll while modal is open
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = prevOverflow === 'hidden' ? '' : (prevOverflow || '');
      document.body.style.paddingRight = prevPaddingRight || '';
    };
  }, []);

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!photo) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalTitle = (formData.tuskerName || formData.title || '').trim();
    if (!finalTitle) {
      setError('Please select at least one tusker from the list.');
      return;
    }
    if (!formData.photographer.trim()) {
      setError('Please specify the Photographer name.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await onSave(photo.id, {
        title: finalTitle,
        tuskerName: finalTitle,
        location: formData.location.trim(),
        photographer: formData.photographer.trim(),
        photographerContact: formData.photographerContact?.trim() || null,
        date: formData.date || null,
        status: formData.status,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error('Failed to update gallery photo:', err);
      setError(err.message || 'Failed to update photo details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[580px] overflow-hidden shadow-2xl border border-amber-900/10 animate-fade-in my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0b2518] px-5 sm:px-6 py-4 flex items-center justify-between text-white border-b border-[#133c27]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold m-0 leading-tight">Edit Photo Details</h3>
              <p className="font-sans text-xs text-white/70 m-0 mt-0.5">
                Admin tool: correct mislabeled tuskers, titles, locations, and photographers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-none cursor-pointer transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
          {success ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 animate-bounce">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="font-serif text-xl font-bold text-[#0b2518] m-0">
                Photo Details Updated!
              </h4>
              <p className="font-sans text-sm text-gray-500 mt-1 m-0">
                Changes saved to database and live gallery.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans text-sm">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-lg text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Photo Preview banner */}
              <div className="flex items-center gap-3.5 p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                <div className="w-20 h-16 rounded-lg overflow-hidden bg-black/10 shrink-0 border border-gray-300">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title || 'Tusker'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[0.7rem] uppercase font-bold tracking-wider text-accent block">
                    Current Image ID: #{photo.id}
                  </span>
                  <p className="text-xs font-semibold text-gray-800 m-0 truncate">
                    {photo.title || 'Untitled'}
                  </p>
                  <p className="text-[0.75rem] text-gray-500 m-0 truncate">
                    {photo.location ? `${photo.location} • ` : ''}Photo by {photo.photographer || 'WTS'}
                  </p>
                </div>
              </div>

              {/* Tusker Quick-Select / Autocomplete */}
              <div className="w-full">
                <TuskerMultiSelect
                  label="Select Registered Tusker(s)"
                  placeholder="Search by T-Number or name (e.g. T001, Panama Puttuwa)..."
                  value={formData.tuskerName}
                  onChange={(_list, formatted) => {
                    setFormData((prev) => ({
                      ...prev,
                      tuskerName: formatted,
                      title: formatted,
                      location: prev.location || (_list && _list[0]?.location) || '',
                    }));
                  }}
                  helperText="Select one or multiple tuskers. Multiple tuskers are automatically formatted with commas and &."
                />
              </div>

              {/* Resolved Title Preview */}
              {formData.title ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-[#0b2518]">
                  <span className="font-bold uppercase tracking-wider text-[0.7rem] text-[#6b7280]">
                    Auto-Formatted Title:
                  </span>
                  <span className="font-bold text-accent truncate max-w-[340px] text-right">
                    {formData.title}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#444] uppercase tracking-wider">
                    Custom Photo Title (if no registered tusker selected)
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Wild Tusker at Sunset"
                    className="bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
              )}

              {/* Location & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1 min-w-0">
                  <label className="text-xs font-bold text-[#444] uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={12} className="text-accent" />
                    <span>Location / Sanctuary</span>
                  </label>
                  <LocationSearchInput
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Kala Wewa / Wilpattu"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                  <label className="text-xs font-bold text-[#444] uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={12} className="text-accent" />
                    <span>Date Taken</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Photographer & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1 min-w-0">
                  <label className="text-xs font-bold text-[#444] uppercase tracking-wider flex items-center gap-1">
                    <Camera size={12} className="text-accent" />
                    <span>Photographer Name</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="photographer"
                    value={formData.photographer}
                    onChange={handleChange}
                    placeholder="e.g. WTS Admin"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                  <label className="text-xs font-bold text-[#444] uppercase tracking-wider flex items-center gap-1">
                    <UserCheck size={12} className="text-accent" />
                    <span>Status</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent cursor-pointer"
                  >
                    <option value="approved">Approved (Published to Gallery)</option>
                    <option value="pending">Pending Review</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-200 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="h-9 px-4 rounded-lg font-sans text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors border-none cursor-pointer inline-flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-9 px-5 rounded-lg font-sans text-xs font-semibold text-primary bg-accent hover:bg-accent-hover transition-colors border-none cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{saving ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
