import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  Camera,
  Upload,
  X,
  MapPin,
  CheckCircle2,
  Clock,
  Trash2,
  ShieldCheck,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { useGallery, useGallerySubmit } from '../../controllers/useGallery';
import { getTuskers } from '../../models/TuskerModel';
import ImageUploadBox from '../components/ImageUploadBox';
import TuskerMultiSelect from '../components/TuskerMultiSelect';

export default function Gallery() {
  const {
    photos,
    allApproved,
    pendingCount,
    loading,
    filter,
    setFilter,
    activePhoto,
    setActivePhoto,
    showSubmitModal,
    setShowSubmitModal,
    isAdmin,
    reloadPhotos,
    handleApprove,
    handleDelete,
  } = useGallery();

  const [tuskers, setTuskers] = useState([]);

  useEffect(() => {
    let active = true;
    getTuskers()
      .then((data) => {
        if (active) setTuskers(data || []);
      })
      .catch((err) => console.warn('[Gallery] Failed to load tuskers:', err));
    return () => {
      active = false;
    };
  }, []);

  // Always ensure body overflow is cleanly unlocked when Gallery unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, []);

  // Browser Back button support: pressing device/browser back closes the photo modal
  useEffect(() => {
    if (!activePhoto) return;

    window.history.pushState({ galleryModal: true }, '');

    const handlePopState = () => {
      setActivePhoto(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activePhoto, setActivePhoto]);

  const closePhotoModal = useCallback(() => {
    if (window.history.state?.galleryModal) {
      window.history.back();
    } else {
      setActivePhoto(null);
    }
  }, [setActivePhoto]);

  // Match photo to registered tusker
  const matchedTusker = useMemo(() => {
    if (!activePhoto || !tuskers.length) return null;
    const photoId = String(activePhoto.tuskerId || '').toLowerCase().trim();
    const photoTuskerName = String(activePhoto.tuskerName || '').toLowerCase().trim();
    const photoTitle = String(activePhoto.title || '').toLowerCase().trim();

    // 1. Direct ID match
    if (photoId) {
      const found = tuskers.find((t) => String(t.id || '').toLowerCase() === photoId);
      if (found) return found;
    }

    // 2. ID match from tuskerName / title (e.g. "T304 - Nero" or "T304")
    const idMatch = `${photoTuskerName} ${photoTitle}`.match(/\b(t\d{2,4})\b/i);
    if (idMatch) {
      const found = tuskers.find((t) => String(t.id || '').toLowerCase() === idMatch[1].toLowerCase());
      if (found) return found;
    }

    // 3. Name match against known tuskers
    for (const t of tuskers) {
      const tname = String(t.name || '').toLowerCase().trim();
      if (tname && (photoTuskerName.includes(tname) || photoTitle.includes(tname))) {
        return t;
      }
    }

    return null;
  }, [activePhoto, tuskers]);

  // Formatted "T### - Name" in one line for card hover
  const getTuskerDisplayName = (item) => {
    if (!item) return null;
    const nameStr = typeof item.tuskerName === 'string' ? item.tuskerName : '';
    if (nameStr && /\bT\d{2,4}\b/i.test(nameStr)) {
      return nameStr;
    }
    if (tuskers && tuskers.length > 0) {
      const photoId = String(item.tuskerId || '').toLowerCase().trim();
      const photoName = String(item.tuskerName || '').toLowerCase().trim();
      const photoTitle = String(item.title || '').toLowerCase().trim();
      const found = tuskers.find((t) => {
        const tid = String(t.id || '').toLowerCase();
        const tname = String(t.name || '').toLowerCase();
        return (
          (tid && (photoId === tid || photoName.includes(tid) || photoTitle.includes(tid))) ||
          (tname && (photoName.includes(tname) || photoTitle.includes(tname)))
        );
      });
      if (found) {
        return `${found.id} - ${found.name}`;
      }
    }
    return nameStr || null;
  };

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Wild Tuskers Sri Lanka Gallery';
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#fafbfc] pt-[calc(80px+2.2rem)] pb-24">
      <div className="w-full max-w-[1360px] mx-auto px-6 sm:px-8">

        {/* ── Header & Action Bar ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3 pb-3.5 border-b border-[#eaeaea]">
          <div>
            <h1 className="font-sans text-[1.95rem] sm:text-[2.25rem] font-bold text-[#111111] m-0 mb-1.5">
              Wild Tuskers Sri Lanka Gallery
            </h1>
          </div>

          <div className="flex items-center gap-3 self-start md:self-end">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="bg-accent text-primary font-semibold text-[0.88rem] px-5 py-2.5 rounded-[6px] inline-flex items-center gap-2 border-none cursor-pointer hover:bg-accent-hover transition-colors shrink-0 whitespace-nowrap"
            >
              <PlusCircle size={16} />
              <span>Submit a Photo</span>
            </button>
          </div>
        </div>

        {/* ── Coverflow Carousel Slideshow (Reference UI Image 2) ── */}
        {allApproved.length > 0 && (
          <CoverflowCarousel
            items={allApproved}
            onSelectPhoto={(photo) => setActivePhoto(photo)}
            getTuskerDisplayName={getTuskerDisplayName}
          />
        )}

        {/* ── Admin Filters (when logged in as admin) ── */}
        {isAdmin && (
          <div className="flex items-center justify-end mb-8">
            <div className="flex items-center gap-2 p-1 bg-white border border-[#e2e6e4] rounded-[10px]">
              <button
                onClick={() => setFilter('ALL')}
                className={`font-sans text-[0.82rem] font-semibold px-4 py-1.5 rounded-[8px] transition-all cursor-pointer border-none ${filter === 'ALL' ? 'bg-primary text-white shadow-xs' : 'bg-transparent text-[#666666] hover:text-[#111111]'
                  }`}
              >
                Approved ({allApproved.length})
              </button>
              <button
                onClick={() => setFilter('PENDING')}
                className={`font-sans text-[0.82rem] font-semibold px-4 py-1.5 rounded-[8px] transition-all cursor-pointer border-none flex items-center gap-1.5 ${filter === 'PENDING' ? 'bg-[#c69b55] text-white shadow-xs' : 'bg-transparent text-[#666666] hover:text-[#111111]'
                  }`}
              >
                <Clock size={13} />
                <span>Pending Review</span>
                {pendingCount > 0 && (
                  <span className="bg-[#b32d2e] text-white text-[0.72rem] px-1.5 py-0.2 rounded-full font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Photo Grid (Edge-to-Edge Cards matching Reference Image 1) ── */}
        {loading ? (
          <div className="py-24 text-center text-[#aaaaaa] font-sans text-sm">
            Loading photographic gallery…
          </div>
        ) : photos.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-[#e8e8e8]">
            <Camera size={38} className="text-[#cccccc]" />
            <p className="font-sans text-[0.95rem] text-[#777777] m-0">No photos match your filter.</p>
            <button
              onClick={() => setFilter('ALL')}
              className="font-sans text-[0.85rem] text-accent font-semibold underline bg-none border-none cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {photos.map((item) => (
              <div
                key={item.id}
                onClick={() => setActivePhoto(item)}
                className="group relative aspect-[3/4] sm:aspect-[4/5] rounded-[22px] overflow-hidden cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.15)] transition-all duration-300 bg-[#e8ece9]"
              >
                {/* Edge-to-edge photo filling entire card */}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Subtle Hover Gradient Overlay with details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white gap-1 text-left">
                  {/* Tusker name with T number in one line */}
                  {getTuskerDisplayName(item) && (
                    <span className="font-sans text-[0.95rem] sm:text-[1.05rem] font-bold text-white tracking-wide drop-shadow-sm leading-tight block">
                      {getTuskerDisplayName(item)}
                    </span>
                  )}
                  {/* Photographer & Location */}
                  <p className="font-sans text-xs text-white/80 m-0 flex items-center justify-between">
                    <span>By {item.photographer}</span>
                    {item.location && <span className="text-white/60">{item.location}</span>}
                  </p>
                </div>

                {/* Pending Badge if applicable */}
                {item.status === 'pending' && (
                  <span className="absolute top-3 left-3 bg-amber-500 text-white font-sans text-[0.7rem] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1 z-10">
                    <Clock size={11} /> Pending
                  </span>
                )}

                {/* Admin Quick Actions */}
                {isAdmin && (
                  <div
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2 py-1 rounded-md border-none cursor-pointer flex items-center gap-1 shadow-sm"
                        title="Approve Photo"
                      >
                        <CheckCircle2 size={12} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-600/90 hover:bg-red-700 text-white text-xs p-1 rounded-md border-none cursor-pointer shadow-sm"
                      title="Delete Photo"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── Tusker Profile & Photo Lightbox Modal (Centered, Side-by-Side, No Scroll) ── */}
      {activePhoto && (
        <TuskerPhotoLightbox
          photo={activePhoto}
          tusker={matchedTusker}
          onClose={closePhotoModal}
          isAdmin={isAdmin}
          onApprove={handleApprove}
          onDelete={handleDelete}
        />
      )}

      {/* ── Submit Photo Modal ── */}
      {showSubmitModal && (
        <SubmitPhotoModal
          onClose={() => setShowSubmitModal(false)}
          onSuccess={() => {
            reloadPhotos();
          }}
        />
      )}
    </div>
  );
}

/* ── 3D Coverflow Carousel (Exact UI from Reference Image 2) ─── */
function CoverflowCarousel({ items, onSelectPhoto, getTuskerDisplayName }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const count = items?.length || 0;

  useEffect(() => {
    if (!items || items.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items]);

  // Keyboard navigation
  useEffect(() => {
    if (count <= 1) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') setActiveIndex((curr) => (curr - 1 + count) % count);
      if (e.key === 'ArrowRight') setActiveIndex((curr) => (curr + 1) % count);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [count]);

  if (!items || items.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center mb-8 select-none overflow-hidden pt-1 pb-1">
      {/* 3D Stage Container (Enlarged) */}
      <div className="relative w-full max-w-[1180px] h-[360px] sm:h-[450px] md:h-[510px] flex items-center justify-center">
        {items.map((item, index) => {
          let diff = (index - activeIndex) % count;
          if (diff > count / 2) diff -= count;
          if (diff < -count / 2) diff += count;

          const isVisible = Math.abs(diff) <= 2;
          if (!isVisible) return null;

          const isCenter = diff === 0;
          const isLeft = diff < 0;
          const absDiff = Math.abs(diff);

          let translateX = '0%';
          let scale = 1;
          let zIndex = 30;
          let opacity = 1;

          if (absDiff === 1) {
            translateX = isLeft ? '-52%' : '52%';
            scale = 0.86;
            zIndex = 20;
            opacity = 0.82;
          } else if (absDiff === 2) {
            translateX = isLeft ? '-94%' : '94%';
            scale = 0.72;
            zIndex = 10;
            opacity = 0.45;
          }

          return (
            <div
              key={item.id}
              onClick={() => {
                if (isCenter) {
                  onSelectPhoto(item);
                } else {
                  setActiveIndex(index);
                }
              }}
              style={{
                transform: `translateX(${translateX}) scale(${scale})`,
                zIndex,
                opacity,
              }}
              className="absolute w-[250px] sm:w-[320px] md:w-[380px] h-[340px] sm:h-[420px] md:h-[480px] rounded-[26px] overflow-hidden cursor-pointer transition-all duration-500 ease-out shadow-[0_18px_45px_rgba(0,0,0,0.26)] group"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                draggable={false}
              />

              {/* Bottom Gradient Overlay (Reveals on Hover) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 sm:p-7 text-white gap-1 text-left">
                {getTuskerDisplayName && getTuskerDisplayName(item) && (
                  <span className="font-sans text-[1rem] sm:text-[1.15rem] font-bold text-white tracking-wide drop-shadow-sm leading-tight block">
                    {getTuskerDisplayName(item)}
                  </span>
                )}
                <p className="font-sans text-xs sm:text-sm text-white/80 mt-1 m-0 flex items-center justify-between">
                  <span>By {item.photographer}</span>
                  {item.location && <span className="text-white/60">{item.location}</span>}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dotted Line Divider replacing arrow buttons */}
      <div className="w-full max-w-[1360px] border-t-2 border-dotted border-[#cbd5e1] mt-5 mb-2" />
    </div>
  );
}

/* ── Tusker Photo Full-Screen Lightbox Component ──────────────── */
function TuskerPhotoLightbox({
  photo,
  tusker,
  onClose,
  isAdmin,
  onApprove,
  onDelete,
}) {
  // Prevent background scrolling while modal is open
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

  // Keyboard escape listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!photo) return null;

  // Resolve T-Number and Name
  const tuskerDisplayName = tusker
    ? `${tusker.id} - ${tusker.name}`
    : (photo.tuskerName || photo.title || 'Wild Tusker');

  const locationTaken = photo.location || tusker?.location || 'Sri Lanka';
  const photographerName = photo.photographer || 'WTS Research Team';

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 overflow-hidden select-none animate-fade-in"
      onClick={onClose}
    >
      {/* ── Top Bar: Close Button ── */}
      <div className="w-full flex justify-end items-center z-50">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 backdrop-blur-md cursor-pointer transition-all shadow-lg hover:scale-105 active:scale-95"
          title="Close (Esc)"
          aria-label="Close photo view"
        >
          <X size={20} />
        </button>
      </div>

      {/* ── Center Area: Full View Photo (Both landscape & portrait visible fully in center) ── */}
      <div
        className="flex-1 w-full flex items-center justify-center min-h-0 my-auto py-2 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.imageUrl}
          alt={tuskerDisplayName}
          className="max-w-full max-h-[75vh] sm:max-h-[80vh] w-auto h-auto object-contain rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.95)] select-none border border-white/10"
        />
      </div>

      {/* ── Bottom Bar: T-Number & Name, Location Taken, Photographer Name ── */}
      <div
        className="w-full max-w-[860px] mx-auto z-50 mt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-black/85 via-[#0b1c14]/90 to-black/85 backdrop-blur-xl border border-white/15 rounded-2xl px-5 sm:px-7 py-3.5 sm:py-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">

          {/* Left: T-Number & Name of Tusker */}
          <div className="flex flex-col gap-0.5 min-w-0">
            <h2 className="font-serif text-lg sm:text-[1.35rem] font-bold text-white tracking-wide m-0 truncate drop-shadow-sm">
              {tuskerDisplayName}
            </h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs sm:text-[0.85rem] text-[#d4ded8] font-sans">
              {/* Location Taken */}
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-accent shrink-0" />
                <span>{locationTaken}</span>
              </span>

              {/* Photographer Name */}
              <span className="flex items-center gap-1.5">
                <Camera size={14} className="text-accent shrink-0" />
                <span>
                  Photo by <strong className="text-white font-semibold">{photographerName}</strong>
                </span>
              </span>
            </div>
          </div>

          {/* Right: Quick Actions (Admin Moderation or View Tusker Link) */}
          <div className="flex items-center gap-2.5 shrink-0">
            {isAdmin && (
              <>
                {photo.status === 'pending' && onApprove && (
                  <button
                    onClick={() => {
                      onApprove(photo.id);
                      onClose();
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-semibold py-2 px-3.5 rounded-lg border-none cursor-pointer flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <CheckCircle2 size={13} />
                    <span>Approve</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete(photo.id);
                      onClose();
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-sans text-xs font-semibold py-2 px-3 rounded-lg border-none cursor-pointer flex items-center gap-1 shadow-sm transition-colors"
                    title="Delete photo"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                )}
              </>
            )}

            {tusker && (
              <Link
                to={`/tuskers/${tusker.id.toLowerCase()}`}
                className="bg-white/10 hover:bg-white/20 text-[#f5ecd7] hover:text-white font-sans text-xs font-semibold py-2 px-3.5 rounded-lg border border-white/20 transition-all flex items-center gap-1.5 no-underline shadow-xs"
              >
                <span>Tusker Profile</span>
                <ExternalLink size={12} />
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Submit Photo Modal Component ─────────────────────────────── */
function SubmitPhotoModal({ onClose, onSuccess }) {
  const {
    formData,
    uploading,
    submitting,
    error,
    successMsg,
    handleChange,
    handlePhotosChange,
    submit,
  } = useGallerySubmit(onSuccess);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow === 'hidden' ? '' : (prevOverflow || '');
    };
  }, []);

  // Keyboard escape listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-[560px] w-full p-6 sm:p-8 shadow-2xl border border-[#e8e8e8] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-4 mb-5 border-b border-[#eeeeee]">
          <div>
            <h3 className="font-sans text-[1.25rem] font-bold text-[#111111] m-0">
              Submit a Tusker Photo
            </h3>
            <p className="font-sans text-xs text-[#777777] m-0 mt-0.5">
              Contribute your field photography to the Wild Tuskers Sri Lanka gallery.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f4f4f4] hover:bg-[#e8e8e8] text-[#555555] flex items-center justify-center border-none cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {successMsg ? (
          <div className="flex flex-col items-center text-center py-8 gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="font-sans text-lg font-bold text-[#111111] m-0">
              {formData.images && formData.images.length > 1
                ? `${formData.images.length} Photos Submitted Successfully!`
                : 'Photo Submitted Successfully!'}
            </h4>
            <p className="font-sans text-sm text-[#666666] max-w-[380px] leading-relaxed m-0">
              Thank you for contributing. Your photograph
              {formData.images && formData.images.length > 1 ? 's have' : ' has'} been queued and will appear in the gallery as soon as reviewed by a WTS admin.
            </p>
            <button
              onClick={onClose}
              className="mt-4 bg-primary text-white font-sans text-sm font-semibold rounded-lg px-6 py-2.5 border-none cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4 font-sans text-sm">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-lg text-xs font-medium">
                {error}
              </div>
            )}

            {/* Photo Upload Zone with Multi-Image Support */}
            <div className="flex flex-col gap-1.5">
              <ImageUploadBox
                label="Photo Upload"
                required
                folder="gallery"
                multiple
                value={formData.images && formData.images.length > 0 ? formData.images : (formData.image ? [formData.image] : [])}
                onChange={handlePhotosChange}
                aspectClass="aspect-[16/10]"
              />
            </div>

            {/* Tusker Multi-Select Dropdown with Search */}
            <div className="w-full">
              <TuskerMultiSelect
                label="Tusker Name / ID"
                placeholder="Search tusker by ID or name (e.g. T180, Skandaraja, Revatha)..."
                value={formData.tuskerName}
                onChange={(_list, formatted) => {
                  handleChange({ target: { name: 'tuskerName', value: formatted } });
                  if (!formData.location && _list && _list[0]?.location) {
                    handleChange({ target: { name: 'location', value: _list[0].location } });
                  }
                }}
                helperText="Select one or multiple tuskers featured in your photograph."
              />
            </div>

            {/* Location */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#555555] uppercase tracking-wider">
                Location / Sanctuary
              </label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Udawalawe / Minneriya"
                value={formData.location}
                onChange={handleChange}
                className="bg-[#f7f7f8] border border-[#e5e5e5] rounded-lg px-3.5 py-2.5 outline-none focus:border-accent focus:bg-white text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Photographer Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#555555] uppercase tracking-wider">
                  Photographer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="photographer"
                  placeholder="Your full name"
                  value={formData.photographer}
                  onChange={handleChange}
                  className="bg-[#f7f7f8] border border-[#e5e5e5] rounded-lg px-3.5 py-2.5 outline-none focus:border-accent focus:bg-white text-sm"
                />
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#555555] uppercase tracking-wider">
                  Date Taken
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="bg-[#f7f7f8] border border-[#e5e5e5] rounded-lg px-3.5 py-2.5 outline-none focus:border-accent focus:bg-white text-sm"
                />
              </div>
            </div>

            {/* Admin review notice */}
            <div className="bg-[#faf5ec] border border-[#c69b55]/30 rounded-xl p-3 flex items-start gap-2.5 mt-1">
              <ShieldCheck size={16} className="text-accent shrink-0 mt-0.5" />
              <p className="text-[0.76rem] text-[#6d5120] leading-relaxed m-0">
                To maintain ethical wildlife documentation standards, submissions are moderated by WTS Admins before appearing publicly in the gallery.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#eeeeee]">
              <button
                type="button"
                onClick={onClose}
                className="bg-transparent border border-[#dddddd] text-[#666666] font-semibold rounded-lg px-4 py-2 cursor-pointer hover:bg-[#f5f5f5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="bg-primary hover:bg-primary-light text-white font-semibold rounded-lg px-6 py-2 border-none cursor-pointer disabled:opacity-60 transition-all flex items-center gap-1.5"
              >
                <Upload size={14} />
                <span>
                  {submitting
                    ? 'Submitting…'
                    : formData.images && formData.images.length > 1
                      ? `Submit ${formData.images.length} Photos`
                      : 'Submit Photo'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}

