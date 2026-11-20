import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  User,
  UserCheck,
  Tag,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ShieldAlert,
  ExternalLink,
  Camera,
  Maximize2,
  X,
  Eye,
  Map as MapIcon,
  HeartPulse,
  Hourglass,
  Skull,
  StickyNote,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Minimize,
  Lock,
  Plus,
  Shield,
  MoreVertical,
  Edit,
  Trash2,
} from 'lucide-react';
import { useTuskerProfile } from '../../controllers/useTusker';
import { calculateTuskerAge, parseSightingDetails, updateSighting, deleteSighting } from '../../models/TuskerModel';
import StatusBadge from '../components/StatusBadge';
import TuskerSightingsMap from '../components/TuskerSightingsMap';
import EditSightingModal from '../components/EditSightingModal';
import { getCachedAspect, setCachedAspect, probeImageAspect } from '../../utils/photoAspectCache';

/* ── Fullscreen Zoom Lightbox ─────────────────────────────────── */
function TuskerPhotoZoomLightbox({ photos, name, tuskerId, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const changeIndex = useCallback((newIdx) => {
    setIndex(newIdx);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handlePrev = useCallback((e) => {
    e?.stopPropagation();
    if (!photos || photos.length <= 1) return;
    setIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [photos]);

  const handleNext = useCallback((e) => {
    e?.stopPropagation();
    if (!photos || photos.length <= 1) return;
    setIndex((prev) => (prev + 1) % photos.length);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [photos]);

  const zoomIn = useCallback((e) => {
    e?.stopPropagation();
    setScale((prev) => Math.min(prev + 0.5, 4));
  }, []);

  const zoomOut = useCallback((e) => {
    e?.stopPropagation();
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const resetZoom = useCallback((e) => {
    e?.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const toggleZoom = (e) => {
    e?.stopPropagation();
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.5);
    }
  };

  const toggleFullscreen = useCallback(async (e) => {
    e?.stopPropagation();
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch {
      // Fullscreen might be restricted by user-agent/iframe, fallback gracefully
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (scale > 1) {
          resetZoom();
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === '+' || e.key === '=') {
        zoomIn();
      } else if (e.key === '-' || e.key === '_') {
        zoomOut();
      } else if (e.key === '0' || e.key.toLowerCase() === 'r') {
        resetZoom();
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose, resetZoom, scale, toggleFullscreen, zoomIn, zoomOut]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow === 'hidden' ? '' : (originalOverflow || '');
    };
  }, []);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    setScale((prev) => {
      const nextScale = Math.min(Math.max(prev + delta, 1), 4);
      if (nextScale === 1) setPosition({ x: 0, y: 0 });
      return nextScale;
    });
  };

  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const activePhoto = photos && photos[index];

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[10000] bg-black/95 text-white flex flex-col select-none overflow-hidden animate-fade-in"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-black/60 backdrop-blur-md border-b border-white/10 z-20 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="bg-accent/20 border border-accent/40 text-accent font-mono font-bold text-xs px-2.5 py-1 rounded">
            {tuskerId || 'WTS'}
          </span>
          <span className="font-sans text-sm sm:text-base font-semibold truncate text-white/90">
            {name}
          </span>
          {photos && photos.length > 0 && (
            <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded-full font-medium">
              {index + 1} of {photos.length}
            </span>
          )}
        </div>

        {/* Zoom & Fullscreen Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={zoomOut}
            disabled={scale <= 1}
            title="Zoom out (-)"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 flex items-center justify-center text-white border-none cursor-pointer transition-colors"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={resetZoom}
            title="Reset zoom (0)"
            className="px-2 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-mono text-white/90 border-none cursor-pointer transition-colors"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={zoomIn}
            disabled={scale >= 4}
            title="Zoom in (+)"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 flex items-center justify-center text-white border-none cursor-pointer transition-colors"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={resetZoom}
            disabled={scale === 1 && position.x === 0 && position.y === 0}
            title="Reset position and zoom (R)"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 flex items-center justify-center text-white border-none cursor-pointer transition-colors"
          >
            <RotateCcw size={15} />
          </button>

          <div className="w-[1px] h-5 bg-white/15 mx-1" />

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white border-none cursor-pointer transition-colors"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>

          <button
            onClick={onClose}
            title="Close (Esc)"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500/80 flex items-center justify-center text-white border-none cursor-pointer transition-colors ml-1"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden cursor-default"
        onWheel={handleWheel}
        onClick={(e) => {
          if (e.target === e.currentTarget && scale === 1) onClose();
        }}
      >
        {/* Navigation Arrows */}
        {photos && photos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              title="Previous photo (Left arrow)"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 flex items-center justify-center cursor-pointer backdrop-blur-sm transition-all hover:scale-105"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              title="Next photo (Right arrow)"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 flex items-center justify-center cursor-pointer backdrop-blur-sm transition-all hover:scale-105"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Scalable & Draggable Image Canvas */}
        {activePhoto && (
          <div
            className="w-full h-full flex items-center justify-center select-none"
            style={{
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={toggleZoom}
          >
            <img
              src={activePhoto}
              alt={`${name} preview ${index + 1}`}
              draggable={false}
              className="max-h-[82vh] max-w-[92vw] object-contain transition-transform duration-75 select-none"
              style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
                transformOrigin: 'center center',
              }}
            />
          </div>
        )}
      </div>

      {/* Bottom Thumbnail Strip & Keyboard Hint */}
      <div className="flex flex-col items-center gap-2 px-4 py-3 bg-black/70 backdrop-blur-md border-t border-white/10 z-20 shrink-0">
        {photos && photos.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto max-w-full px-2 py-1 scrollbar-thin">
            {photos.map((p, i) => (
              <button
                key={i}
                onClick={() => changeIndex(i)}
                className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer p-0 bg-black/40 ${i === index
                  ? 'border-accent ring-2 ring-accent/60 scale-105 opacity-100'
                  : 'border-transparent opacity-50 hover:opacity-90'
                  }`}
                title={`Go to photo ${i + 1}`}
              >
                <img src={p} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
        <div className="text-[11px] text-white/40 flex items-center gap-3">
          <span>Scroll to zoom</span>
          <span>•</span>
          <span>Double-click to toggle zoom</span>
          <span>•</span>
          <span>Drag to pan when zoomed</span>
          <span>•</span>
          <span>Arrow keys to navigate</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Slideshow Component ─────────────────────────────────────── */
function PhotoSlideshow({ photos, name, tuskerId, current, prev, next, setCurrent }) {
  const [showLightbox, setShowLightbox] = useState(false);
  const currentPhoto = photos && photos[current];
  const [isPortrait, setIsPortrait] = useState(() => {
    const cached = getCachedAspect(currentPhoto);
    return cached !== null ? cached : false;
  });
  const imgRef = useRef(null);

  useEffect(() => {
    if (!currentPhoto) {
      setIsPortrait(false);
      return;
    }

    const cached = getCachedAspect(currentPhoto);
    if (cached !== null) {
      setIsPortrait(cached);
      return;
    }

    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0 && imgRef.current.naturalHeight > 0) {
      const portrait = imgRef.current.naturalHeight > imgRef.current.naturalWidth;
      setCachedAspect(currentPhoto, portrait);
      setIsPortrait(portrait);
      return;
    }

    probeImageAspect(currentPhoto, (portrait) => {
      setIsPortrait(portrait);
    });
  }, [currentPhoto]);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      const portrait = naturalHeight > naturalWidth;
      setCachedAspect(currentPhoto, portrait);
      setIsPortrait(portrait);
    }
  };

  return (
    <div className="flex flex-col gap-4 min-[820px]:sticky min-[820px]:top-[calc(80px+1.5rem)]">
      <div
        onClick={() => {
          if (currentPhoto) setShowLightbox(true);
        }}
        className={`group relative w-full rounded-[14px] overflow-hidden flex items-center justify-center transition-all duration-300 shadow-sm cursor-zoom-in ${!currentPhoto
          ? 'aspect-[4/3] bg-[#e8e8e8]'
          : isPortrait
            ? 'aspect-[3/4] bg-[#e8e8e8]'
            : 'aspect-[4/3] bg-[#e8e8e8]'
          }`}
      >
        {currentPhoto ? (
          <img
            ref={(el) => {
              imgRef.current = el;
              if (el && el.complete && el.naturalWidth > 0 && el.naturalHeight > 0) {
                const portrait = el.naturalHeight > el.naturalWidth;
                setCachedAspect(currentPhoto, portrait);
                setIsPortrait((prev) => (prev !== portrait ? portrait : prev));
              }
            }}
            src={currentPhoto}
            alt={`${name} photo ${current + 1}`}
            onLoad={handleImageLoad}
            className="w-full h-full object-cover object-center rounded-[14px] transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 p-8">
            <span className="font-sans text-[1.4rem] font-bold text-[#bbbbbb]">{name}</span>
            <span className="font-sans text-[0.82rem] text-[#cccccc]">Photo {current + 1}</span>
          </div>
        )}

        {/* Top-Right Expand Button */}
        {currentPhoto && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowLightbox(true);
            }}
            title="Click to view full photo & zoom"
            className="absolute top-3 right-3 bg-black/60 hover:bg-black/85 text-white/90 hover:text-white px-2.5 py-1.5 rounded-lg backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity z-[3] border border-white/20 flex items-center gap-1.5 text-xs font-sans shadow-md cursor-pointer"
          >
            <Maximize2 size={13} />
            <span className="text-[11px] font-medium">Full View</span>
          </button>
        )}

        {photos && photos.length > 1 && (
          <>
            <button
              className="absolute top-1/2 -translate-y-1/2 bg-white/85 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer text-[#333333] shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:bg-white hover:-translate-y-1/2 hover:scale-108 transition-all z-[2] left-3"
              onClick={(e) => {
                e.stopPropagation();
                prev(photos.length);
              }}
              aria-label="Previous photo"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              className="absolute top-1/2 -translate-y-1/2 bg-white/85 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer text-[#333333] shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:bg-white hover:-translate-y-1/2 hover:scale-108 transition-all z-[2] right-3"
              onClick={(e) => {
                e.stopPropagation();
                next(photos.length);
              }}
              aria-label="Next photo"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {photos && photos.length > 0 && (
          <span className="absolute bottom-3 right-3.5 bg-black/55 text-white font-sans text-[0.75rem] font-semibold px-2.5 py-0.5 rounded-full z-[2] backdrop-blur-xs">
            {current + 1} / {photos.length}
          </span>
        )}
      </div>

      {/* Dot navigation */}
      {photos && photos.length > 1 && (
        <div className="flex justify-center gap-2">
          {photos.map((_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full bg-[#dddddd] transition-all hover:bg-[#bbbbbb] p-0 border-none outline-none cursor-pointer ${i === current ? 'bg-accent! scale-130' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Fullscreen Zoom Lightbox Modal */}
      {showLightbox && (
        <TuskerPhotoZoomLightbox
          photos={photos}
          name={name}
          tuskerId={tuskerId}
          initialIndex={current}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </div>
  );
}

/* ── Detail Row ──────────────────────────────────────────────── */
function DetailRow({ icon, label, value }) {
  if (!value || value === 'Not Applicable' || value === 'N/A' || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  return (
    <div className="flex items-start gap-3.5">
      <div className="w-[34px] h-[34px] rounded-[8px] bg-[#faf5ec] flex items-center justify-center text-accent shrink-0 mt-0.5">{icon}</div>
      <div className="flex flex-col gap-0.5">
        <span className="font-sans text-[0.75rem] font-semibold text-[#aaaaaa] uppercase tracking-[0.6px]">{label}</span>
        <span className="font-sans text-[0.92rem] font-medium text-[#222222] leading-6">{value}</span>
      </div>
    </div>
  );
}

/** "2026-05-01" → "May 2026" (last-seen dates are month precision). */
function formatMonth(dateStr) {
  if (!dateStr) return '';
  const [y, m] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const idx = parseInt(m, 10) - 1;
  return idx >= 0 && idx < 12 ? `${months[idx]} ${y}` : dateStr;
}

const THREAT_STYLES = {
  Low: 'bg-[#e8f5ec] text-[#1f7a3d]',
  Medium: 'bg-[#fff6e5] text-[#9a6200]',
  High: 'bg-[#fdecea] text-[#c0392b]',
  Critical: 'bg-[#c0392b] text-white',
  Highest: 'bg-[#c0392b] text-white',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    // If entered as Jan 1 (standard database default when only year is documented):
    if (parts[1] === '01' && parts[2] === '01') {
      return year;
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${day} ${months[monthIndex]} ${year}`;
    }
  }
  return dateStr;
}

/* ── Main Profile Page ───────────────────────────────────────── */
export default function TuskerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    tusker,
    setTusker,
    reloadTusker,
    loading,
    comparisonList,
    earComparisonList,
    isAdmin,
    canAddSighting,
    currentPhotoIndex,
    setCurrentPhotoIndex,
    prevPhoto,
    nextPhoto,
  } = useTuskerProfile(id);

  const [showRiskModal, setShowRiskModal] = useState(false);
  const [selectedComparisonImg, setSelectedComparisonImg] = useState(null);
  const [previewModalPhoto, setPreviewModalPhoto] = useState(null);

  // Sighting Edit & Delete State
  const [activeMenu, setActiveMenu] = useState(null); // { id, sighting, sightingNum, rowNum, top, right }
  const [editingSighting, setEditingSighting] = useState(null); // { sighting, sightingNum, rowNum }
  const [deletingSighting, setDeletingSighting] = useState(null); // { sighting, sightingNum, rowNum }
  const [isDeleting, setIsDeleting] = useState(false);

  // Close active dropdown menu on outside click or window scroll
  useEffect(() => {
    if (!activeMenu) return;
    const handleClick = () => setActiveMenu(null);
    const handleScroll = () => setActiveMenu(null);
    window.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [activeMenu]);

  const handleSaveEditedSighting = async (sightingId, updatedPayload) => {
    await updateSighting(sightingId, updatedPayload);
    if (reloadTusker) {
      await reloadTusker();
    } else if (setTusker) {
      setTusker((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sightings: (prev.sightings || []).map((s) =>
            s.id === sightingId ? { ...s, ...updatedPayload } : s
          ),
        };
      });
    }
  };

  const handleConfirmDeleteSighting = async () => {
    if (!deletingSighting?.sighting?.id) return;
    try {
      setIsDeleting(true);
      await deleteSighting(deletingSighting.sighting.id);
      if (reloadTusker) {
        await reloadTusker();
      } else if (setTusker) {
        setTusker((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            sightings: (prev.sightings || []).filter(
              (s) => s.id !== deletingSighting.sighting.id
            ),
          };
        });
      }
      setDeletingSighting(null);
    } catch (err) {
      alert(`Failed to delete sighting: ${err.message || err}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const adminTableContainerRef = useRef(null);
  const adminTheadRef = useRef(null);
  const adminFirstRowRef = useRef(null);
  const [adminTableHeight, setAdminTableHeight] = useState(null);

  useLayoutEffect(() => {
    if (!isAdmin) return;

    const getRowBottomInTable = (rowEl, theadEl) => {
      if (!rowEl) return 0;
      const theadHeight = theadEl ? theadEl.offsetHeight : 0;
      const rowHeight = rowEl.offsetHeight;
      const rowOffsetTop = rowEl.offsetTop;

      if (rowOffsetTop >= theadHeight) {
        return rowOffsetTop + rowHeight;
      }
      const tbodyOffsetTop = rowEl.parentElement ? rowEl.parentElement.offsetTop : 0;
      if (tbodyOffsetTop > 0) {
        return tbodyOffsetTop + rowOffsetTop + rowHeight;
      }
      return theadHeight + rowHeight;
    };

    const updateTableHeight = () => {
      const container = adminTableContainerRef.current;
      const theadEl = adminTheadRef.current;
      const rowEl = adminFirstRowRef.current;
      if (!container || !theadEl || !rowEl) return;

      let contentHeight = 0;
      if (container.scrollTop === 0) {
        const theadRect = theadEl.getBoundingClientRect();
        const rowRect = rowEl.getBoundingClientRect();
        if (theadRect.height > 0 && rowRect.height > 0) {
          contentHeight = Math.floor(rowRect.bottom - theadRect.top);
        }
      }
      if (!contentHeight || contentHeight <= 0) {
        contentHeight = getRowBottomInTable(rowEl, theadEl);
      }

      if (contentHeight > 0) {
        const style = window.getComputedStyle(container);
        const borderTop = parseFloat(style.borderTopWidth) || 1;
        const borderBottom = parseFloat(style.borderBottomWidth) || 1;

        // Extra allowance if a horizontal scrollbar is present on narrow screens
        const hScrollbarHeight = container.offsetHeight > 0
          ? Math.max(0, container.offsetHeight - container.clientHeight - (borderTop + borderBottom))
          : 0;

        const targetHeight = contentHeight + borderTop + borderBottom + hScrollbarHeight;
        setAdminTableHeight((prev) => (prev === targetHeight ? prev : targetHeight));
      }
    };

    updateTableHeight();

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        updateTableHeight();
      });
      if (adminTheadRef.current) ro.observe(adminTheadRef.current);
      if (adminFirstRowRef.current) ro.observe(adminFirstRowRef.current);
    }

    window.addEventListener('resize', updateTableHeight);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateTableHeight);
    };
  }, [isAdmin, tusker]);

  useEffect(() => {
    if (tusker) {
      document.title = `Wild Tuskers Sri Lanka | ${tusker.name}`;
    }
  }, [tusker]);

  // Combine baseline tusker photos with subsequent sighting photos at the end
  const allProfilePhotos = useMemo(() => {
    const basePhotos = Array.isArray(tusker?.photos)
      ? [...tusker.photos]
      : (tusker?.photo ? [tusker.photo] : []);
    const sightingPhotos = [];
    (tusker?.sightings || []).forEach((s) => {
      const urls = Array.isArray(s.imageUrl)
        ? s.imageUrl
        : (typeof s.imageUrl === 'string' && s.imageUrl.trim() ? s.imageUrl.split(',').map((u) => u.trim()) : []);
      urls.forEach((url) => {
        if (url && typeof url === 'string' && url.length > 0 && !basePhotos.includes(url) && !sightingPhotos.includes(url)) {
          sightingPhotos.push(url);
        }
      });
    });
    return [...basePhotos, ...sightingPhotos];
  }, [tusker?.photos, tusker?.photo, tusker?.sightings]);

  useEffect(() => {
    if (selectedComparisonImg || showRiskModal || previewModalPhoto) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow === 'hidden' ? '' : (prevOverflow || '');
      };
    }
  }, [selectedComparisonImg, showRiskModal, previewModalPhoto]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center font-sans text-[#888888] pt-[80px]">
        Loading tusker profile…
      </div>
    );
  }

  if (!tusker) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 font-sans text-[#888888] pt-[80px]">
        <h2>Tusker not found</h2>
        <button
          className="inline-flex items-center gap-1.5 font-sans text-[0.88rem] font-medium text-[#888888] bg-none border-none cursor-pointer p-0 mb-8 transition-colors hover:text-accent"
          onClick={() => navigate('/tuskers')}
        >
          <ArrowLeft size={16} /> Back to list
        </button>
      </div>
    );
  }

  const isDeceased = tusker.livingStatus === 'Deceased';
  const hasRecordedBy = Boolean(tusker.recordedBy && tusker.recordedBy !== 'Not Applicable' && tusker.recordedBy.trim());
  const hasNicknameBy = Boolean(tusker.nicknameGivenBy && tusker.nicknameGivenBy !== 'Not Applicable' && tusker.nicknameGivenBy.trim());
  const isRecordedAndNamedSame = hasRecordedBy && hasNicknameBy && (
    tusker.recordedBy.trim().toLowerCase() === tusker.nicknameGivenBy.trim().toLowerCase()
  );

  return (
    <div className="w-full min-h-screen bg-white pt-[calc(80px+2rem)] pb-20">
      <div className="w-full max-w-[1100px] mx-auto px-8">

        {/* Back and Edit Bar */}
        <div className="flex justify-between items-center mb-8">
          <button
            className="inline-flex items-center gap-1.5 font-sans text-[0.88rem] font-medium text-[#888888] bg-none border-none cursor-pointer p-0 transition-colors hover:text-accent"
            onClick={() => navigate('/tuskers')}
          >
            <ArrowLeft size={16} /> Back to List
          </button>
          <div className="flex items-center gap-3">
            {canAddSighting && (
              <button
                className="bg-accent text-primary font-sans text-[0.88rem] font-semibold rounded-[8px] px-5 py-2.5 shadow-[0_4px_10px_rgba(11,37,24,0.12)] hover:-translate-y-[0.5px] hover:bg-accent-hover transition-all cursor-pointer border-none"
                onClick={() => navigate(`/tuskers/${tusker.id.toLowerCase()}/add-sighting`)}
              >
                Add Sighting/Photo
              </button>
            )}
            {isAdmin && (
              <button
                className="bg-primary text-white font-sans text-[0.88rem] font-semibold rounded-[8px] px-5 py-2.5 shadow-[0_4px_10px_rgba(11,37,24,0.12)] hover:-translate-y-[0.5px] hover:bg-primary-light hover:shadow-[0_6px_15px_rgba(11,37,24,0.22)] transition-all cursor-pointer border-none"
                onClick={() => navigate(`/admin/edit-tusker/${tusker.id.toLowerCase()}`)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 min-[820px]:grid-cols-2 gap-8 min-[820px]:gap-14 items-start">

          {/* LEFT - Slideshow */}
          <div>
            <PhotoSlideshow
              photos={allProfilePhotos}
              name={tusker.name}
              tuskerId={tusker.id}
              current={currentPhotoIndex}
              prev={prevPhoto}
              next={nextPhoto}
              setCurrent={setCurrentPhotoIndex}
            />
          </div>

          {/* RIGHT - Info */}
          <div className="flex flex-col gap-5">

            {/* Name block */}
            <div>
              <h1 className="font-sans text-[1.9rem] min-[820px]:text-[2.4rem] font-extrabold text-[#111111] leading-tight m-0">
                {tusker.id ? `${tusker.id} - ` : ''}{tusker.name}
                {tusker.sinhala && (
                  <span className="font-sans text-[1.25rem] min-[820px]:text-[1.5rem] font-normal text-[#666666] ml-2.5">
                    ({tusker.sinhala})
                  </span>
                )}
              </h1>
              <StatusBadge
                status={tusker.livingStatus}
                deathYear={tusker.deathYear}
                className="mt-3 text-[0.8rem] px-3 py-1"
              />
            </div>

            {/* Description */}
            {tusker.description && (
              <p className="font-sans text-[0.95rem] leading-[1.75] text-[#444444] m-0 whitespace-pre-line">{tusker.description}</p>
            )}

            <div className="h-px bg-[#f0f0f0]" />

            {/* Detail rows */}
            <div className="flex flex-col gap-4">
              {tusker.location && tusker.location !== 'Not Applicable' && (
                <DetailRow
                  icon={<MapPin size={16} />}
                  label="Location"
                  value={tusker.location}
                />
              )}
              {isRecordedAndNamedSame && (
                <DetailRow
                  icon={<UserCheck size={16} />}
                  label="First Recorded and Named By"
                  value={tusker.recordedBy}
                />
              )}
              {!isRecordedAndNamedSame && hasRecordedBy && (
                <DetailRow
                  icon={<User size={16} />}
                  label="First Recorded By"
                  value={tusker.recordedBy}
                />
              )}
              {!isRecordedAndNamedSame && hasNicknameBy && (
                <DetailRow
                  icon={<UserCheck size={16} />}
                  label="Nickname Suggested By"
                  value={tusker.nicknameGivenBy}
                />
              )}
              {tusker.listedDate && tusker.listedDate !== 'Not Applicable' && formatDate(tusker.listedDate) && (
                <DetailRow
                  icon={<Calendar size={16} />}
                  label={/^\d{4}$/.test(formatDate(tusker.listedDate)) ? "First Recorded Year" : "First Recorded Date"}
                  value={formatDate(tusker.listedDate)}
                />
              )}
              {/* Special Marks (hide if Not Applicable and no wounds) */}
              {((tusker.specialMarks && tusker.specialMarks !== 'Not Applicable' && tusker.specialMarks !== 'None') || ((tusker.specialWounds && tusker.specialWounds !== 'None recorded.') || tusker.wounds)) && (
                <DetailRow
                  icon={<Tag size={16} />}
                  label="Special Marks"
                  value={
                    <div className="flex flex-col gap-1">
                      {tusker.specialMarks && tusker.specialMarks !== 'Not Applicable' && tusker.specialMarks !== 'None' && (
                        <span>{tusker.specialMarks}</span>
                      )}
                      {((tusker.specialWounds && tusker.specialWounds !== 'None recorded.') || tusker.wounds) && (
                        <span className="text-[0.88rem] text-[#555555]">
                          <strong className="text-[#222222] font-semibold">Wounds: </strong>
                          {tusker.specialWounds || tusker.wounds}
                        </span>
                      )}
                    </div>
                  }
                />
              )}

              {/* Death Details (Prominently displayed for deceased tuskers) */}
              {isDeceased && (
                <DetailRow
                  icon={<Skull size={16} className="text-red-500" />}
                  label="Death Details"
                  value={
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-red-700">
                        {[tusker.deathYear ? `Year: ${tusker.deathYear}` : null, tusker.deathReason ? `Cause: ${tusker.deathReason}` : null].filter(Boolean).join(' · ') || 'Details not recorded'}
                      </span>
                    </div>
                  }
                />
              )}

              {/* Risk Score (Only for living / actively monitored tuskers with an actual recorded score) */}
              {!isDeceased && tusker.riskScore && tusker.riskScore !== 'Not Applicable' && tusker.riskScore !== 'None' && (
                <DetailRow
                  icon={<ShieldAlert size={16} />}
                  label="Risk Score"
                  value={
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-sans text-[0.92rem] font-bold text-[#111111]">
                        {tusker.riskScore}
                      </span>
                      {(tusker.riskLink || tusker.riskScore) && (
                        <a
                          href={tusker.riskLink && tusker.riskLink.startsWith('http') ? tusker.riskLink : '#risk-assessment'}
                          target={tusker.riskLink?.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            if (!tusker.riskLink || tusker.riskLink === '#' || tusker.riskLink === '#risk-assessment') {
                              e.preventDefault();
                              setShowRiskModal(true);
                            }
                          }}
                          className="inline-flex items-center gap-1 font-sans text-[0.82rem] font-semibold text-accent hover:text-accent-hover hover:underline transition-colors cursor-pointer"
                        >
                          View Risk Assessment <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  }
                />
              )}

              {/* Proximate Birth Year */}
              {(tusker.proximateBirthYear || tusker.birthYear) && (
                <DetailRow
                  icon={<Calendar size={16} />}
                  label="Proximate Birth Year"
                  value={String(tusker.proximateBirthYear || tusker.birthYear)}
                />
              )}

              {/* Calculated Estimated Age (Derived dynamically from Proximate Birth Year, or fallback to ageRange) */}
              {calculateTuskerAge(tusker) && (
                <DetailRow
                  icon={<Hourglass size={16} />}
                  label={isDeceased ? "Estimated Age (at death)" : "Estimated Age"}
                  value={calculateTuskerAge(tusker)}
                />
              )}

              {/* Health Condition (Hidden for deceased tuskers) */}
              {!isDeceased && tusker.healthCondition && (
                <DetailRow
                  icon={<HeartPulse size={16} />}
                  label="Health Condition"
                  value={tusker.healthCondition}
                />
              )}

              {/* Life Threat Level (Hidden for deceased tuskers) */}
              {!isDeceased && tusker.threatLevel && (
                <DetailRow
                  icon={<ShieldAlert size={16} />}
                  label="Life Threat Level"
                  value={
                    <span className={`inline-block font-sans text-[0.82rem] font-bold rounded-full px-3 py-0.5 ${THREAT_STYLES[tusker.threatLevel] || ''}`}>
                      {tusker.threatLevel}
                    </span>
                  }
                />
              )}

              {tusker.lastSeenArea && (
                <DetailRow
                  icon={<Eye size={16} />}
                  label={isDeceased ? "Last Documented Area" : "Last Seen"}
                  value={[tusker.lastSeenArea, formatMonth(tusker.lastSeen)].filter(Boolean).join(' · ')}
                />
              )}
              {(tusker.zone || tusker.district || tusker.province) && (
                <DetailRow
                  icon={<MapIcon size={16} />}
                  label="Region"
                  value={[tusker.zone, tusker.district, tusker.province].filter(v => v && v !== 'Not Applicable' && v !== 'N/A').join(' · ')}
                />
              )}
              {tusker.remarks && (
                <DetailRow
                  icon={<StickyNote size={16} />}
                  label="Remarks"
                  value={tusker.remarks}
                />
              )}
            </div>
          </div>
        </div>

        {/* PHOTOGRAPHIC COMPARISON (3x1 Horizontal Collage) */}
        {comparisonList && comparisonList.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#eeeeee]">
            <div className="mb-8">
              <h2 className="font-sans text-[1.6rem] font-bold text-[#111111] m-0">
                Photographic Comparison
              </h2>
              <p className="font-sans text-[0.9rem] text-[#666666] mt-1.5 mb-0 max-w-[760px] leading-relaxed">
                Sequential photo comparison tracking baseline identification against observations over 3-5 year intervals to monitor tusk growth, breakages, ear tears, and distinct physical changes.
              </p>
            </div>

            {/* 3x1 Collage in One Horizontal Row - All 3 boxes identical */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {comparisonList.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#fcfdfd] border border-[#e5e7eb] rounded-[16px] overflow-hidden flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                >
                  {/* Top Stage & Year Header */}
                  <div className="px-4 py-3 bg-white border-b border-[#f0f0f0] flex items-center justify-between">
                    <span className="font-sans text-[0.82rem] font-bold text-[#555555]">
                      {item.stage || `Stage ${index + 1}`}
                    </span>
                    <span className="text-[#111111] font-sans text-[0.84rem] font-extrabold flex items-center gap-1.5">
                      <Calendar size={13} />
                      <span>{item.year}</span>
                    </span>
                  </div>

                  {/* Photo Card */}
                  <div
                    onClick={() => item.photo && setSelectedComparisonImg(item)}
                    className={`relative w-full aspect-[4/3] bg-[#eef1ee] overflow-hidden flex items-center justify-center ${item.photo ? 'cursor-pointer group' : ''
                      }`}
                  >
                    {item.photo ? (
                      <>
                        <img
                          src={item.photo}
                          alt={`${tusker.name} ${item.year}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 font-sans text-xs font-semibold">
                          <Maximize2 size={16} />
                          <span>Click to Enlarge</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#f8faf9] to-[#edf3ef]">
                        <div className="w-12 h-12 rounded-full bg-[#0b2518]/10 text-[#0b2518] flex items-center justify-center mb-2">
                          <Camera size={22} className="opacity-70" />
                        </div>
                        <span className="font-sans text-xs font-bold text-[#2d4036] uppercase tracking-wider mb-1">
                          {tusker.id} • {item.year}
                        </span>
                        <span className="font-sans text-[0.78rem] text-[#6b7c73] max-w-[200px] leading-tight">
                          {item.stage} Photo
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Sentence Below the Photo */}
                  <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                    <p className="font-sans text-[0.88rem] text-[#2c3330] leading-[1.65] m-0 font-medium">
                      {item.changeSentence}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EAR BIOMETRIC COMPARISON (2 Boxes) */}
        {earComparisonList && earComparisonList.length > 0 && (
          <div className="mt-14 pt-10 border-t border-[#eeeeee]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-3">
              <div>
                <h2 className="font-sans text-[1.6rem] font-bold text-[#111111] m-0 flex items-center gap-2">
                  <span>Ear Biometric & Venation Comparison</span>
                </h2>
                <p className="font-sans text-[0.9rem] text-[#666666] mt-1.5 mb-0 max-w-[780px] leading-relaxed">
                  Identification panel comparing pinna edge contours, tears, V-notches, and vascular branching across monitoring intervals.
                </p>
              </div>
            </div>

            {/* 2-Column Horizontal Collage of Ears */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {earComparisonList.slice(0, 2).map((item, index) => (
                <div
                  key={index}
                  className="bg-white border border-[#e0e5e2] rounded-[16px] overflow-hidden flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                >
                  {/* Top Stage & Year Header */}
                  <div className="px-4 py-3 bg-[#fafbf9] border-b border-[#eeeeee] flex items-center justify-between">
                    <span className="font-sans text-[0.82rem] font-bold text-[#44554c]">
                      {item.stage || `Stage ${index + 1}`}
                    </span>
                    <span className="text-[#111111] font-sans text-[0.84rem] font-extrabold flex items-center gap-1.5">
                      <Calendar size={13} />
                      <span>{item.year}</span>
                    </span>
                  </div>

                  {/* Ear Photo Card */}
                  <div
                    onClick={() => item.photo && setSelectedComparisonImg({ ...item, isEar: true })}
                    className={`relative w-full aspect-[4/3] bg-[#eef3f0] overflow-hidden flex items-center justify-center ${item.photo ? 'cursor-pointer group' : ''
                      }`}
                  >
                    {item.photo ? (
                      <>
                        <img
                          src={item.photo}
                          alt={`${tusker.name} Ear ${item.year}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 font-sans text-xs font-semibold">
                          <Maximize2 size={16} />
                          <span>View Ear Crop</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#f8faf8] to-[#edf4ef]">
                        <div className="w-12 h-12 rounded-full bg-[#0b2518]/10 text-[#0b2518] flex items-center justify-center mb-2">
                          <Camera size={22} className="opacity-70" />
                        </div>
                        <span className="font-sans text-xs font-bold text-[#1f3327] uppercase tracking-wider mb-1">
                          {tusker.id} : Ear Biometrics
                        </span>
                        <span className="font-sans text-[0.78rem] text-[#55695d] max-w-[200px] leading-tight">
                          {item.stage} Record
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Sentence Below the Photo */}
                  <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                    <p className="font-sans text-[0.88rem] text-[#2c3330] leading-[1.65] m-0 font-medium">
                      {item.changeSentence}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ADMIN ONLY: Sightings & Observation Records History Table ── */}
        {isAdmin && (
          <div className="mt-16 pt-10 border-t border-[#e2e8e0]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.72rem] font-bold bg-[#0b2518] text-[#c69b55] uppercase tracking-wider">
                    <Lock size={12} /> Admin Only View
                  </span>
                  <span className="font-sans text-xs font-semibold text-[#888888]">
                    {(tusker.sightings?.length || 0) + 1} Total Records
                  </span>
                  {(tusker.sightings?.length || 0) > 1 && (
                    <span className="font-sans text-[0.72rem] text-accent font-semibold bg-accent/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      ↕ Scroll table to view all records
                    </span>
                  )}
                </div>
                <h2 className="font-sans text-[1.45rem] font-bold text-[#111111] m-0">
                  Sightings &amp; Observation Records History
                </h2>
                <p className="font-sans text-[0.82rem] text-[#666666] m-0 mt-1 max-w-2xl">
                  Chronological registry of every recorded observation. Row 1 permanently preserves the original baseline registration data, followed by all subsequent logged field sightings.
                </p>
              </div>

              <button
                onClick={() => navigate(`/tuskers/${tusker.id.toLowerCase()}/add-sighting`)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-accent hover:bg-accent-hover text-primary font-sans text-[0.85rem] font-bold transition-all shadow-sm hover:shadow shrink-0 cursor-pointer border-none"
              >
                <Plus size={16} />
                <span>Add Sighting Record</span>
              </button>
            </div>

            {/* Table Container - Dynamic height matching Header + Row 1, scrollable vertically for subsequent rows */}
            <div
              ref={adminTableContainerRef}
              style={adminTableHeight ? { height: `${adminTableHeight}px` } : { maxHeight: '135px' }}
              className="w-full overflow-auto bg-white border border-[#e5e7eb] rounded-[14px] shadow-sm"
            >
              <table className="w-full text-left border-collapse min-w-[1020px]">
                <thead
                  ref={adminTheadRef}
                  className="sticky top-0 z-10 bg-[#f8f9fa] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                >
                  <tr className="border-b border-[#e5e7eb] text-[0.74rem] uppercase font-bold tracking-[0.6px] text-[#555555]">
                    <th className="py-3.5 px-4 w-[130px] bg-[#f8f9fa]">Record #</th>
                    <th className="py-3.5 px-4 w-[115px] bg-[#f8f9fa]">Date / Year</th>
                    <th className="py-3.5 px-4 w-[170px] bg-[#f8f9fa]">Observer / Recorder</th>
                    <th className="py-3.5 px-4 w-[160px] bg-[#f8f9fa]">Location / Area</th>
                    <th className="py-3.5 px-4 w-[120px] bg-[#f8f9fa]">Health</th>
                    <th className="py-3.5 px-4 w-[110px] bg-[#f8f9fa]">Life Threat</th>
                    <th className="py-3.5 px-4 w-[190px] bg-[#f8f9fa]">Special Marks &amp; Wounds</th>
                    <th className="py-3.5 px-4 w-[90px] text-center bg-[#f8f9fa]">Photo</th>
                    <th className="py-3.5 px-4 w-[65px] text-center bg-[#f8f9fa]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf0f2] font-sans text-[0.84rem] text-[#222222]">
                  {/* Row 1: Baseline Registration (Permanently Preserved) */}
                  <tr
                    ref={adminFirstRowRef}
                    className="bg-[#fafaf6] hover:bg-[#f4f5ee] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.72rem] font-bold bg-[#0b2518] text-[#c69b55] w-fit">
                          <Shield size={11} /> Row 1
                        </span>
                        <span className="text-[0.72rem] font-bold text-[#0b2518] uppercase tracking-wide">
                          1st Record
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#111111]">
                      {formatDate(tusker.listedDate) || tusker.listedDate || 'Initial'}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#111111] flex items-center gap-1.5">
                        <User size={13} className="text-accent shrink-0" />
                        <span>{tusker.recordedBy || 'WTS Admin'}</span>
                      </div>
                      {tusker.nicknameGivenBy && tusker.nicknameGivenBy !== tusker.recordedBy && (
                        <div className="text-[0.72rem] text-[#777777] mt-0.5">
                          Named by: {tusker.nicknameGivenBy}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[#333333]">
                      <div className="flex items-center gap-1">
                        <MapPin size={13} className="text-accent shrink-0" />
                        <span>{tusker.location || '—'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.74rem] font-semibold bg-[#e8f5ec] text-[#1f7a3d]">
                        <HeartPulse size={11} /> {tusker.healthCondition || 'Good'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {tusker.threatLevel ? (
                        <span className={`inline-block px-2 py-0.5 rounded text-[0.72rem] font-bold ${THREAT_STYLES[tusker.threatLevel] || 'bg-gray-100 text-gray-700'}`}>
                          {tusker.threatLevel}
                        </span>
                      ) : (
                        <span className="text-[#999999]">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div
                        className="line-clamp-2 max-w-[220px] text-[#444444] text-[0.8rem]"
                        title={[tusker.specialMarks, tusker.specialWounds].filter(m => m && m !== 'Not Applicable' && m !== 'None').join('; ')}
                      >
                        {[tusker.specialMarks, tusker.specialWounds].filter(m => m && m !== 'Not Applicable' && m !== 'None' && m !== 'None recorded.').join('; ') || 'None recorded'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {tusker.photos?.[0] ? (
                        <button
                          type="button"
                          onClick={() => setPreviewModalPhoto({
                            url: tusker.photos[0],
                            title: `${tusker.name} (${tusker.id}) - Baseline Registration Photo`,
                            date: formatDate(tusker.listedDate) || tusker.listedDate || 'Initial Registry',
                            author: tusker.recordedBy || 'WTS Admin',
                            location: tusker.location || '',
                            healthCondition: tusker.healthCondition || 'Good',
                            threatLevel: tusker.threatLevel || '',
                            note: tusker.remarks || tusker.description || 'Baseline registration photograph'
                          })}
                          className="group relative w-12 h-12 rounded-[8px] overflow-hidden border border-[#d5d5d5] bg-black/5 mx-auto block cursor-pointer transition-transform hover:scale-105 p-0"
                          title="Click to view full image"
                        >
                          <img src={tusker.photos[0]} alt="Baseline" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye size={14} />
                          </div>
                        </button>
                      ) : (
                        <span className="text-[#aaaaaa] text-xs">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center text-[#aaaaaa] text-xs select-none" title="Permanent baseline documentation">
                      —
                    </td>
                  </tr>

                  {/* Subsequent Sighting Rows (Row 2, Row 3...) */}
                  {(tusker.sightings || []).map((sighting, idx) => {
                    const details = parseSightingDetails(sighting);
                    const rowNum = idx + 2;
                    const sightingNum = idx + 1;
                    const noteDisplay = details.note || (!sighting.note?.trim().startsWith('{') ? sighting.note : '') || details.remarks || '—';

                    return (
                      <tr key={sighting.id || idx} className="hover:bg-[#f9fafb] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.72rem] font-bold bg-[#faf5ec] text-accent border border-accent/25 w-fit">
                              <Camera size={11} /> Row {rowNum}
                            </span>
                            <span className="text-[0.72rem] font-semibold text-[#666666]">
                              Sighting #{sightingNum}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-[#111111]">
                          {formatDate(sighting.captureDate) || sighting.captureDate || '—'}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#111111] flex items-center gap-1.5">
                            <UserCheck size={13} className="text-accent shrink-0" />
                            <span>{sighting.author || 'WTS Admin'}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#333333]">
                          {details.location ? (
                            <div className="flex items-center gap-1">
                              <MapPin size={13} className="text-accent shrink-0" />
                              <span>{details.location}</span>
                            </div>
                          ) : (
                            <span className="text-[#999999]">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {details.healthCondition ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.74rem] font-semibold bg-[#e8f5ec] text-[#1f7a3d]">
                              <HeartPulse size={11} /> {details.healthCondition}
                            </span>
                          ) : (
                            <span className="text-[#999999]">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {details.threatLevel ? (
                            <span className={`inline-block px-2 py-0.5 rounded text-[0.72rem] font-bold ${THREAT_STYLES[details.threatLevel] || 'bg-gray-100 text-gray-700'}`}>
                              {details.threatLevel}
                            </span>
                          ) : (
                            <span className="text-[#999999]">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div
                            className="line-clamp-2 max-w-[220px] text-[#444444] text-[0.8rem]"
                            title={[details.specialMarks, details.specialWounds].filter(Boolean).join('; ')}
                          >
                            {[details.specialMarks, details.specialWounds].filter(Boolean).join('; ') || '—'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {sighting.imageUrl ? (
                            <button
                              type="button"
                              onClick={() => setPreviewModalPhoto({
                                url: sighting.imageUrl,
                                title: `${tusker.name} (${tusker.id}) - Sighting #${sightingNum}`,
                                date: formatDate(sighting.captureDate) || sighting.captureDate || '—',
                                author: sighting.author || 'WTS Admin',
                                location: details.location || '',
                                healthCondition: details.healthCondition || '',
                                threatLevel: details.threatLevel || '',
                                note: noteDisplay !== '—' ? noteDisplay : ''
                              })}
                              className="group relative w-12 h-12 rounded-[8px] overflow-hidden border border-[#d5d5d5] bg-black/5 mx-auto block cursor-pointer transition-transform hover:scale-105 p-0"
                              title="Click to view full image"
                            >
                              <img src={sighting.imageUrl} alt={`Sighting ${sightingNum}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Eye size={14} />
                              </div>
                            </button>
                          ) : (
                            <span className="text-[#aaaaaa] text-xs">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activeMenu?.id === sighting.id) {
                                setActiveMenu(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setActiveMenu({
                                  id: sighting.id,
                                  sighting,
                                  sightingNum,
                                  rowNum,
                                  top: rect.bottom + 4,
                                  right: Math.max(12, window.innerWidth - rect.right),
                                });
                              }
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[#666666] hover:text-[#111111] hover:bg-[#eaeaea] transition-colors mx-auto cursor-pointer border-none bg-transparent"
                            title="Actions"
                            aria-label="Actions"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Empty state when no sightings exist yet */}
                  {(!tusker.sightings || tusker.sightings.length === 0) && (
                    <tr>
                      <td colSpan="9" className="py-6 px-4 text-center text-[#777777] bg-[#fafafa]">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <Camera size={20} className="text-[#aaaaaa]" />
                          <span className="font-medium text-[0.85rem]">No subsequent sightings recorded yet.</span>
                          <span className="text-[0.78rem] text-[#999999]">
                            The baseline registration is currently the sole verified historical record. Use "Add Sighting Record" to log new field observations.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Google Map of Sighting Points (Admin Only View) */}
            <TuskerSightingsMap
              tusker={tusker}
              onPreviewPhoto={setPreviewModalPhoto}
            />
          </div>
        )}
      </div>

      {/* Risk Assessment Modal */}
      {showRiskModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowRiskModal(false)}
        >
          <div
            className="bg-white rounded-[16px] max-w-[500px] w-full p-6 shadow-2xl border border-[#e8e8e8] flex flex-col gap-4 relative my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-[#eeeeee]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#faf5ec] text-accent flex items-center justify-center">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h3 className="font-sans text-[1.1rem] font-bold text-[#111111] m-0">Risk Assessment Report</h3>
                  <p className="font-sans text-[0.78rem] text-[#888888] m-0">{tusker.id} - {tusker.name}</p>
                </div>
              </div>
              <button
                className="w-8 h-8 rounded-full border-none bg-[#f5f5f5] hover:bg-[#e8e8e8] text-[#555555] cursor-pointer flex items-center justify-center transition-colors"
                onClick={() => setShowRiskModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 font-sans text-[0.9rem] text-[#444444]">
              <div className="flex justify-between items-center p-3 rounded-[10px] bg-[#f9faf8] border border-[#eeeeee]">
                <span className="font-medium text-[#666666]">Overall Risk Rating</span>
                <span className="font-bold text-[#111111] text-[1rem]">{tusker.riskScore || 'Not Applicable'}</span>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <p className="m-0 leading-relaxed text-[#555555]">
                  The WTS Risk Score is an index calculated based on:
                </p>
                <ul className="m-0 pl-5 text-[0.85rem] text-[#666666] flex flex-col gap-1.5">
                  <li><strong className="text-[#222222]">Corridor Proximity:</strong> Frequency of movement across human settlements and farming areas in {tusker.location || 'Sri Lanka'}.</li>
                  <li><strong className="text-[#222222]">Physical Vulnerability:</strong> Tusk span attractiveness for illicit poaching and snare frequency.</li>
                  <li><strong className="text-[#222222]">Conflict & Injury History:</strong> {tusker.specialWounds && tusker.specialWounds !== 'None recorded.' ? tusker.specialWounds : 'No previous severe conflict injuries recorded.'}</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                className="bg-primary text-white text-[0.85rem] font-semibold px-5 py-2 rounded-[8px] border-none cursor-pointer hover:bg-primary-light transition-all"
                onClick={() => setShowRiskModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Comparison Image Lightbox Modal */}
      {selectedComparisonImg && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in select-none"
          onClick={() => setSelectedComparisonImg(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col my-auto border border-white/20"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="bg-[#0b2518] text-[#c69b55] font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <Calendar size={12} />
                  {selectedComparisonImg.year}
                </span>
                <span className="font-sans text-sm font-bold text-gray-800">
                  {tusker.name} ({tusker.id}) : {selectedComparisonImg.stage}
                </span>
              </div>
              <button
                onClick={() => setSelectedComparisonImg(null)}
                className="text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center border-none cursor-pointer transition-colors p-0"
                aria-label="Close image preview"
              >
                <X size={20} />
              </button>
            </div>

            <div className="w-full bg-[#0a0f0d] flex items-center justify-center min-h-[260px] max-h-[62vh] overflow-hidden shrink-0">
              <img
                src={selectedComparisonImg.photo}
                alt={`${tusker.name} ${selectedComparisonImg.year}`}
                className="w-full h-full max-h-[62vh] object-contain"
              />
            </div>

            <div className="p-5 bg-gray-50 border-t border-gray-100">
              <p className="font-sans text-sm text-gray-800 leading-relaxed m-0 font-medium">
                {selectedComparisonImg.changeSentence}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Sighting / Observation Photo Lightbox Modal */}
      {previewModalPhoto && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in select-none"
          onClick={() => setPreviewModalPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col my-auto border border-white/20"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="bg-[#0b2518] text-[#c69b55] font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <Calendar size={12} />
                  {previewModalPhoto.date}
                </span>
                <span className="font-sans text-sm font-bold text-gray-800">
                  {previewModalPhoto.title}
                </span>
              </div>
              <button
                onClick={() => setPreviewModalPhoto(null)}
                className="text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center border-none cursor-pointer transition-colors p-0"
                aria-label="Close image preview"
              >
                <X size={20} />
              </button>
            </div>

            <div className="w-full bg-[#0a0f0d] flex items-center justify-center min-h-[260px] max-h-[64vh] overflow-hidden shrink-0">
              <img
                src={previewModalPhoto.url}
                alt={previewModalPhoto.title}
                className="w-full h-full max-h-[64vh] object-contain"
              />
            </div>

            <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
                <span className="font-semibold flex items-center gap-1">
                  <User size={13} className="text-accent" />
                  <span>Recorded / Sighted By: <strong className="text-gray-900">{previewModalPhoto.author}</strong></span>
                </span>
                {previewModalPhoto.location && (
                  <span className="flex items-center gap-1 text-gray-600">
                    <MapPin size={13} className="text-accent" />
                    <span>Location: <strong className="text-gray-900">{previewModalPhoto.location}</strong></span>
                  </span>
                )}
                {previewModalPhoto.healthCondition && (
                  <span className="bg-[#e8f5ec] text-[#1f7a3d] font-semibold px-2 py-0.5 rounded">
                    Health: {previewModalPhoto.healthCondition}
                  </span>
                )}
                {previewModalPhoto.threatLevel && (
                  <span className={`font-bold px-2 py-0.5 rounded ${THREAT_STYLES[previewModalPhoto.threatLevel] || ''}`}>
                    {previewModalPhoto.threatLevel}
                  </span>
                )}
              </div>
              {previewModalPhoto.note && (
                <p className="font-sans text-[0.88rem] text-gray-800 leading-relaxed m-0 font-medium pt-1 border-t border-gray-200/60">
                  {previewModalPhoto.note}
                </p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Three-dots Action Dropdown Menu (via portal to prevent table overflow clipping) */}
      {activeMenu && createPortal(
        <div
          style={{ top: `${activeMenu.top}px`, right: `${activeMenu.right}px` }}
          className="fixed z-[9999] w-40 bg-white border border-[#e5e7eb] rounded-[10px] shadow-xl py-1 flex flex-col font-sans text-[0.82rem] animate-in fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              setEditingSighting({
                sighting: activeMenu.sighting,
                sightingNum: activeMenu.sightingNum,
                rowNum: activeMenu.rowNum,
              });
              setActiveMenu(null);
            }}
            className="flex items-center gap-2.5 px-3.5 py-2 text-[#333333] hover:bg-[#faf5ec] hover:text-accent font-medium w-full text-left transition-colors cursor-pointer border-none bg-transparent"
          >
            <Edit size={14} className="text-accent" />
            <span>Edit Sighting</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setDeletingSighting({
                sighting: activeMenu.sighting,
                sightingNum: activeMenu.sightingNum,
                rowNum: activeMenu.rowNum,
              });
              setActiveMenu(null);
            }}
            className="flex items-center gap-2.5 px-3.5 py-2 text-[#dc2626] hover:bg-[#fdecea] font-medium w-full text-left transition-colors cursor-pointer border-none bg-transparent border-t border-[#f0f0f0]"
          >
            <Trash2 size={14} className="text-[#dc2626]" />
            <span>Delete Sighting</span>
          </button>
        </div>,
        document.body
      )}

      {/* Edit Sighting Modal */}
      {editingSighting && (
        <EditSightingModal
          sighting={editingSighting.sighting}
          tusker={tusker}
          sightingNum={editingSighting.sightingNum}
          rowNum={editingSighting.rowNum}
          onClose={() => setEditingSighting(null)}
          onSave={handleSaveEditedSighting}
        />
      )}

      {/* Delete Sighting Confirmation Modal */}
      {deletingSighting && createPortal(
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => !isDeleting && setDeletingSighting(null)}
        >
          <div
            className="bg-white rounded-[16px] max-w-md w-full shadow-2xl border border-[#e5e7eb] p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-[#dc2626]">
              <div className="w-10 h-10 rounded-full bg-[#fdecea] flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-sans text-[1.1rem] font-bold text-[#111111] m-0">Delete Sighting #{deletingSighting.sightingNum}?</h3>
                <span className="text-xs text-[#777777]">Row {deletingSighting.rowNum} • {formatDate(deletingSighting.sighting?.captureDate) || 'Verified Sighting'}</span>
              </div>
            </div>
            <p className="font-sans text-[0.88rem] text-[#555555] leading-relaxed m-0">
              Are you sure you want to delete this sighting record for <strong>{tusker?.name}</strong>? This will permanently remove this sighting and its coordinates from the profile and sightings map. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingSighting(null)}
                className="px-4 py-2 rounded-[10px] border border-[#d5d5d5] bg-white text-[#444444] font-sans text-xs font-semibold hover:bg-[#f5f5f5] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteSighting}
                className="px-4 py-2 rounded-[10px] bg-[#dc2626] text-white font-sans text-xs font-bold hover:bg-[#b91c1c] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Sighting'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
