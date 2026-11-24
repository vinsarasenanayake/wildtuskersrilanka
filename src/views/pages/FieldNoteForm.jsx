/**
 * @file FieldNoteForm.jsx
 * @description Form interface for wildlife photographers, researchers, and visitors
 * to submit wild tusker field observations for verification and archiving.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  FileText,
  User,
  Calendar,
  Clock,
  MapPin,
  Paperclip,
  UploadCloud,
  X,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Mail,
} from 'lucide-react';
import { useFieldNoteForm } from '../../controllers/useFieldNotes';
import TuskerMultiSelect from '../components/TuskerMultiSelect';
import LocationSearchInput from '../components/LocationSearchInput';
import ClockTimePicker from '../components/ClockTimePicker';
import { todayLocalISO } from '../../utils/localDate';

export default function FieldNoteForm() {
  const navigate = useNavigate();
  const {
    formData,
    error,
    submitting,
    isAdmin,
    handleChange,
    handleAddImages,
    handleRemoveImage,
    createNote
  } = useFieldNoteForm();
  const [submittedStatus, setSubmittedStatus] = useState(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Add Field Note';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || uploadingPhotos) return;
    const result = await createNote();
    if (result && result.success) {
      if (result.isPending) {
        setSubmittedStatus('pending');
      } else {
        navigate('/field-notes');
      }
    }
  };

  const handleFilesArray = async (filesList) => {
    const files = Array.from(filesList || []).filter((f) => f.type && f.type.startsWith('image/'));
    if (!files.length) return;
    setUploadingPhotos(true);
    try {
      await handleAddImages(files);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleFileSelect = (e) => {
    handleFilesArray(e.target.files);
    e.target.value = '';
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f9fa] pt-[calc(68px+1.5rem)] sm:pt-[calc(80px+2rem)] pb-20">
      <div className="w-full max-w-[840px] mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Back Link */}
        <button
          className="inline-flex items-center gap-1.5 font-sans text-xs sm:text-[0.88rem] font-medium text-[#777777] bg-none border-none cursor-pointer p-0 mb-6 transition-colors hover:text-accent"
          onClick={() => navigate('/field-notes')}
        >
          <ArrowLeft size={16} /> Back to Field Notes
        </button>

        {submittedStatus === 'pending' ? (
          /* Submission Confirmation Card */
          <div className="bg-white border border-[#e5e7eb] rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-8 sm:p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="font-sans text-2xl font-bold text-[#111111] mb-2">
              Field Note Submitted for Review!
            </h2>
            <p className="font-sans text-[0.95rem] text-[#555555] max-w-[540px] leading-relaxed mb-6">
              Thank you for contributing to Wild Tuskers Sri Lanka! Your observation has been securely logged and will appear on the public Field Notes page once an administrator reviews and approves it.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate('/field-notes')}
                className="bg-primary hover:bg-primary-light text-white font-sans text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer border-none shadow-sm"
              >
                Return to Field Notes
              </button>
              <button
                onClick={() => {
                  setSubmittedStatus(null);
                  window.location.reload();
                }}
                className="bg-white border border-[#d1d5db] text-[#374151] hover:bg-gray-50 font-sans text-sm font-medium px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Submit Another Observation
              </button>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <div className="bg-white border border-[#e5e7eb] rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-7 sm:p-10">
            
            {/* Header */}
            <div className="text-center flex flex-col items-center gap-2 mb-8 pb-6 border-b border-[#eeeeee]">
              <div className="w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] rounded-[14px] bg-accent/15 text-accent flex items-center justify-center mb-1 shrink-0 aspect-square">
                <FileText size={24} />
              </div>
              <h1 className="font-sans text-xl sm:text-[1.55rem] font-bold text-[#111111] m-0 whitespace-nowrap">
                Submit a Field Note
              </h1>
              <p className="font-sans text-[0.9rem] text-[#666666] max-w-[520px] leading-relaxed m-0">
                Record your field sightings, observations, and tusker encounters.
              </p>
            </div>

            {/* Admin Notice (only shown when logged in as admin) */}
            {isAdmin && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-[10px] p-3.5 flex items-center gap-3 text-emerald-800 text-[0.88rem]">
                <ShieldCheck size={20} className="text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Logged in as Admin:</strong> Your field note will be directly published and visible to all visitors upon saving.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {error && (
                <div className="bg-[#fff5f5] border border-[#ffcccc] text-[#e53e3e] rounded-[8px] px-4 py-3 font-sans text-[0.85rem] font-medium">
                  {error}
                </div>
              )}

              {/* Contributor's Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fieldnote-author" className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px] flex items-center gap-1.5">
                  <User size={14} className="text-[#888888]" />
                  <span>Contributor's Name<span className="text-[#e53e3e]"> *</span></span>
                </label>
                <input
                  id="fieldnote-author"
                  type="text"
                  name="author"
                  maxLength={200}
                  required
                  className="w-full bg-[#f7f7f8] border border-[#e5e7eb] rounded-[10px] px-3.5 py-2.5 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/15 scroll-mt-28"
                  placeholder="Enter your name"
                  value={formData.author}
                  onChange={handleChange}
                />
              </div>

              {/* Contributor Email (Optional for follow-up) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fieldnote-contact" className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px] flex items-center gap-1.5">
                  <Mail size={14} className="text-[#888888]" />
                  <span>Contributor Email <span className="text-[#888888] font-normal normal-case">(optional, for verification & researcher follow-up)</span></span>
                </label>
                <input
                  id="fieldnote-contact"
                  type="email"
                  name="authorContact"
                  maxLength={200}
                  className="w-full bg-[#f7f7f8] border border-[#e5e7eb] rounded-[10px] px-3.5 py-2.5 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/15 scroll-mt-28"
                  placeholder="your.email@example.com"
                  value={formData.authorContact || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Tuskers Observed (Searchable Dropdown with Multi-Select) */}
              <div className="w-full">
                <TuskerMultiSelect
                  label="Tuskers Involved / Observed"
                  placeholder="Search tusker by ID or name (e.g. T001, Panama Puttuwa)..."
                  value={formData.specialNote}
                  onChange={(_list, formatted) => {
                    handleChange({ target: { name: 'specialNote', value: formatted } });
                  }}
                  helperText="Select one or multiple tuskers observed during this field trip."
                />
              </div>

              {/* Date, Time & Location (All Required) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fieldnote-date" className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px] flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#888888]" />
                    <span>Date of Field Trip<span className="text-[#e53e3e]"> *</span></span>
                  </label>
                  <input
                    id="fieldnote-date"
                    type="date"
                    name="date"
                    required
                    max={todayLocalISO()}
                    className="w-full bg-[#f7f7f8] border border-[#e5e7eb] rounded-[10px] px-3.5 py-2.5 font-sans text-[0.92rem] text-[#111111] outline-none transition-all focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/15 scroll-mt-28"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fieldnote-time" className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px] flex items-center gap-1.5">
                    <Clock size={14} className="text-[#888888]" />
                    <span>Time of Sighting<span className="text-[#e53e3e]"> *</span></span>
                  </label>
                  <ClockTimePicker
                    id="fieldnote-time"
                    value={formData.time || ''}
                    onChange={handleChange}
                    selectedDate={formData.date}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fieldnote-location" className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px] flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#888888]" />
                    <span>Location<span className="text-[#e53e3e]"> *</span></span>
                  </label>
                  <LocationSearchInput
                    id="fieldnote-location"
                    name="title"
                    required
                    placeholder="e.g. Minneriya National Park"
                    value={formData.title}
                    onChange={(e, val) => handleChange({ target: { name: 'title', value: val || e.target.value } })}
                    className="w-full bg-[#f7f7f8] border border-[#e5e7eb] rounded-[10px] py-2.5 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/15 scroll-mt-28"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fieldnote-description" className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px]">
                  Description / Observation Details<span className="text-[#e53e3e]"> *</span>
                </label>
                <textarea
                  id="fieldnote-description"
                  name="description"
                  maxLength={20000}
                  required
                  className="w-full bg-[#f7f7f8] border border-[#e5e7eb] rounded-[10px] px-3.5 py-2.5 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/15 resize-y leading-relaxed scroll-mt-28"
                  rows="6"
                  placeholder="Record times, exact coordinates or sector, herd interaction, physical demeanor, and behavior..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* Attachment: Image Upload */}
              <div className="flex flex-col gap-2">
                <label className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Paperclip size={14} className="text-[#888888]" />
                    <span>Photo Attachments</span>
                  </span>
                  {formData.images && formData.images.length > 0 && (
                    <span className="text-[0.75rem] font-medium text-emerald-600">
                      {formData.images.length} photo{formData.images.length > 1 ? 's' : ''} attached
                    </span>
                  )}
                </label>

                {/* Hidden File Input */}
                <input
                  type="file"
                  id="field-note-file-input"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {/* Dropzone Trigger */}
                <label
                  htmlFor="field-note-file-input"
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleFilesArray(e.dataTransfer.files);
                    }
                  }}
                  className="border-2 border-dashed border-[#d1d5db] hover:border-accent hover:bg-accent/5 rounded-[12px] p-6 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-[#fcfcfd]"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/12 text-accent flex items-center justify-center">
                    {uploadingPhotos ? (
                      <Loader2 size={20} className="animate-spin text-accent" />
                    ) : (
                      <UploadCloud size={20} />
                    )}
                  </div>
                  <div className="font-sans text-sm font-semibold text-[#222222]">
                    {uploadingPhotos ? 'Uploading photos to database storage…' : 'Click to attach photos or drag & drop'}
                  </div>
                  <div className="font-sans text-xs text-[#777777]">
                    Supports JPG, PNG, WEBP &bull; Max 15 MB per file
                  </div>
                </label>

                {/* Live Attachment Previews with Remove Button */}
                {formData.images && formData.images.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {formData.images.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-[4/3] bg-gray-50 shadow-xs"
                      >
                        <img
                          src={url}
                          alt={`Attachment ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          title="Remove photo"
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center border-none cursor-pointer transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Copyright & Consent Confirmation */}
              <div className="bg-[#fafafa] border border-[#e5e7eb] rounded-[10px] p-4 flex flex-col gap-1.5 mt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs sm:text-[0.84rem] text-[#444444] leading-relaxed">
                  <input
                    id="fieldnote-consent"
                    type="checkbox"
                    name="consentAgreed"
                    checked={Boolean(formData.consentAgreed)}
                    onChange={handleChange}
                    required
                    className="mt-0.5 accent-primary cursor-pointer w-4 h-4 shrink-0 rounded"
                  />
                  <span>
                    I confirm that this field observation and any attached photos are my own, and grant Wild Tuskers Sri Lanka non-exclusive permission to document and archive them for wildlife conservation and research. <span className="text-[#e53e3e]">*</span>
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse portrait:flex-col-reverse landscape:sm:flex-row items-center justify-end gap-3 mt-4 pt-6 border-t border-[#eeeeee]">
                <button
                  type="button"
                  className="w-full portrait:w-full landscape:sm:w-auto bg-none border border-[#d1d5db] text-[#555555] font-sans text-xs sm:text-[0.88rem] font-medium rounded-[10px] px-6 py-2.5 cursor-pointer hover:bg-gray-100 hover:text-[#222222] transition-colors text-center justify-center"
                  onClick={() => navigate('/field-notes')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full portrait:w-full landscape:sm:w-auto disabled:opacity-60 disabled:cursor-wait bg-primary text-white border-none font-sans text-xs sm:text-[0.88rem] font-semibold rounded-[10px] px-7 py-2.5 cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(11,37,24,0.15)] hover:bg-primary-light transition-all text-center"
                >
                  <Save size={16} />
                  <span>{submitting ? 'Submitting…' : isAdmin ? 'Publish Field Note' : 'Submit for Review'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
