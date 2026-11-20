import React, { useRef, useState, useMemo } from 'react';
import { UploadCloud, Camera, Trash2, Loader2, CheckCircle2, Plus, Image as ImageIcon, GripVertical, Crop } from 'lucide-react';
import { uploadMediaFile } from '../../utils/storageUpload';
import ImageCropperModal from './ImageCropperModal';

/**
 * Universal Direct Image Upload Component
 * Supports single and multiple image uploads directly to Supabase storage (wts-media bucket).
 * Supports integrated cropping for ear biometrics and progression photos.
 *
 * @param {string|string[]} value - Current image URL or array of URLs
 * @param {function} onChange - Callback: (urls: string[] | string, primaryUrl: string) => void
 * @param {string} folder - Destination folder in Supabase wts-media (e.g. 'tuskers', 'unlisted', 'sightings', 'events', 'team')
 * @param {string} label - Optional label above box
 * @param {boolean} multiple - Allow multiple image selection (defaults to true unless circle is set)
 * @param {boolean} circle - Render circular avatar upload (single profile photo mode)
 * @param {string} aspectClass - Aspect ratio class (default 'aspect-[4/3]')
 * @param {boolean} required - Display required indicator
 * @param {boolean} allowCrop - Whether to show crop tools for single image
 * @param {boolean} autoCropOnSelect - Whether selecting a file auto-opens the cropper
 * @param {string} cropLabel - Button label for cropping (e.g. 'Crop Ear Area')
 * @param {string} cropTitle - Title for crop modal
 * @param {string} cropSubtitle - Subtitle for crop modal
 * @param {string} cropAspect - Default aspect ratio ('free', '3:4', '1:1', '4:3', '16:9')
 */
export default function ImageUploadBox({
  value,
  onChange,
  folder = 'uploads',
  label = 'Upload Photos',
  multiple,
  circle = false,
  aspectClass = 'aspect-[4/3]',
  required = false,
  allowCrop = false,
  autoCropOnSelect = false,
  cropLabel = 'Crop Photo',
  cropTitle = 'Crop Ear Biometric Area',
  cropSubtitle = 'Drag the crop box or handles to focus directly on the ear pinna, margin notches, and venation.',
  cropAspect = 'free',
}) {
  const fileInputRef = useRef(null);
  const addMoreInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Interactive Cropper Modal state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSource, setCropperSource] = useState(null);

  // Default to multiple=true unless circle mode or explicitly set to false
  const isMultiple = circle ? false : (multiple !== undefined ? multiple : true);

  // Normalize value into a clean array of URL strings
  const imageList = useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return [];
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed.filter(Boolean);
        } catch {
          // ignore
        }
      }
      return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }, [value]);

  const emitChange = (nextList) => {
    if (!onChange) return;
    const cleanList = nextList.filter(Boolean);
    if (!isMultiple) {
      onChange(cleanList[0] || '');
    } else {
      // If parent passed an array initially, pass array; if parent passed a string or expects string, support both
      if (Array.isArray(value)) {
        onChange(cleanList, cleanList[0] || '');
      } else if (typeof value === 'string') {
        onChange(cleanList.join(', '), cleanList[0] || '');
      } else {
        onChange(cleanList, cleanList[0] || '');
      }
    }
  };

  const handleFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;
    const rawFiles = Array.from(filesList);
    const validFiles = rawFiles.filter((f) => f.type && f.type.startsWith('image/'));

    if (validFiles.length === 0) {
      setUploadError('Please select valid image files (JPG, PNG, WEBP).');
      return;
    }

    const filesToUpload = isMultiple ? validFiles : validFiles.slice(0, 1);

    // If single image mode with allowCrop and autoCropOnSelect, immediately launch cropper modal
    if (!isMultiple && allowCrop && autoCropOnSelect && filesToUpload.length > 0) {
      setCropperSource(filesToUpload[0]);
      setCropperOpen(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (addMoreInputRef.current) addMoreInputRef.current.value = '';
      return;
    }

    setUploadError('');
    setUploading(true);
    setUploadCount(filesToUpload.length);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        try {
          return await uploadMediaFile(file, folder);
        } catch (err) {
          console.error('[ImageUploadBox] upload failed for file:', file.name, err);
          return URL.createObjectURL(file);
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(Boolean);

      if (isMultiple) {
        emitChange([...imageList, ...validUrls]);
      } else {
        emitChange([validUrls[0]]);
      }
    } catch (err) {
      console.error('[ImageUploadBox] batch upload failed:', err);
      setUploadError('One or more images could not be uploaded.');
    } finally {
      setUploading(false);
      setUploadCount(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (addMoreInputRef.current) addMoreInputRef.current.value = '';
    }
  };

  const handleCropComplete = async ({ file, blob, dataUrl }) => {
    if (!file && !blob && !dataUrl) return;

    setUploadError('');
    setUploading(true);
    setUploadCount(1);

    try {
      const uploadTarget = file || blob;
      let finalUrl = '';
      if (uploadTarget) {
        try {
          finalUrl = await uploadMediaFile(uploadTarget, folder);
        } catch (err) {
          console.error('[ImageUploadBox] cropped file upload failed:', err);
          finalUrl = dataUrl || (uploadTarget instanceof Blob ? URL.createObjectURL(uploadTarget) : '');
        }
      } else {
        finalUrl = dataUrl;
      }

      if (finalUrl) {
        emitChange([finalUrl]);
      }
    } catch (err) {
      console.error('[ImageUploadBox] handleCropComplete error:', err);
      setUploadError('Failed to save cropped image.');
    } finally {
      setUploading(false);
      setUploadCount(0);
      setCropperSource(null);
    }
  };

  const handleFileChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setDraggedIndex(null);
    setDragOverIndex(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragActive if dragging external files
    if (draggedIndex === null) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  /* ── Drag & Drop Photo Reordering ───────────── */
  const handleItemDragStart = (idx, e) => {
    if (uploading) return;
    setDraggedIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', idx.toString());
    } catch {
      // ignore
    }
  };

  const handleItemDragOver = (idx, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null) return;
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== idx) {
      setDragOverIndex(idx);
    }
  };

  const handleItemDragLeave = (idx, e) => {
    e.stopPropagation();
    if (dragOverIndex === idx) {
      setDragOverIndex(null);
    }
  };

  const handleItemDrop = (targetIdx, e) => {
    e.preventDefault();
    e.stopPropagation();

    // Reorder internal dragged photo
    if (draggedIndex !== null) {
      if (draggedIndex !== targetIdx) {
        const nextList = [...imageList];
        const [movedItem] = nextList.splice(draggedIndex, 1);
        nextList.splice(targetIdx, 0, movedItem);
        emitChange(nextList);
      }
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // External file drop on a tile
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleItemDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleRemoveOne = (indexToRemove, e) => {
    if (e) e.stopPropagation();
    const nextList = imageList.filter((_, i) => i !== indexToRemove);
    emitChange(nextList);
  };

  const handleRemoveAll = (e) => {
    if (e) e.stopPropagation();
    emitChange([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (addMoreInputRef.current) addMoreInputRef.current.value = '';
  };

  // ── Circle Avatar Mode (Single photo for Team Members / Admins) ──
  if (circle) {
    const singleUrl = imageList[0] || '';
    return (
      <div className="flex flex-col items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center cursor-pointer border-2 transition-all ${
            dragActive
              ? 'border-accent bg-accent/10 scale-105'
              : 'border-[#d8deda] hover:border-accent bg-[#f4f7f5]'
          }`}
          title="Click to upload profile photo"
        >
          {singleUrl ? (
            <>
              <img src={singleUrl} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera size={22} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-[#7a8c82]">
              {uploading ? (
                <Loader2 size={24} className="animate-spin text-accent" />
              ) : (
                <>
                  <Camera size={26} className="text-accent mb-0.5" />
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider">Photo</span>
                </>
              )}
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white backdrop-blur-xs">
              <Loader2 size={22} className="animate-spin text-accent" />
            </div>
          )}
        </div>

        {singleUrl && (
          <button
            type="button"
            onClick={(e) => handleRemoveOne(0, e)}
            className="text-[0.72rem] font-semibold text-rose-600 hover:text-rose-700 bg-none border-none cursor-pointer flex items-center gap-1 transition-colors"
          >
            <Trash2 size={12} />
            <span>Remove Photo</span>
          </button>
        )}

        {uploadError && (
          <span className="text-[0.7rem] text-rose-500 text-center max-w-[200px]">{uploadError}</span>
        )}
      </div>
    );
  }

  // ── Multi-Image / Standard Box Mode ────────────────────────────
  const hasImages = imageList.length > 0;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Header with Label and Count */}
      {label && (
        <div className="font-sans text-[0.78rem] font-semibold text-[#555555] uppercase tracking-[0.6px] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ImageIcon size={14} className="text-accent" />
            <span>
              {label}
              {required && <span className="text-[#e53e3e]"> *</span>}
            </span>
          </span>

          {hasImages && (
            <div className="flex items-center gap-2 flex-wrap">
              {isMultiple && imageList.length > 1 && (
                <span className="text-[0.68rem] font-medium text-gray-400 normal-case hidden sm:inline-flex items-center gap-1">
                  <GripVertical size={11} className="text-gray-400" />
                  <span>Drag to reorder photos</span>
                </span>
              )}
              <span className="text-[0.72rem] font-semibold text-emerald-600 flex items-center gap-1 normal-case bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 size={12} />
                <span>
                  {isMultiple
                    ? `${imageList.length} photo${imageList.length > 1 ? 's' : ''} uploaded`
                    : '1 photo selected'}
                </span>
              </span>
              <button
                type="button"
                onClick={handleRemoveAll}
                className="text-[0.72rem] font-medium text-rose-600 hover:text-rose-700 bg-transparent border-none cursor-pointer hover:underline"
              >
                {isMultiple ? 'Clear all' : 'Remove'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={isMultiple}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={addMoreInputRef}
        type="file"
        multiple={isMultiple}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── Empty State: Large Dropzone ── */}
      {!hasImages && (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative w-full ${aspectClass} rounded-[14px] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center ${
            dragActive
              ? 'border-accent bg-accent/10 scale-[1.01]'
              : 'border-[#d0d7d2] hover:border-accent hover:bg-[#fafaf8] bg-[#f8faf9]'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2.5">
              <Loader2 size={34} className="animate-spin text-accent" />
              <div className="flex flex-col gap-0.5">
                <span className="font-sans text-xs font-bold text-gray-700">
                  Uploading {uploadCount > 1 ? `${uploadCount} photos` : 'photo'} to database…
                </span>
                <span className="font-sans text-[0.7rem] text-gray-500">
                  Saving permanently to Supabase Storage
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-13 h-13 rounded-full bg-accent/15 text-accent flex items-center justify-center transition-transform hover:scale-110">
                <UploadCloud size={26} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-sans text-[0.92rem] font-bold text-[#1f2824]">
                  {isMultiple ? 'Click or drag photos to upload' : 'Click or drag photo to upload'}
                </span>
                <span className="font-sans text-[0.75rem] text-[#788880]">
                  {isMultiple
                    ? 'Supports multiple images simultaneously (JPG, PNG, WEBP)'
                    : 'Single image upload (JPG, PNG, WEBP)'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Populated State: Single Photo vs Multi-Photo Grid ── */}
      {hasImages && !isMultiple && (
        <div className="flex flex-col items-center gap-2.5">
          <div className={`relative ${aspectClass} rounded-[14px] overflow-hidden border border-[#d8e0da] shadow-sm bg-[#eef3f0] group max-w-[280px] w-full mx-auto`}>
            <img
              src={imageList[0]}
              alt="Uploaded photo"
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300 pointer-events-none"
            />
            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              {allowCrop && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCropperSource(imageList[0]);
                    setCropperOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-[8px] bg-[#0b2518] hover:bg-[#133824] text-white font-sans text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer border border-[#c69b55]/50 transition-all"
                  title={cropLabel}
                >
                  <Crop size={13} className="text-[#c69b55]" />
                  <span>{cropLabel}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => !uploading && fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-[8px] bg-white text-[#111111] font-sans text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer border-none hover:bg-gray-100 transition-all"
              >
                <UploadCloud size={13} />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={handleRemoveAll}
                className="w-7 h-7 rounded-[8px] bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center cursor-pointer border-none shadow-md transition-colors"
                title="Remove photo"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap justify-center mt-1">
            {allowCrop && (
              <button
                type="button"
                onClick={() => {
                  setCropperSource(imageList[0]);
                  setCropperOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#0b2518] hover:bg-[#133824] text-white text-[0.76rem] font-bold border border-[#c69b55]/40 cursor-pointer shadow-2xs transition-colors"
              >
                <Crop size={13} className="text-[#c69b55]" />
                <span>{cropLabel}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => !uploading && fileInputRef.current?.click()}
              className="text-[0.76rem] font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
            >
              <UploadCloud size={14} />
              <span>Click to replace photo</span>
            </button>
          </div>
        </div>
      )}

      {hasImages && isMultiple && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {imageList.map((url, idx) => {
              const isBeingDragged = draggedIndex === idx;
              const isDragTarget = dragOverIndex === idx && draggedIndex !== idx;

              return (
                <div
                  key={`${url}-${idx}`}
                  draggable={!uploading}
                  onDragStart={(e) => handleItemDragStart(idx, e)}
                  onDragOver={(e) => handleItemDragOver(idx, e)}
                  onDragLeave={(e) => handleItemDragLeave(idx, e)}
                  onDrop={(e) => handleItemDrop(idx, e)}
                  onDragEnd={handleItemDragEnd}
                  className={`relative aspect-[4/3] rounded-[10px] overflow-hidden border bg-[#eef3f0] group transition-all duration-200 select-none ${
                    isBeingDragged
                      ? 'opacity-30 scale-95 border-2 border-dashed border-accent ring-2 ring-accent/30 cursor-grabbing'
                      : isDragTarget
                      ? 'border-accent ring-3 ring-accent scale-[1.03] shadow-lg z-10 cursor-grabbing'
                      : 'border-[#d8e0da] shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing hover:border-accent/70'
                  }`}
                  title="Click & drag with mouse to reorder photos"
                >
                  <img
                    src={url}
                    alt={`Upload ${idx + 1}`}
                    draggable={false}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300 pointer-events-none"
                  />

                  {/* Primary Photo Badge */}
                  {idx === 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-[#0b2518]/90 text-[#f5ecd7] text-[0.62rem] font-bold px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider backdrop-blur-xs pointer-events-none z-10 flex items-center gap-1">
                      Primary
                    </span>
                  )}

                  {/* Number Badge */}
                  {idx > 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[0.62rem] font-bold px-1.5 py-0.5 rounded shadow-xs pointer-events-none z-10">
                      #{idx + 1}
                    </span>
                  )}

                  {/* Drag Grip Handle on Hover */}
                  <span className="absolute bottom-1.5 right-1.5 bg-black/55 text-white/90 p-1 rounded backdrop-blur-xs flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-xs">
                    <GripVertical size={13} />
                  </span>

                  {/* Remove button */}
                  <button
                    type="button"
                    draggable={false}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => handleRemoveOne(idx, e)}
                    title="Remove photo"
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/65 hover:bg-rose-600 text-white flex items-center justify-center border-none cursor-pointer transition-colors shadow-xs z-20"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}

            {/* "+ Add More Photos" Tile */}
            {isMultiple && (
              <div
                onClick={() => !uploading && addMoreInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`aspect-[4/3] rounded-[10px] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-3 text-center ${
                  dragActive
                    ? 'border-accent bg-accent/15 scale-[1.02]'
                    : 'border-[#cfd8d2] hover:border-accent hover:bg-[#fafaf8] bg-[#f8faf9]'
                }`}
                title="Add more photos"
              >
                {uploading ? (
                  <Loader2 size={22} className="animate-spin text-accent" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-[#556960]">
                    <div className="w-8 h-8 rounded-full bg-accent/12 text-accent flex items-center justify-center">
                      <Plus size={16} />
                    </div>
                    <span className="font-sans text-[0.75rem] font-bold text-[#1f2824]">
                      Add More
                    </span>
                    <span className="font-sans text-[0.65rem] text-[#889890]">
                      Multiple allowed
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Uploading indicator during add-more */}
          {uploading && (
            <div className="flex items-center gap-2 text-xs font-semibold text-accent bg-accent/10 px-3 py-2 rounded-lg">
              <Loader2 size={14} className="animate-spin" />
              <span>
                Uploading {uploadCount > 1 ? `${uploadCount} photos` : 'photo'} to database storage…
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {uploadError && (
        <span className="text-[0.72rem] text-rose-500 font-medium">{uploadError}</span>
      )}

      {/* Interactive Ear & Progression Photo Cropper Modal */}
      {allowCrop && (
        <ImageCropperModal
          isOpen={cropperOpen}
          imageSrc={cropperSource}
          title={cropTitle}
          subtitle={cropSubtitle}
          defaultAspect={cropAspect}
          onClose={() => {
            setCropperOpen(false);
            setCropperSource(null);
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
