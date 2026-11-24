/**
 * @file TuskerIdentificationForm.jsx
 * @description Admin form for uploading and editing tusker identification materials and presentations
 * (PPTX, DOCX, PDF). Automatically detects and sets the first slide of an uploaded presentation
 * as the default cover preview, while allowing a custom image to be uploaded if desired.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  GraduationCap,
  Upload,
  Presentation,
  Image as ImageIcon,
  X,
  AlertCircle
} from 'lucide-react';
import { useTuskerIdentificationForm } from '../../controllers/useTuskerIdentification';
import { useAuth } from '../../controllers/useAuth';

export default function TuskerIdentificationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, authLoading } = useAuth();

  const {
    formData,
    loadingInitial,
    submitting,
    error,
    isEditMode,
    handleChange,
    handleCoverImageSelect,
    handleDocumentFileSelect,
    handleRemoveDocument,
    saveIdentification,
  } = useTuskerIdentificationForm(id);

  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [dragOverDoc, setDragOverDoc] = useState(false);

  useEffect(() => {
    document.title = `Wild Tuskers Sri Lanka | ${isEditMode ? 'Edit' : 'Upload'} Identification Material`;
  }, [isEditMode]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/login');
    }
  }, [authLoading, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await saveIdentification();
    if (success) {
      navigate('/special-observations?tab=identification');
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes <= 0) return '';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] pt-32 pb-20 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] pt-[calc(68px+1.5rem)] sm:pt-[calc(80px+2.5rem)] pb-24 font-sans">
      <div className="max-w-[880px] mx-auto px-4 sm:px-6">

        {/* ── Top Bar / Back Button ── */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/special-observations?tab=identification')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#4b5563] hover:text-[#111827] bg-white px-3.5 py-2 rounded-lg border border-[#e5e7eb] shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Special Observations</span>
          </button>
        </div>

        {/* ── Main Form Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0b2518] via-[#123824] to-[#0b2518] px-6 sm:px-8 py-6 text-white border-b border-white/10">
            <div className="flex items-center gap-2.5 text-accent text-xs font-bold uppercase tracking-wider mb-1">
              <GraduationCap size={16} />
              <span>Admin Educational Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white m-0 tracking-tight">
              {isEditMode ? 'Edit Tusker Identification Material' : 'Upload Tusker Identification Material'}
            </h1>
            <p className="text-xs sm:text-sm text-white/70 mt-1 m-0">
              Upload presentations (.pptx, .docx, .pdf) for researchers and enthusiasts to learn tusker identification.
            </p>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 flex flex-col gap-6">

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-bold text-[#1f2937]">
                Presentation / Guide Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., How to identify an individual tusker"
                required
                className="w-full px-3.5 py-2.5 bg-[#f9fafb] border border-[#d1d5db] rounded-xl text-xs sm:text-sm text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
            </div>

            {/* Author */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-bold text-[#1f2937]">
                Author / Unit Name
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="e.g., Wild Tuskers Sri Lanka Research Team"
                className="w-full px-3.5 py-2.5 bg-[#f9fafb] border border-[#d1d5db] rounded-xl text-xs sm:text-sm text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
            </div>

            {/* Description / Learning Objectives */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-bold text-[#1f2937]">
                Description & Overview <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what researchers or enthusiasts will learn from this presentation (morphological markers, ear notches, tusk angles, recording protocol)..."
                required
                className="w-full px-3.5 py-2.5 bg-[#f9fafb] border border-[#d1d5db] rounded-xl text-xs sm:text-sm text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-y"
              />
            </div>

            {/* Cover / Preview Image */}
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-bold text-[#1f2937]">
                Cover / Preview Thumbnail
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {formData.coverImage ? (
                  <div className="relative w-full sm:w-48 aspect-video rounded-xl overflow-hidden border border-[#d1d5db] bg-black">
                    <img
                      src={formData.coverImage}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                    {formData.isAutoCover && (
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded text-[0.62rem] font-bold bg-[#0b2518]/90 text-accent border border-white/20">
                        First Slide (Auto-Selected)
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCoverImageSelect('')}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer border-none"
                      title="Remove image"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="w-full sm:w-48 aspect-video rounded-xl border-2 border-dashed border-[#d1d5db] hover:border-accent bg-[#f9fafb] flex flex-col items-center justify-center text-[#6b7280] hover:text-accent transition-all cursor-pointer p-2"
                  >
                    <ImageIcon size={22} className="mb-1" />
                    <span className="text-xs font-semibold">Select Cover Image</span>
                  </button>
                )}

                <div className="flex-1 text-xs text-[#6b7280]">
                  <p className="m-0 mb-1">
                    The first slide of your uploaded presentation is automatically used as the cover. You can also upload a separate cover image if desired.
                  </p>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleCoverImageSelect(e.target.files[0]);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="text-accent font-semibold hover:underline bg-transparent border-none cursor-pointer p-0"
                  >
                    {formData.coverImage ? 'Upload Different Image' : 'Browse custom image from device'}
                  </button>
                </div>
              </div>
            </div>

            {/* Document / Presentation File (.pptx, .docx, .pdf) */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#f0f0f0]">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-[#1f2937]">
                  Document / Presentation File (.pptx, .ppt, .docx, .pdf)
                </label>
                <span className="text-[0.72rem] text-[#6b7280]">Up to 50 MB</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pptx,.ppt,.docx,.doc,.pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleDocumentFileSelect(e.target.files[0]);
                  }
                }}
              />

              {formData.fileName || formData.fileUrl ? (
                <div className="p-3.5 bg-accent/10 border border-accent/30 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-accent text-primary flex items-center justify-center shrink-0">
                      <Presentation size={18} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-[#111827] truncate">
                        {formData.fileName || formData.fileUrl.split('/').pop()}
                      </span>
                      <span className="text-[0.7rem] text-[#6b7280]">
                        {formData.fileType?.toUpperCase()} • {formatBytes(formData.fileSize)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveDocument}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent"
                    title="Remove File"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOverDoc(true); }}
                  onDragLeave={() => setDragOverDoc(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverDoc(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleDocumentFileSelect(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 sm:p-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${dragOverDoc
                    ? 'border-accent bg-accent/10'
                    : 'border-[#d1d5db] hover:border-accent bg-[#f9fafb] hover:bg-white'
                    }`}
                >
                  <div className="w-12 h-12 rounded-full bg-accent/15 text-accent flex items-center justify-center mb-2">
                    <Upload size={22} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#111827]">
                    Click or drag & drop presentation file here
                  </span>
                  <span className="text-[0.75rem] text-[#6b7280] mt-0.5">
                    Supports Microsoft PowerPoint (.pptx), Word (.docx), and PDF (.pdf) up to 50 MB
                  </span>
                </div>
              )}
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="pt-4 border-t border-[#f0f0f0] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/tusker-identification')}
                className="px-5 py-2.5 rounded-xl border border-[#d1d5db] bg-white text-xs sm:text-sm font-semibold text-[#4b5563] hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-7 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-primary text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer border-none disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Uploading Presentation...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>{isEditMode ? 'Save Changes' : 'Publish Presentation'}</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
