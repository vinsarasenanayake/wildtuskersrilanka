/**
 * @file SpecialObservationForm.jsx
 * @description Admin form for creating and editing in-depth annual special observations,
 * tusker behavioral records, musth status, and photographic documentation.
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Binoculars,
  Image as ImageIcon,
  Paperclip,
  X,
} from 'lucide-react';
import { useSpecialObservationForm } from '../../controllers/useSpecialObservations';
import { getTuskers } from '../../models/TuskerModel';
import { useAuth } from '../../controllers/useAuth';
import TuskerMultiSelect from '../components/TuskerMultiSelect';
import LocationSearchInput from '../components/LocationSearchInput';
import ClockTimePicker from '../components/ClockTimePicker';
import { todayLocalISO } from '../../utils/localDate';

export default function SpecialObservationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    formData,
    error,
    submitting,
    uploadingImages,
    handleChange,
    handleAddImages,
    handleRemoveImage,
    saveObservation,
    isEditMode,
  } = useSpecialObservationForm(id);

  const fileInputRef = useRef(null);

  const { isAdmin, authLoading } = useAuth();
  const [tuskersList, setTuskersList] = useState([]);

  // Multi-tusker & comparison states
  const [selectedTuskers, setSelectedTuskers] = useState([]);
  const [connector, setConnector] = useState('vs'); // 'vs' (Comparison) or '&' (Together)
  const [dragOver, setDragOver] = useState(false);
  const [initialSyncDone, setInitialSyncDone] = useState(false);

  useEffect(() => {
    getTuskers()
      .then((data) => setTuskersList(data || []))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    document.title = `Wild Tuskers Sri Lanka | ${isEditMode ? 'Edit' : 'Add'} Special Observation`;
  }, [isEditMode]);

  useEffect(() => {
    // Admin protection
    if (!authLoading && !isAdmin) {
      navigate('/login');
    }
  }, [authLoading, isAdmin, navigate]);

  // When editing an existing observation, match existing tuskerName to tuskers in the database
  useEffect(() => {
    if (initialSyncDone || !formData.tuskerName || tuskersList.length === 0) return;

    const currentVal = formData.tuskerName;
    const matched = [];

    tuskersList.forEach((t) => {
      const needleWithDash = `${t.id} - ${t.name}`.toLowerCase();
      const needleId = `${t.id} `.toLowerCase();
      const lower = currentVal.toLowerCase();
      if (lower.includes(needleWithDash) || lower.startsWith(needleId)) {
        if (!matched.some((m) => m.id === t.id)) {
          matched.push(t);
        }
      }
    });

    if (matched.length > 0) {
      setSelectedTuskers(matched);
      if (currentVal.includes(' & ')) {
        setConnector('&');
      } else {
        setConnector('vs');
      }
    }
    setInitialSyncDone(true);
  }, [formData.tuskerName, tuskersList, initialSyncDone]);

  const handleToggleConnector = (newConn) => {
    setConnector(newConn);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await saveObservation();
    if (success) {
      navigate('/special-observations?tab=observations');
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddImages(e.target.files);
      e.target.value = '';
    }
  };

  const imagesArray = Array.isArray(formData.images)
    ? formData.images
    : typeof formData.images === 'string' && formData.images
      ? formData.images.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

  return (
    <div className="w-full min-h-screen bg-white pt-[calc(68px+1.5rem)] sm:pt-[calc(80px+2rem)] pb-20">
      <div className="w-full max-w-[820px] mx-auto px-4 sm:px-6 md:px-8">
        <button
          className="inline-flex items-center gap-1.5 font-sans text-xs sm:text-[0.88rem] font-medium text-[#888888] bg-none border-none cursor-pointer p-0 mb-6 sm:mb-8 transition-colors hover:text-accent"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white border-1.5 border-[#e8e8e8] rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-4 sm:p-7 md:p-10">
          <div className="text-center flex flex-col items-center gap-2 mb-8 sm:mb-10 pb-6 border-b border-[#eeeeee]">
            <div className="w-[46px] h-[46px] sm:w-[50px] sm:h-[50px] rounded-[12px] bg-accent/12 text-accent flex items-center justify-center mb-1 shrink-0 aspect-square">
              <Binoculars size={22} />
            </div>
            <h1 className="font-sans text-lg sm:text-[1.5rem] font-bold text-[#111111] m-0 whitespace-nowrap">
              {isEditMode ? 'Edit Special Observation' : 'Add Special Observation'}
            </h1>
            <p className="font-sans text-xs sm:text-[0.88rem] text-[#777777] max-w-[520px] leading-relaxed m-0">
              Record special observations of individual tuskers or side-by-side multi-tusker comparisons.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div className="bg-[#fff5f5] border border-[#ffcccc] text-[#e53e3e] rounded-[8px] px-4 py-3 font-sans text-[0.85rem] font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {/* Tusker Subject & Comparison Selector */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <TuskerMultiSelect
                  label="Tusker Subject or Multi-Tusker Comparison"
                  required
                  allowConnector
                  connector={connector}
                  onConnectorChange={handleToggleConnector}
                  value={selectedTuskers}
                  onChange={(nextTuskers, formatted) => {
                    setSelectedTuskers(nextTuskers);
                    handleChange({ target: { name: 'tuskerName', value: formatted } });
                  }}
                  placeholder={
                    selectedTuskers.length === 0
                      ? "Search by ID or name…"
                      : "+ Add another tusker to compare (e.g. T001, Panama Puttuwa)..."
                  }
                />
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                  Observation Date (Optional)
                </label>
                <input
                  type="date"
                  name="date"
                  placeholder="DD/MM/YYYY"
                  max={todayLocalISO()}
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  value={formData.date || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Time */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                  Time of Observation (Optional)
                </label>
                <ClockTimePicker
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  selectedDate={formData.date}
                  allowFuture={false}
                  placeholder="Select observation time"
                />
              </div>

              {/* Location */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                  Location / National Park
                </label>
                <LocationSearchInput
                  name="location"
                  placeholder="e.g. Yala - Block 1"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                />
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                  Observation Headline / Title<span className="text-[#e53e3e]"> *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  placeholder="e.g. Rare Musth Encounter"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                  Detailed Description<span className="text-[#e53e3e]"> *</span>
                </label>
                <textarea
                  name="description"
                  required
                  rows="6"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12 leading-relaxed resize-y"
                  placeholder="Describe the sighting, time of day, elephant's physical condition, tusk dimensions, interactions with other elephants, health status, and unusual observations..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* Images Attachment Section */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px] flex items-center gap-1.5">
                    <Paperclip size={14} className="text-accent" />
                    <span>Photo Attachments</span>
                  </label>
                  {imagesArray.length > 0 && (
                    <span className="text-[0.75rem] font-semibold text-emerald-600">
                      {imagesArray.length} photo{imagesArray.length > 1 ? 's' : ''} attached
                    </span>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {/* Attachment Dropzone & Trigger Button */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleAddImages(e.dataTransfer.files);
                    }
                  }}
                  className={`border-2 border-dashed ${dragOver
                    ? 'border-accent bg-accent/10 scale-[1.01]'
                    : 'border-[#d1d5db] hover:border-accent hover:bg-accent/5 bg-[#fafafa]'
                    } rounded-[14px] p-6 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all`}
                >
                  <div className="w-11 h-11 rounded-full bg-accent/15 text-accent flex items-center justify-center">
                    {uploadingImages ? (
                      <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Paperclip size={20} />
                    )}
                  </div>
                  <div>
                    <span className="font-sans text-[0.92rem] font-bold text-[#111111]">
                      {uploadingImages
                        ? 'Uploading photos to database storage...'
                        : 'Click or drag photos to upload'}
                    </span>
                    <span className="font-sans text-xs text-[#777777] block mt-0.5">
                      Directly uploads images to database storage (JPG, PNG, WEBP)
                    </span>
                  </div>
                </div>

                {/* Live Attachment Previews with Remove Button */}
                {imagesArray.length > 0 && (
                  <div className="mt-2 p-3 bg-[#f8f9fa] rounded-xl border border-[#eeeeee]">
                    <span className="text-[0.75rem] font-bold text-[#666666] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <ImageIcon size={13} />
                      Attached Photos ({imagesArray.length})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {imagesArray.map((url, i) => (
                        <div
                          key={i}
                          className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black/5 border border-[#dddddd] group"
                        >
                          <img
                            src={url}
                            alt={`Attachment ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(i)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center border-none cursor-pointer transition-colors shadow-xs"
                            title="Remove attachment"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Author / Recorded By */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                  Recorded By / Admin Name
                </label>
                <input
                  type="text"
                  name="author"
                  className="w-full bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12"
                  placeholder="e.g. WTS Admin"
                  value={formData.author}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse portrait:flex-col-reverse landscape:sm:flex-row items-center justify-end gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#eeeeee]">
              <button
                type="button"
                className="w-full portrait:w-full landscape:sm:w-auto bg-none border-1.5 border-[#e8e8e8] text-[#555555] font-sans text-xs sm:text-[0.88rem] font-semibold rounded-[10px] px-6 py-2.5 sm:py-3 cursor-pointer hover:bg-[#f7f7f8] hover:text-[#222222] transition-all text-center justify-center"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploadingImages}
                className="w-full portrait:w-full landscape:sm:w-auto bg-primary text-white border-none font-sans text-xs sm:text-[0.88rem] font-semibold rounded-[10px] px-7 py-2.5 sm:py-3 cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(11,37,24,0.15)] hover:-translate-y-[0.5px] hover:bg-primary-light hover:shadow-[0_6px_20px_rgba(11,37,24,0.25)] transition-all disabled:opacity-50 text-center"
              >
                <Save size={16} />
                <span>
                  {submitting
                    ? 'Saving & Uploading...'
                    : uploadingImages
                      ? 'Uploading Images...'
                      : isEditMode
                        ? 'Update Observation'
                        : 'Save Observation'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
