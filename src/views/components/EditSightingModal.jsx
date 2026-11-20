import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, MapPin, Camera, Calendar, UserCheck, HeartPulse, ShieldAlert, FileText } from 'lucide-react';
import LocationSearchInput from './LocationSearchInput';
import ImageUploadBox from './ImageUploadBox';
import { parseSightingDetails, THREAT_LEVELS } from '../../models/TuskerModel';
import { getLocationCoordinates } from '../../utils/sriLankaLocations';

const INPUT_CLASS =
  'w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-2.5 font-sans text-[0.9rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12';

const SELECT_CLASS =
  'w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-2.5 font-sans text-[0.9rem] text-[#111111] outline-none transition-all focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12 appearance-none bg-[url(\'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23888888%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E\')] bg-no-repeat bg-[position:right_12px_center] bg-[size:16px] pr-10 cursor-pointer';

const HEALTH_OPTIONS = ['Good', 'Fair', 'Poor', 'Injured', 'Critical', 'Under Observation'];

/**
 * EditSightingModal
 * Allows admins to edit an existing field sighting record (Row 2, Row 3...) for a tusker.
 */
export default function EditSightingModal({
  sighting,
  tusker,
  sightingNum,
  rowNum,
  onClose,
  onSave,
}) {
  const details = parseSightingDetails(sighting);

  const [formData, setFormData] = useState({
    imageUrl: sighting?.imageUrl || '',
    captureDate: sighting?.captureDate || new Date().toISOString().split('T')[0],
    author: sighting?.author || 'WTS Admin',
    location: details.location || '',
    healthCondition: details.healthCondition || 'Good',
    threatLevel: details.threatLevel || '',
    specialMarks: details.specialMarks || '',
    specialWounds: details.specialWounds || '',
    note: details.note || (typeof sighting?.note === 'string' && !sighting.note.trim().startsWith('{') ? sighting.note : '') || details.remarks || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  if (!sighting) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (urls) => {
    const url = Array.isArray(urls) ? urls[0] || '' : urls || '';
    setFormData((prev) => ({ ...prev, imageUrl: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.captureDate) {
      setError('Please provide a capture date.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const coords = getLocationCoordinates(formData.location) || details.coords || null;
      const serializedDetails = {
        note: (formData.note || '').trim(),
        location: (formData.location || '').trim(),
        coords,
        healthCondition: formData.healthCondition || '',
        threatLevel: formData.threatLevel || '',
        specialMarks: (formData.specialMarks || '').trim(),
        specialWounds: (formData.specialWounds || '').trim(),
        remarks: (formData.note || '').trim(),
      };

      const updatedPayload = {
        imageUrl: formData.imageUrl || sighting.imageUrl,
        captureDate: formData.captureDate,
        author: (formData.author || 'WTS Admin').trim(),
        note: JSON.stringify(serializedDetails),
      };

      await onSave(sighting.id, updatedPayload);
      onClose();
    } catch (err) {
      setError(`Failed to update sighting: ${err.message || err}`);
      setSaving(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[16px] max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#e5e7eb] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0b2518] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
              <Camera size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[0.7rem] font-bold bg-[#faf5ec] text-accent px-2 py-0.5 rounded uppercase tracking-wider">
                  Row {rowNum} • Sighting #{sightingNum}
                </span>
              </div>
              <h3 className="font-sans text-[1.05rem] font-bold text-white m-0 mt-0.5">
                Edit Sighting for {tusker?.name || 'Tusker'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-none cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-4.5 font-sans">
          {error && (
            <div className="bg-[#fff5f5] border border-[#ffcccc] text-[#e53e3e] rounded-[8px] px-3.5 py-2.5 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Sighting Photo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#555555] uppercase tracking-wider">
              Sighting Photo
            </label>
            <ImageUploadBox
              folder="sightings"
              value={formData.imageUrl ? [formData.imageUrl] : []}
              onChange={handleImageChange}
              aspectClass="aspect-[16/10]"
            />
          </div>

          {/* Date & Observer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#555555] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={13} className="text-accent" />
                <span>Capture Date *</span>
              </label>
              <input
                type="date"
                name="captureDate"
                required
                className={INPUT_CLASS}
                value={formData.captureDate}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#555555] uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck size={13} className="text-accent" />
                <span>Recorded By</span>
              </label>
              <input
                type="text"
                name="author"
                className={INPUT_CLASS}
                placeholder="e.g. WTS Admin"
                value={formData.author}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Location / Area */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#555555] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={13} className="text-accent" />
              <span>Location / National Park</span>
            </label>
            <LocationSearchInput
              name="location"
              placeholder="Search & select sighting area (e.g. Buttala, Yala Block 1)..."
              value={formData.location}
              onChange={handleChange}
              className={INPUT_CLASS}
            />
          </div>

          {/* Health & Threat Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#555555] uppercase tracking-wider flex items-center gap-1.5">
                <HeartPulse size={13} className="text-accent" />
                <span>Health Condition</span>
              </label>
              <select
                name="healthCondition"
                className={SELECT_CLASS}
                value={formData.healthCondition}
                onChange={handleChange}
              >
                <option value="">— Select Condition —</option>
                {HEALTH_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#555555] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={13} className="text-accent" />
                <span>Life Threat Level</span>
              </label>
              <select
                name="threatLevel"
                className={SELECT_CLASS}
                value={formData.threatLevel}
                onChange={handleChange}
              >
                <option value="">— Select Threat Level —</option>
                {THREAT_LEVELS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Special Marks & Wounds */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#555555] uppercase tracking-wider">
                Special Marks
              </label>
              <input
                type="text"
                name="specialMarks"
                className={INPUT_CLASS}
                placeholder="e.g. Distinct notch on left ear"
                value={formData.specialMarks}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#555555] uppercase tracking-wider">
                Special Wounds
              </label>
              <input
                type="text"
                name="specialWounds"
                className={INPUT_CLASS}
                placeholder="e.g. Healed snare scar"
                value={formData.specialWounds}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Notes / Remarks */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#555555] uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={13} className="text-accent" />
              <span>Notes / Remarks</span>
            </label>
            <textarea
              name="note"
              rows="3"
              className={`${INPUT_CLASS} resize-y leading-relaxed`}
              placeholder="Observation details, body condition, musth status, companions..."
              value={formData.note}
              onChange={handleChange}
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#eeeeee] flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#666666] hover:text-[#111111] bg-gray-100 hover:bg-gray-200 border-none cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold bg-accent hover:bg-accent-hover text-primary border-none cursor-pointer shadow-xs transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={13} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
