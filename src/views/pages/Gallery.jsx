/**
 * @file Gallery.jsx
 * @description Wild Tuskers Sri Lanka Community & Archive Photographic Gallery.
 * Features approved wildlife photos, community submission modal, admin moderation,
 * multi-tusker tagging, location tagging, and full-screen zoomable lightbox.
 */

import React, { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Camera,
  Upload,
  X,
  CheckCircle2,
  Clock,
  Trash2,
  ShieldCheck,
  PlusCircle,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useGallery, useGallerySubmit } from '../../controllers/useGallery';
import { getTuskers } from '../../models/TuskerModel';
import { todayLocalISO } from '../../utils/localDate';
import ImageUploadBox from '../components/ImageUploadBox';
import TuskerMultiSelect from '../components/TuskerMultiSelect';
import EditGalleryPhotoModal from '../components/EditGalleryPhotoModal';
import ImageLightboxModal from '../components/ImageLightboxModal';
import LocationSearchInput from '../components/LocationSearchInput';
import Footer from '../components/Footer';

export default function Gallery() {
  const location = useLocation();
  const navigate = useNavigate();

  // Read return photo ID if navigating back from a Tusker Profile
  const returnPhotoIdFromNav = location.state?.returnPhotoId || location.state?.returnPhoto?.id || null;
  const returnTargetIdRef = useRef(returnPhotoIdFromNav || null);
  if (returnTargetIdRef.current === null) {
    try {
      returnTargetIdRef.current = sessionStorage.getItem('wts_last_gallery_photo_id') || null;
    } catch { /* ignore */ }
  }

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
    handleUpdate,
  } = useGallery(null); // Never open full view lightbox automatically on back navigation

  const [tuskers, setTuskers] = useState([]);
  const [editingPhoto, setEditingPhoto] = useState(null);

  // When returning from Tusker Profile, position directly at the grid photo instantly before paint
  useLayoutEffect(() => {
    const targetId = returnTargetIdRef.current;
    let savedScroll = null;
    try {
      savedScroll = sessionStorage.getItem('wts_last_gallery_scroll');
    } catch { /* ignore */ }

    if (!targetId && !savedScroll) return;

    // Immediately restore vertical position before paint so the slideshow is NEVER shown
    if (savedScroll !== null) {
      const y = parseInt(savedScroll, 10);
      if (!isNaN(y) && y > 0) {
        window.scrollTo({ top: y, behavior: 'instant' });
      }
    }

    const performScroll = () => {
      if (targetId) {
        const card = document.getElementById(`gallery-photo-${targetId}`);
        if (card) {
          card.scrollIntoView({ block: 'center', behavior: 'instant' });
          card.classList.add('ring-4', 'ring-[#0b2518]/40', 'transition-all', 'duration-500');
          setTimeout(() => {
            card.classList.remove('ring-4', 'ring-[#0b2518]/40');
          }, 2000);
          returnTargetIdRef.current = null;
          try {
            sessionStorage.removeItem('wts_last_gallery_photo_id');
            sessionStorage.removeItem('wts_last_gallery_scroll');
            sessionStorage.removeItem('wts_last_gallery_photo_obj');
          } catch { /* ignore */ }
          if (location.state?.returnPhotoId || location.state?.returnPhoto) {
            window.history.replaceState({}, '', window.location.pathname);
          }
          return true;
        }
      }
      return false;
    };

    if (!performScroll()) {
      const frame = requestAnimationFrame(performScroll);
      return () => cancelAnimationFrame(frame);
    }
  }, [photos, returnPhotoIdFromNav, location.state]);

  const handleCloseLightbox = useCallback(() => {
    setActivePhoto(null);
    try {
      sessionStorage.removeItem('wts_last_gallery_photo_id');
      sessionStorage.removeItem('wts_last_gallery_scroll');
      sessionStorage.removeItem('wts_last_gallery_photo_obj');
    } catch { /* ignore */ }
    if (location.state?.returnPhoto || location.state?.returnPhotoId) {
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate, setActivePhoto]);

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

// Loose phonetic normalizer for Sri Lankan tusker names to handle transliteration variations (v/w, th/t, gh/g, etc.)
function normalizeTuskerName(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/w/g, 'v')
    .replace(/gh/g, 'g')
    .replace(/th/g, 't')
    .replace(/tt/g, 't')
    .replace(/rr/g, 'r')
    .replace(/ee/g, 'e')
    .replace(/nb/g, 'mb');
}

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

    // 4. Phonetic / Transliteration match (e.g. Rewatha -> Revatha, Deegabaya -> Deeghabaya, etc.)
    const normTarget = normalizeTuskerName(`${photoTuskerName} ${photoTitle}`);
    if (normTarget) {
      const found = tuskers.find((t) => {
        const normName = normalizeTuskerName(t.name);
        return normName && (normTarget.includes(normName) || normName.includes(normTarget));
      });
      if (found) return found;
    }

    return null;
  }, [activePhoto, tuskers]);

  // Formatted "T### - Name" in one line for card hover
  const getTuskerDisplayName = (item) => {
    if (!item) return null;
    const nameStr = typeof item.tuskerName === 'string' ? item.tuskerName : '';
    const titleStr = typeof item.title === 'string' ? item.title : '';
    if (nameStr && /\bT\d{2,4}\b/i.test(nameStr)) {
      return nameStr;
    }
    if (titleStr && /\bT\d{2,4}\b/i.test(titleStr)) {
      return titleStr;
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

      // Phonetic fallback
      const normTarget = normalizeTuskerName(`${photoName} ${photoTitle}`);
      if (normTarget) {
        const pFound = tuskers.find((t) => {
          const normName = normalizeTuskerName(t.name);
          return normName && (normTarget.includes(normName) || normName.includes(normTarget));
        });
        if (pFound) {
          return `${pFound.id} - ${pFound.name}`;
        }
      }
    }
    return nameStr || null;
  };

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Gallery';
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#fafbfc] pt-[calc(68px+1.5rem)] sm:pt-[calc(80px+2.2rem)] pb-24">
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">

        {/* ── Header & Action Bar ── */}
        <div className="flex flex-col items-center justify-center text-center gap-3 mb-6 pb-4 border-b border-[#eaeaea]">
          <h1 className="font-sans text-[clamp(1.2rem,5vw,2.85rem)] font-bold text-[#111111] m-0 text-center whitespace-nowrap tracking-tight">
            Wild Tuskers Sri Lanka Gallery
          </h1>

          {!isAdmin && (
            <div className="flex items-center justify-center gap-3 w-full sm:w-auto mt-1">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="bg-accent text-primary font-semibold text-xs sm:text-[0.88rem] px-6 sm:px-8 py-2.5 rounded-[8px] inline-flex items-center justify-center gap-2 border-none cursor-pointer hover:bg-accent-hover transition-colors shrink-0 whitespace-nowrap shadow-xs w-full sm:w-auto text-center"
              >
                <PlusCircle size={16} />
                <span>Submit a Photo</span>
              </button>
            </div>
          )}
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
          <div className="flex items-center justify-end mb-8 w-full">
            <div className="flex items-center gap-2 p-1.5 bg-white border border-[#e2e6e4] rounded-[10px] w-full lg:w-auto shadow-xs">
              <button
                onClick={() => setFilter('ALL')}
                className={`flex-1 lg:flex-initial font-sans text-xs sm:text-[0.88rem] font-bold px-4 sm:px-6 py-2.5 sm:py-2 rounded-[8px] transition-all cursor-pointer border-none text-center justify-center ${
                  filter === 'ALL' ? 'bg-primary text-white shadow-xs' : 'bg-transparent text-[#666666] hover:text-[#111111]'
                }`}
              >
                Approved ({allApproved.length})
              </button>
              <button
                onClick={() => setFilter('PENDING')}
                className={`flex-1 lg:flex-initial font-sans text-xs sm:text-[0.88rem] font-bold px-4 sm:px-6 py-2.5 sm:py-2 rounded-[8px] transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
                  filter === 'PENDING' ? 'bg-[#c69b55] text-white shadow-xs' : 'bg-transparent text-[#666666] hover:text-[#111111]'
                }`}
              >
                <Clock size={14} />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-sm sm:max-w-none mx-auto">
            {photos.map((item) => (
              <div
                key={item.id}
                id={`gallery-photo-${item.id}`}
                onClick={() => {
                  try {
                    sessionStorage.setItem('wts_last_gallery_scroll', String(window.scrollY));
                    sessionStorage.setItem('wts_last_gallery_photo_id', String(item.id));
                  } catch { /* ignore */ }
                  setActivePhoto(item);
                }}
                className="group relative aspect-[3/4] sm:aspect-[4/5] rounded-[20px] sm:rounded-[22px] overflow-hidden cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.15)] transition-all duration-300 bg-[#e8ece9]"
              >
                {/* Edge-to-edge photo filling entire card */}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-250 ease-out group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />

                {/* Mobile: subtle permanent gradient so info is clear; Desktop: hover transition */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-5 text-white gap-1 text-left">
                  {/* Tusker name with T number in one line */}
                  {getTuskerDisplayName(item) && (
                    <span className="font-sans text-[0.92rem] sm:text-[1.05rem] font-bold text-white tracking-wide drop-shadow-sm leading-tight block">
                      {getTuskerDisplayName(item)}
                    </span>
                  )}
                  {/* Photographer & Location */}
                  <p className="font-sans text-[0.72rem] sm:text-xs text-white/80 m-0 flex items-center justify-between">
                    <span>By {item.photographer === 'WTS Research Team' || item.photographer === 'WTS Team' ? 'WTS Admin' : (item.photographer || 'WTS Admin')}</span>
                    {item.location && <span className="text-white/60">{item.location}</span>}
                  </p>
                </div>

                {/* Pending Badge if applicable */}
                {item.status === 'pending' && (
                  <span className="absolute top-3 left-3 bg-amber-500 text-white font-sans text-[0.7rem] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1 z-10">
                    <Clock size={11} /> Pending
                  </span>
                )}

                {/* Admin Quick Actions (Positioned top-right so bottom location/name details are never obstructed) */}
                {isAdmin && (
                  <div
                    className="absolute top-3 right-3 flex items-center gap-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPhoto(item);
                      }}
                      className="bg-amber-600/90 hover:bg-amber-600 text-white text-xs p-1.5 rounded-md border-none cursor-pointer shadow-md transition-transform hover:scale-105"
                      title="Edit Photo Details"
                    >
                      <Pencil size={13} />
                    </button>
                    {item.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2 py-1.5 rounded-md border-none cursor-pointer flex items-center gap-1 shadow-md transition-transform hover:scale-105"
                        title="Approve Photo"
                      >
                        <CheckCircle2 size={12} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-600/90 hover:bg-red-700 text-white text-xs p-1.5 rounded-md border-none cursor-pointer shadow-md transition-transform hover:scale-105"
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

        {/* ── Footer Attribution ── */}
        <Footer />
      </div>

      {/* ── Tusker Profile & Photo Lightbox Modal (Centered, Side-by-Side, No Scroll) ── */}
      {activePhoto && (
        <ImageLightboxModal
          photo={activePhoto}
          tusker={matchedTusker}
          tuskers={tuskers}
          allPhotos={allApproved}
          onNavigatePhoto={(p) => setActivePhoto(p)}
          onClose={handleCloseLightbox}
          isAdmin={isAdmin}
          onApprove={handleApprove}
          onDelete={handleDelete}
          onEdit={(p) => setEditingPhoto(p)}
          fromPath="/gallery"
        />
      )}

      {/* ── Admin Edit Photo Modal ── */}
      {editingPhoto && (
        <EditGalleryPhotoModal
          photo={editingPhoto}
          onClose={() => setEditingPhoto(null)}
          onSave={async (id, updates) => {
            await handleUpdate(id, updates);
            setEditingPhoto(null);
          }}
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
  const [isPaused, setIsPaused] = useState(false);
  const count = items?.length || 0;
  const pointerStartXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const pauseTimeoutRef = useRef(null);
  const isHoveredRef = useRef(false);

  // Pause autoplay for 15 seconds whenever user interacts
  const pauseAutoplay = useCallback((durationMs = 15000) => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      if (!isHoveredRef.current) {
        setIsPaused(false);
      }
    }, durationMs);
  }, []);

  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!items || items.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items, isPaused]);

  // Keyboard navigation
  useEffect(() => {
    if (count <= 1) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        pauseAutoplay(15000);
        setActiveIndex((curr) => (curr - 1 + count) % count);
      }
      if (e.key === 'ArrowRight') {
        pauseAutoplay(15000);
        setActiveIndex((curr) => (curr + 1) % count);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [count, pauseAutoplay]);

  const handlePointerDown = (clientX) => {
    pointerStartXRef.current = clientX;
    isDraggingRef.current = true;
    pauseAutoplay(15000);
  };

  const handlePointerUp = (clientX) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    pauseAutoplay(15000);
    const deltaX = clientX - pointerStartXRef.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) {
        setActiveIndex((curr) => (curr - 1 + count) % count);
      } else {
        setActiveIndex((curr) => (curr + 1) % count);
      }
    }
  };

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    pauseAutoplay(10000);
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center mb-8 select-none overflow-hidden pt-1 pb-1">
      {/* 3D Stage Container (Enlarged) */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={(e) => handlePointerDown(e.clientX)}
        onMouseUp={(e) => handlePointerUp(e.clientX)}
        onTouchStart={(e) => {
          if (e.touches.length === 1) handlePointerDown(e.touches[0].clientX);
        }}
        onTouchEnd={(e) => {
          if (e.changedTouches.length === 1) handlePointerUp(e.changedTouches[0].clientX);
        }}
        className="relative w-full max-w-[1180px] h-[360px] sm:h-[450px] md:h-[510px] flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        {/* Navigation Arrow Chevrons */}
        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                pauseAutoplay(15000);
                setActiveIndex((curr) => (curr - 1 + count) % count);
              }}
              className="absolute left-2 sm:left-4 md:left-8 z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/85 hover:bg-white text-black shadow-[0_6px_24px_rgba(0,0,0,0.22)] backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border-none shrink-0"
            >
              <ChevronLeft size={28} strokeWidth={3} className="text-[#111111] -ml-0.5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                pauseAutoplay(15000);
                setActiveIndex((curr) => (curr + 1) % count);
              }}
              className="absolute right-2 sm:right-4 md:right-8 z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/85 hover:bg-white text-black shadow-[0_6px_24px_rgba(0,0,0,0.22)] backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border-none shrink-0"
            >
              <ChevronRight size={28} strokeWidth={3} className="text-[#111111] -mr-0.5" />
            </button>
          </>
        )}

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
                className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                draggable={false}
              />

              {/* Bottom Gradient Overlay (Reveals on Hover on desktop, visible on touch/mobile) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 max-[768px]:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 sm:p-7 text-white gap-1 text-left">
                {getTuskerDisplayName && getTuskerDisplayName(item) && (
                  <span className="font-sans text-[1rem] sm:text-[1.15rem] font-bold text-white tracking-wide drop-shadow-sm leading-tight block">
                    {getTuskerDisplayName(item)}
                  </span>
                )}
                <p className="font-sans text-xs sm:text-sm text-white/80 mt-1 m-0 flex items-center justify-between">
                  <span>By {item.photographer === 'WTS Research Team' || item.photographer === 'WTS Team' ? 'WTS Admin' : (item.photographer || 'WTS Admin')}</span>
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

  const isDirty = useMemo(() => {
    return (
      (formData.images && formData.images.length > 0) ||
      Boolean(formData.image) ||
      formData.title.trim() !== '' ||
      formData.tuskerName.trim() !== '' ||
      formData.location.trim() !== '' ||
      formData.photographer.trim() !== '' ||
      formData.photographerContact.trim() !== ''
    );
  }, [formData]);

  const handleSafeClose = useCallback(() => {
    if (isDirty && !successMsg) {
      const confirmDiscard = window.confirm('Discard unsaved photo submission? Any changes will be lost.');
      if (!confirmDiscard) return;
    }
    // Clean up any preview blob URLs
    (formData.images || []).forEach((u) => {
      if (typeof u === 'string' && u.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(u);
        } catch {
          /* ignore */
        }
      }
    });
    onClose();
  }, [isDirty, successMsg, formData.images, onClose]);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow === 'hidden' ? '' : (prevOverflow || '');
    };
  }, []);

  // Keyboard escape listener to close modal safely
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        handleSafeClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSafeClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={handleSafeClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-photo-modal-title"
        className="relative bg-white rounded-2xl max-w-[560px] w-full p-6 sm:p-8 shadow-2xl border border-[#e8e8e8] my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-4 mb-5 border-b border-[#eeeeee]">
          <div className="min-w-0 pr-3">
            <h3 id="submit-photo-modal-title" className="font-sans text-[1.15rem] sm:text-[1.25rem] font-bold text-[#111111] m-0 truncate">
              Submit a Tusker Photo
            </h3>
            <p className="font-sans text-xs sm:text-[0.84rem] text-[#777777] m-0 mt-0.5 leading-snug">
              Contribute your field photography to the Wild Tuskers Sri Lanka gallery.
            </p>
          </div>
          <button
            aria-label="Close dialog"
            type="button"
            onClick={handleSafeClose}
            className="w-8 h-8 aspect-square min-w-[32px] min-h-[32px] rounded-full shrink-0 bg-[#f4f4f4] hover:bg-[#e8e8e8] text-[#555555] flex items-center justify-center border-none cursor-pointer transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
              className="mt-4 bg-primary text-white font-sans text-sm font-semibold rounded-lg px-6 py-2.5 border-none cursor-pointer hover:bg-primary-light transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4 font-sans text-sm">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-lg text-xs font-medium leading-relaxed">
                {error}
              </div>
            )}

            {/* Photo Upload Zone with Multi-Image Support & Deferred Upload */}
            <div className="flex flex-col gap-1.5">
              <ImageUploadBox
                label="Photo Upload"
                required
                folder="gallery"
                multiple
                deferUpload
                value={formData.images && formData.images.length > 0 ? formData.images : (formData.image ? [formData.image] : [])}
                onChange={handlePhotosChange}
                aspectClass="aspect-[16/10]"
              />
            </div>

            {/* Tusker Multi-Select Dropdown with Search */}
            <div className="w-full">
              <TuskerMultiSelect
                label="Tusker Name / ID"
                placeholder="Search tusker by ID or name (e.g. T001, Panama Puttuwa)..."
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
            <div className="flex flex-col gap-1 min-w-0">
              <label htmlFor="photo-location" className="text-xs font-bold text-[#555555] uppercase tracking-wider">
                Location / Sanctuary <span className="text-red-500">*</span>
              </label>
              <LocationSearchInput
                id="photo-location"
                name="location"
                required
                placeholder="e.g. Udawalawe / Minneriya"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-[#f7f7f8] border border-[#e5e5e5] rounded-lg py-2.5 outline-none focus:border-accent focus:bg-white text-sm scroll-mt-28"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Photographer Name */}
              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="photo-photographer" className="text-xs font-bold text-[#555555] uppercase tracking-wider">
                  Photographer Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="photo-photographer"
                  type="text"
                  name="photographer"
                  maxLength={200}
                  required
                  placeholder="Enter photographer's name"
                  value={formData.photographer}
                  onChange={handleChange}
                  className="w-full bg-[#f7f7f8] border border-[#e5e5e5] rounded-lg px-3.5 py-2.5 outline-none focus:border-accent focus:bg-white text-sm scroll-mt-28"
                />
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="photo-date" className="text-xs font-bold text-[#555555] uppercase tracking-wider">
                  Date Taken (defaults to today) <span className="text-red-500">*</span>
                </label>
                <input
                  id="photo-date"
                  type="date"
                  name="date"
                  required
                  max={todayLocalISO()}
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-[#f7f7f8] border border-[#e5e5e5] rounded-lg px-3.5 py-2.5 outline-none focus:border-accent focus:bg-white text-sm scroll-mt-28"
                />
              </div>
            </div>

            {/* Contributor Contact Email (Optional for Follow-up) */}
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="photo-contact" className="text-xs font-bold text-[#555555] uppercase tracking-wider">
                Contributor Email <span className="text-[#888888] font-normal normal-case">(optional, for verification & attribution)</span>
              </label>
              <input
                id="photo-contact"
                type="email"
                name="photographerContact"
                maxLength={200}
                placeholder="name@example.com"
                value={formData.photographerContact}
                onChange={handleChange}
                className="w-full bg-[#f7f7f8] border border-[#e5e5e5] rounded-lg px-3.5 py-2.5 outline-none focus:border-accent focus:bg-white text-sm scroll-mt-28"
              />
            </div>

            {/* Copyright Ownership Confirmation Checkbox */}
            <div className="bg-[#fafafa] border border-[#e8e8e8] rounded-xl p-3 flex flex-col gap-1.5 mt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#444444] leading-relaxed">
                <input
                  id="photo-consent"
                  type="checkbox"
                  name="consentAgreed"
                  checked={Boolean(formData.consentAgreed)}
                  onChange={handleChange}
                  required
                  className="mt-0.5 accent-primary cursor-pointer w-4 h-4 shrink-0 rounded"
                />
                <span>
                  I confirm that I took this photograph or own the copyright, and grant Wild Tuskers Sri Lanka non-exclusive permission to document and display it for wildlife research, conservation, and education. <span className="text-red-500">*</span>
                </span>
              </label>
            </div>

            {/* Admin review notice */}
            <div className="bg-[#faf5ec] border border-[#c69b55]/30 rounded-xl p-3 flex items-start gap-2.5">
              <ShieldCheck size={16} className="text-accent shrink-0 mt-0.5" />
              <p className="text-[0.76rem] text-[#6d5120] leading-relaxed m-0">
                To maintain ethical wildlife documentation standards, submissions are moderated by WTS Admins before appearing publicly in the gallery.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-[#eeeeee]">
              <button
                type="button"
                onClick={handleSafeClose}
                className="flex-1 sm:flex-none sm:min-w-[120px] h-10 bg-transparent border border-[#dddddd] text-[#666666] font-semibold rounded-lg px-5 cursor-pointer hover:bg-[#f5f5f5] inline-flex items-center justify-center box-border text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="flex-1 sm:flex-none sm:min-w-[160px] h-10 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg px-6 border border-primary cursor-pointer disabled:opacity-60 transition-all inline-flex items-center justify-center gap-1.5 box-border whitespace-nowrap text-center shadow-xs"
              >
                <Upload size={14} />
                <span>
                  {submitting
                    ? 'Uploading & Saving…'
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

