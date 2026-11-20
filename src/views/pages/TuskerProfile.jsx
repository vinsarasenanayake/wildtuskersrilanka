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
  Loader2,
  AlertCircle,
  Sliders,
} from 'lucide-react';
import { useTuskerProfile } from '../../controllers/useTusker';
import { calculateTuskerAge, parseSightingDetails, updateSighting, deleteSighting, updateTusker } from '../../models/TuskerModel';
import StatusBadge from '../components/StatusBadge';
import TuskerSightingsMap from '../components/TuskerSightingsMap';
import EditSightingModal from '../components/EditSightingModal';
import ImageUploadBox from '../components/ImageUploadBox';
import LocationSearchInput from '../components/LocationSearchInput';
import { getCachedAspect, setCachedAspect, probeImageAspect } from '../../utils/photoAspectCache';

/* ── Fullscreen Zoom Lightbox ─────────────────────────────────── */
function TuskerPhotoZoomLightbox({ photos, name, tuskerId, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
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
    hasDraggedRef.current = false;
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    if (Math.abs(newX - position.x) > 3 || Math.abs(newY - position.y) > 3) {
      hasDraggedRef.current = true;
    }
    setPosition({
      x: newX,
      y: newY,
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
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                if (scale === 1) {
                  onClose();
                } else {
                  resetZoom();
                }
                return;
              }
              e.stopPropagation();
              if (hasDraggedRef.current) {
                hasDraggedRef.current = false;
                return;
              }
              if (scale === 1) {
                setScale(2.5);
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              toggleZoom(e);
            }}
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

  // Keyboard arrow keys navigation for profile photo slideshow
  useEffect(() => {
    if (!photos || photos.length <= 1) return;

    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || document.activeElement?.isContentEditable) {
        return;
      }
      if (showLightbox) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev(photos.length);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next(photos.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photos, showLightbox, prev, next]);

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

/* ── Baseline Year Calculation Helper ────────────────────────── */
function getTuskerBaselineYear(tusker, comparisons = []) {
  if (Array.isArray(comparisons) && comparisons.length > 0) {
    const compYears = comparisons
      .map((c) => parseInt(c.year, 10))
      .filter((y) => !isNaN(y) && y > 1900);
    if (compYears.length > 0) return Math.min(...compYears);
  }
  if (Array.isArray(tusker?.photographicComparison) && tusker.photographicComparison.length > 0) {
    const pYears = tusker.photographicComparison
      .map((c) => parseInt(c.year, 10))
      .filter((y) => !isNaN(y) && y > 1900);
    if (pYears.length > 0) return Math.min(...pYears);
  }
  if (Array.isArray(tusker?.earComparison) && tusker.earComparison.length > 0) {
    const eYears = tusker.earComparison
      .map((c) => parseInt(c.year, 10))
      .filter((y) => !isNaN(y) && y > 1900);
    if (eYears.length > 0) return Math.min(...eYears);
  }
  if (tusker?.listedDate) {
    const parsed = new Date(tusker.listedDate).getFullYear();
    if (!isNaN(parsed) && parsed > 1900) return parsed;
  }
  if (Array.isArray(tusker?.sightings) && tusker.sightings.length > 0) {
    const sYears = tusker.sightings
      .map((s) => (s.captureDate ? new Date(s.captureDate).getFullYear() : null))
      .filter((y) => !isNaN(y) && y > 1900);
    if (sYears.length > 0) return Math.min(...sYears);
  }
  return 2017;
}

/* ── Admin Comparison Form Modal ────────────────────────────── */
function ComparisonFormModal({
  isOpen,
  type = 'photographic',
  initialData = null,
  isEditing = false,
  tusker,
  onClose,
  onSave,
  isSaving = false,
  error = '',
}) {
  const [activeType, setActiveType] = useState(type);
  const [photo, setPhoto] = useState(initialData?.photo || '');
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear().toString());
  const [stage, setStage] = useState(initialData?.stage || '');
  const [location, setLocation] = useState(initialData?.location || tusker?.lastSeenArea || tusker?.location || '');
  const [changeSentence, setChangeSentence] = useState(initialData?.changeSentence || '');
  const [hasChange, setHasChange] = useState(Boolean(initialData?.hasChange));
  const [changeType, setChangeType] = useState(initialData?.changeType || 'Tusk Growth');
  const [earSide, setEarSide] = useState(initialData?.earSide || 'Right Ear');
  const [formErr, setFormErr] = useState('');

  const calculateAutoStage = useCallback((inputYear, compType) => {
    const parsed = parseInt(inputYear, 10);
    if (isNaN(parsed) || parsed < 1900) return '';
    const baseline = getTuskerBaselineYear(
      tusker,
      compType === 'photographic' ? tusker?.photographicComparison : tusker?.earComparison
    );
    if (!baseline) return compType === 'photographic' ? 'First Recorded Photo' : 'Initial Ear Baseline';
    const diff = parsed - baseline;
    if (diff > 0) {
      return `${diff}-Year Progression`;
    }
    return compType === 'photographic' ? 'First Recorded Photo' : 'Initial Ear Baseline';
  }, [tusker]);

  useEffect(() => {
    if (initialData) {
      setPhoto(initialData.photo || '');
      setYear(initialData.year || new Date().getFullYear().toString());
      setStage(initialData.stage || '');
      setLocation(initialData.location || tusker?.lastSeenArea || tusker?.location || '');
      setChangeSentence(initialData.changeSentence || '');
      setHasChange(Boolean(initialData.hasChange));
      setChangeType(initialData.changeType || 'Tusk Growth');
      setEarSide(initialData.earSide || 'Right Ear');
    } else {
      const defaultYear = new Date().getFullYear().toString();
      const currentType = type || 'photographic';
      setPhoto('');
      setYear(defaultYear);
      setStage(calculateAutoStage(defaultYear, currentType));
      setLocation(tusker?.lastSeenArea || tusker?.location || '');
      setChangeSentence('');
      setHasChange(false);
      setChangeType('Tusk Growth');
      setEarSide('Right Ear');
    }
    setActiveType(type || 'photographic');
    setFormErr('');
  }, [initialData, type, isOpen, tusker, calculateAutoStage]);

  const handleYearChange = (newYear) => {
    setYear(newYear);
    const autoStage = calculateAutoStage(newYear, activeType);
    if (autoStage) {
      setStage(autoStage);
    }
  };

  const handleTypeToggle = (newType) => {
    setActiveType(newType);
    if (!isEditing) {
      const autoStage = calculateAutoStage(year, newType);
      if (autoStage) {
        setStage(autoStage);
      }
    }
  };

  if (!isOpen) return null;

  const photoPresets = [
    'First Recorded Photo',
    'Recent Assessment',
  ];

  const earPresets = [
    'Right Pinna Baseline',
    'Left Pinna Baseline',
    'Ear Margin Progression',
    'Venation & Notch Check',
    'Bilateral Assessment',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormErr('');

    if (!photo) {
      setFormErr('Please upload or select a comparison photo.');
      return;
    }
    if (!year || !year.trim()) {
      setFormErr('Please enter the observation year.');
      return;
    }
    if (!stage || !stage.trim()) {
      setFormErr('Please provide a title or stage name.');
      return;
    }
    if (!changeSentence || !changeSentence.trim()) {
      setFormErr('Please provide a description or morphological note.');
      return;
    }

    const payload = {
      photo,
      year: year.trim(),
      stage: stage.trim(),
      location: location.trim(),
      changeSentence: changeSentence.trim(),
    };

    if (activeType === 'photographic') {
      payload.hasChange = hasChange;
      if (hasChange) {
        payload.changeType = changeType;
      }
    } else {
      payload.earSide = earSide;
    }

    onSave(payload, activeType);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[20px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#e5e7eb] flex flex-col gap-5 relative my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#eeeeee]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#0b2518] text-[#c69b55] flex items-center justify-center shadow-xs">
              <Camera size={20} />
            </div>
            <div>
              <h3 className="font-sans text-[1.2rem] font-bold text-[#111111] m-0">
                {isEditing ? 'Edit' : 'Add'} {activeType === 'photographic' ? 'Photographic Comparison' : 'Ear Biometric Comparison'}
              </h3>
              <p className="font-sans text-[0.8rem] text-[#777777] m-0 mt-0.5">
                {tusker ? `${tusker.name} (${tusker.id})` : 'Tusker'} • Sequential Progression Comparison
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border-none bg-[#f4f4f4] hover:bg-[#e8e8e8] text-[#555555] cursor-pointer flex items-center justify-center transition-colors p-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Type Toggle (when adding new) */}
        {!isEditing && (
          <div className="flex items-center bg-[#f4f5f4] p-1 rounded-[12px] gap-1">
            <button
              type="button"
              onClick={() => handleTypeToggle('photographic')}
              className={`flex-1 py-2 px-3 rounded-[9px] text-[0.82rem] font-semibold transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${
                activeType === 'photographic'
                  ? 'bg-white text-[#0b2518] shadow-xs'
                  : 'bg-transparent text-[#666666] hover:text-[#111111]'
              }`}
            >
              <Camera size={14} className={activeType === 'photographic' ? 'text-accent' : ''} />
              <span>Photographic Progression</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeToggle('ear')}
              className={`flex-1 py-2 px-3 rounded-[9px] text-[0.82rem] font-semibold transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${
                activeType === 'ear'
                  ? 'bg-white text-[#0b2518] shadow-xs'
                  : 'bg-transparent text-[#666666] hover:text-[#111111]'
              }`}
            >
              <Sliders size={14} className={activeType === 'ear' ? 'text-accent' : ''} />
              <span>Ear Biometric Comparison</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Photo Upload with Interactive Cropper for Ear Biometrics */}
          <div>
            <ImageUploadBox
              folder="comparisons"
              value={photo ? [photo] : []}
              onChange={(urls) => setPhoto(Array.isArray(urls) ? (urls[0] || '') : (urls || ''))}
              multiple={false}
              allowCrop={true}
              autoCropOnSelect={activeType === 'ear'}
              cropLabel={activeType === 'ear' ? 'Crop Ear Area' : 'Crop Photo'}
              cropTitle={activeType === 'ear' ? 'Crop Ear Biometric Area' : 'Crop Progression Photo'}
              cropSubtitle={
                activeType === 'ear'
                  ? 'Drag and frame the crop box directly to highlight the ear pinna, margin notches, and venations.'
                  : 'Drag and frame the crop box to highlight the tusker or morphological progression.'
              }
              cropAspect={activeType === 'ear' ? '3:4' : 'free'}
              label={activeType === 'photographic' ? 'Progression Photo *' : 'Ear Venation / Crop Photo *'}
              aspectClass="aspect-[4/3] max-w-[280px] mx-auto"
            />
          </div>

          {/* Year & Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-1">
              <label className="block font-sans text-[0.76rem] font-bold text-[#444444] uppercase tracking-wider mb-1.5">
                Year *
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => handleYearChange(e.target.value)}
                placeholder="e.g. 2024"
                className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#d5d5d5] bg-white font-sans text-sm text-[#111111] focus:outline-none focus:border-accent"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-sans text-[0.76rem] font-bold text-[#444444] uppercase tracking-wider mb-1.5">
                Stage *
              </label>
              <input
                type="text"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                placeholder={activeType === 'photographic' ? 'e.g. 5-Year Progression, First Recorded Photo...' : 'e.g. Right Pinna Baseline, Margin Progression...'}
                className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#d5d5d5] bg-white font-sans text-sm text-[#111111] focus:outline-none focus:border-accent"
                required
              />
            </div>
          </div>

          {/* Quick preset suggestions for stage */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[0.72rem] text-[#888888] font-medium mr-1">Suggestions:</span>
            {(activeType === 'photographic' ? photoPresets : earPresets).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setStage(preset)}
                className={`text-[0.72rem] px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                  stage === preset
                    ? 'bg-[#0b2518] text-[#c69b55] border-[#0b2518] font-semibold'
                    : 'bg-[#fafafa] text-[#555555] border-[#e0e0e0] hover:border-[#999999]'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Location Picker */}
          <div>
            <label className="block font-sans text-[0.76rem] font-bold text-[#444444] uppercase tracking-wider mb-1.5">
              Observation Location
            </label>
            <LocationSearchInput
              value={location}
              onChange={(e, val) => setLocation(val || '')}
              placeholder="Search & select location (e.g. Pomparippu, Wilpattu, Yala)..."
            />
          </div>

          {/* Type-Specific Fields */}
          {activeType === 'photographic' ? (
            <div className="p-3.5 bg-[#fcfaf7] border border-[#f0e6d2] rounded-[12px] flex flex-col gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasChange}
                  onChange={(e) => setHasChange(e.target.checked)}
                  className="w-4 h-4 rounded text-accent accent-accent cursor-pointer"
                />
                <span className="font-sans text-[0.84rem] font-bold text-[#333333]">
                  Documented Morphological Change (e.g. tusk breakage, ear tear, healing wound)
                </span>
              </label>

              {hasChange && (
                <div className="pt-2 border-t border-[#f0e6d2]">
                  <label className="block font-sans text-[0.74rem] font-bold text-[#666666] uppercase tracking-wider mb-1.5">
                    Morphological Change Category
                  </label>
                  <select
                    value={changeType}
                    onChange={(e) => setChangeType(e.target.value)}
                    className="w-full px-3 py-2 rounded-[8px] border border-[#d5d5d5] bg-white font-sans text-sm text-[#111111] focus:outline-none focus:border-accent"
                  >
                    <option value="Tusk Growth">Tusk Growth & Ivory Elongation</option>
                    <option value="Tusk Breakage">Tusk Breakage / Tip Fracture</option>
                    <option value="Ear Tear / Notch">Ear Tear / Margin Notch</option>
                    <option value="Injury & Healing">Injury & Tissue Healing</option>
                    <option value="Cranial / Muscle Mass">Cranial Girth & Muscle Mass</option>
                    <option value="Depigmentation">Depigmentation & Skin Markings</option>
                    <option value="Other">Other Morphological Trait</option>
                  </select>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 bg-[#f7faf8] border border-[#dce8e0] rounded-[12px]">
              <label className="block font-sans text-[0.74rem] font-bold text-[#44554c] uppercase tracking-wider mb-1.5">
                Ear Biometric Side
              </label>
              <select
                value={earSide}
                onChange={(e) => setEarSide(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] border border-[#d5d5d5] bg-white font-sans text-sm text-[#111111] focus:outline-none focus:border-accent"
              >
                <option value="Right Ear">Right Ear (Right Pinna)</option>
                <option value="Left Ear">Left Ear (Left Pinna)</option>
                <option value="Both Ears">Both Ears (Bilateral Comparison)</option>
              </select>
            </div>
          )}

          {/* Description / Morphological Notes */}
          <div>
            <label className="block font-sans text-[0.76rem] font-bold text-[#444444] uppercase tracking-wider mb-1.5">
              Description &amp; Morphological Notes *
            </label>
            <textarea
              rows={3}
              value={changeSentence}
              onChange={(e) => setChangeSentence(e.target.value)}
              placeholder={
                activeType === 'photographic'
                  ? 'Describe physical changes, tusk curvature/symmetry, facial cranial development, body condition, or healed markings observed over this timeframe...'
                  : 'Detail pinna edge contours, tears, notches, hole punctures, and unique vascular venation patterns for individual ID...'
              }
              className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#d5d5d5] bg-white font-sans text-sm text-[#111111] focus:outline-none focus:border-accent leading-relaxed resize-y"
              required
            />
          </div>

          {/* Errors */}
          {(formErr || error) && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[10px] flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{formErr || error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eeeeee]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-[10px] bg-[#f4f4f4] hover:bg-[#eaeaea] text-[#555555] font-sans text-sm font-semibold border-none cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-[10px] bg-[#0b2518] hover:bg-[#133824] text-white font-sans text-sm font-semibold border-none cursor-pointer transition-all shadow-xs flex items-center gap-2 disabled:opacity-60"
            >
              {isSaving && <Loader2 size={16} className="animate-spin text-[#c69b55]" />}
              <span>{isSaving ? 'Saving...' : isEditing ? 'Update' : 'Save'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

/* ── Comparison Photo Zoom & Fullscreen Lightbox ─────────────── */
function ComparisonPhotoLightbox({
  item,
  items = [],
  tusker,
  onClose,
  onSelect,
}) {
  const currentIndex = items.findIndex(
    (i) => i.year === item.year && i.stage === item.stage && i.photo === item.photo
  );
  const activeIdx = currentIndex >= 0 ? currentIndex : 0;
  const activeItem = items[activeIdx] || item;

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen support
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
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const changeItem = useCallback((newIdx) => {
    if (!items || items.length === 0) return;
    const clamped = (newIdx + items.length) % items.length;
    onSelect({ ...items[clamped], isEar: item.isEar });
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [items, item.isEar, onSelect]);

  const handlePrev = useCallback((e) => {
    e?.stopPropagation();
    changeItem(activeIdx - 1);
  }, [activeIdx, changeItem]);

  const handleNext = useCallback((e) => {
    e?.stopPropagation();
    changeItem(activeIdx + 1);
  }, [activeIdx, changeItem]);

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
    hasDraggedRef.current = false;
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    if (Math.abs(newX - position.x) > 3 || Math.abs(newY - position.y) > 3) {
      hasDraggedRef.current = true;
    }
    setPosition({
      x: newX,
      y: newY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (scale > 1) {
          resetZoom();
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        if (items && items.length > 1) handlePrev();
      } else if (e.key === 'ArrowRight') {
        if (items && items.length > 1) handleNext();
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
  }, [handleNext, handlePrev, items, onClose, resetZoom, scale, toggleFullscreen, zoomIn, zoomOut]);

  // Prevent background scrolling
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow === 'hidden' ? '' : (originalOverflow || '');
    };
  }, []);

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[10000] bg-black/95 text-white flex flex-col justify-between select-none overflow-hidden animate-fade-in p-3 sm:p-5"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* ── Top Header Toolbar ── */}
      <div
        className="w-full flex items-center justify-between z-50 px-2 sm:px-4 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <span className="bg-accent/20 border border-accent/40 text-accent font-mono font-bold text-xs px-2.5 py-1 rounded">
            {tusker?.id || 'WTS'}
          </span>
          <span className="font-sans text-sm sm:text-base font-semibold truncate text-white/90">
            {tusker?.name || 'Wild Tusker'}
          </span>
          <span className="text-white/40">•</span>
          <span className="text-xs sm:text-sm text-white/70 font-medium truncate">
            {activeItem.stage}
          </span>
          {items && items.length > 1 && (
            <span className="text-xs text-white/50 bg-white/10 px-2.5 py-0.5 rounded-full font-medium ml-1">
              {activeIdx + 1} / {items.length}
            </span>
          )}
        </div>

        {/* Toolbar: Zoom Out, %, Zoom In, Reset, Fullscreen, Close */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center border border-white/20 cursor-pointer transition-all ml-1"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Main Stage: Zoomable, Draggable Photo Canvas ── */}
      <div
        className="relative flex-1 w-full flex items-center justify-center min-h-0 my-auto py-2 overflow-hidden cursor-default"
        onWheel={handleWheel}
        onClick={(e) => {
          if (e.target === e.currentTarget && scale === 1) onClose();
        }}
      >
        {/* Navigation Arrows */}
        {items && items.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              title="Previous record (Left arrow)"
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 flex items-center justify-center cursor-pointer backdrop-blur-sm transition-all hover:scale-105"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              title="Next record (Right arrow)"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 flex items-center justify-center cursor-pointer backdrop-blur-sm transition-all hover:scale-105"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Scalable & Draggable Image Canvas */}
        {activeItem.photo && (
          <div
            className="w-full h-full flex items-center justify-center select-none"
            style={{
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
            }}
            onMouseDown={handleMouseDown}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                if (scale === 1) {
                  onClose();
                } else {
                  resetZoom();
                }
                return;
              }
              e.stopPropagation();
              if (hasDraggedRef.current) {
                hasDraggedRef.current = false;
                return;
              }
              if (scale === 1) {
                setScale(2.5);
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              toggleZoom(e);
            }}
          >
            <img
              src={activeItem.photo}
              alt={`${tusker?.name || 'Tusker'} ${activeItem.year}`}
              draggable={false}
              className="max-h-[70vh] sm:max-h-[74vh] max-w-[92vw] w-auto h-auto object-contain rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.95)] border border-white/10 select-none transition-transform duration-75"
              style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
                transformOrigin: 'center center',
              }}
            />
          </div>
        )}
      </div>

      {/* ── Bottom Floating Frosted Bar (Matching Gallery Page) ── */}
      <div
        className="w-full max-w-[920px] mx-auto z-50 mt-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-black/85 via-[#0b1c14]/90 to-black/85 backdrop-blur-xl border border-white/15 rounded-2xl px-5 sm:px-7 py-3.5 sm:py-4 shadow-2xl flex flex-col gap-2.5 text-left">
          {/* Top Row: Name, Stage, Year, Location, Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-serif text-base sm:text-lg font-bold text-white tracking-wide m-0">
                {tusker?.name} ({tusker?.id})
              </h2>
              <span className="text-[#c69b55] font-sans text-xs sm:text-sm font-semibold">
                • {activeItem.stage}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#0b2518] text-[#c69b55] border border-[#c69b55]/40 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                <Calendar size={12} />
                <span>{activeItem.year}</span>
              </span>

              {activeItem.location && (
                <span className="text-xs text-[#d4ded8] bg-white/10 px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
                  <MapPin size={12} className="text-accent" />
                  <span>{activeItem.location}</span>
                </span>
              )}

              {activeItem.hasChange && activeItem.changeType && (
                <span className="text-xs font-bold uppercase tracking-wider text-[#996515] bg-[#faf5ec] px-2.5 py-0.5 rounded-full border border-[#f0e6d2]">
                  {activeItem.changeType}
                </span>
              )}

              {activeItem.earSide && (
                <span className="text-xs font-bold text-[#0b2518] bg-[#c69b55] px-2.5 py-0.5 rounded-full">
                  {activeItem.earSide}
                </span>
              )}
            </div>
          </div>

          {/* Description Sentence */}
          {activeItem.changeSentence && (
            <p className="font-sans text-[0.85rem] sm:text-sm text-[#d4ded8] leading-relaxed m-0 font-medium">
              {activeItem.changeSentence}
            </p>
          )}

          {/* Milestone Thumbnails Strip (if > 1) */}
          {items && items.length > 1 && (
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
                {items.map((it, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => changeItem(idx)}
                    className={`h-11 px-2.5 rounded-lg flex items-center gap-2 border transition-all cursor-pointer bg-black/40 text-left ${
                      idx === activeIdx
                        ? 'border-accent ring-2 ring-accent/60 bg-white/15'
                        : 'border-white/15 opacity-60 hover:opacity-100 hover:border-white/40'
                    }`}
                  >
                    {it.photo && (
                      <img src={it.photo} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                    )}
                    <div className="flex flex-col min-w-0 pr-1">
                      <span className="text-[11px] font-bold text-white truncate max-w-[110px]">
                        {it.year}
                      </span>
                      <span className="text-[10px] text-white/70 truncate max-w-[110px]">
                        {it.stage}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-white/40 hidden md:flex items-center gap-2 shrink-0">
                <span>Scroll / Double-click to zoom</span>
                <span>•</span>
                <span>Drag to pan</span>
                <span>•</span>
                <span>Arrow keys ◀ ▶</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Sighting Photo Zoom & Fullscreen Lightbox ───────────────── */
function SightingPhotoLightbox({
  photo,
  tusker,
  onClose,
  onSelectIndex,
}) {
  const images = useMemo(() => {
    return photo.images && photo.images.length > 0
      ? photo.images
      : photo.url
      ? [photo.url]
      : [];
  }, [photo.images, photo.url]);
  const activeIdx = photo.activeIdx !== undefined ? photo.activeIdx : 0;
  const activeUrl = images[activeIdx] || photo.url;

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const changeIndex = useCallback((newIdx) => {
    if (!images || images.length === 0) return;
    const clamped = (newIdx + images.length) % images.length;
    onSelectIndex(clamped);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [images, onSelectIndex]);

  const handlePrev = useCallback((e) => {
    e?.stopPropagation();
    changeIndex(activeIdx - 1);
  }, [activeIdx, changeIndex]);

  const handleNext = useCallback((e) => {
    e?.stopPropagation();
    changeIndex(activeIdx + 1);
  }, [activeIdx, changeIndex]);

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
    hasDraggedRef.current = false;
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    if (Math.abs(newX - position.x) > 3 || Math.abs(newY - position.y) > 3) {
      hasDraggedRef.current = true;
    }
    setPosition({
      x: newX,
      y: newY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (scale > 1) {
          resetZoom();
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        if (images && images.length > 1) handlePrev();
      } else if (e.key === 'ArrowRight') {
        if (images && images.length > 1) handleNext();
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
  }, [handleNext, handlePrev, images, onClose, resetZoom, scale, toggleFullscreen, zoomIn, zoomOut]);

  // Prevent background scrolling
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow === 'hidden' ? '' : (originalOverflow || '');
    };
  }, []);

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[10000] bg-black/95 text-white flex flex-col justify-between select-none overflow-hidden animate-fade-in p-3 sm:p-5"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* ── Top Header Toolbar ── */}
      <div
        className="w-full flex items-center justify-between z-50 px-2 sm:px-4 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <span className="bg-accent/20 border border-accent/40 text-accent font-mono font-bold text-xs px-2.5 py-1 rounded">
            {tusker?.id || 'WTS'}
          </span>
          <span className="font-sans text-sm sm:text-base font-semibold truncate text-white/90">
            {photo.title || tusker?.name}
          </span>
          {images && images.length > 1 && (
            <span className="text-xs text-white/50 bg-white/10 px-2.5 py-0.5 rounded-full font-medium ml-1">
              {activeIdx + 1} / {images.length}
            </span>
          )}
        </div>

        {/* Toolbar: Zoom Out, %, Zoom In, Reset, Fullscreen, Close */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center border border-white/20 cursor-pointer transition-all ml-1"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Main Stage: Zoomable, Draggable Photo Canvas ── */}
      <div
        className="relative flex-1 w-full flex items-center justify-center min-h-0 my-auto py-2 overflow-hidden cursor-default"
        onWheel={handleWheel}
        onClick={(e) => {
          if (e.target === e.currentTarget && scale === 1) onClose();
        }}
      >
        {/* Navigation Arrows */}
        {images && images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              title="Previous photo (Left arrow)"
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 flex items-center justify-center cursor-pointer backdrop-blur-sm transition-all hover:scale-105"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              title="Next photo (Right arrow)"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 flex items-center justify-center cursor-pointer backdrop-blur-sm transition-all hover:scale-105"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Scalable & Draggable Image Canvas */}
        {activeUrl && (
          <div
            className="w-full h-full flex items-center justify-center select-none"
            style={{
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
            }}
            onMouseDown={handleMouseDown}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                if (scale === 1) {
                  onClose();
                } else {
                  resetZoom();
                }
                return;
              }
              e.stopPropagation();
              if (hasDraggedRef.current) {
                hasDraggedRef.current = false;
                return;
              }
              if (scale === 1) {
                setScale(2.5);
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              toggleZoom(e);
            }}
          >
            <img
              src={activeUrl}
              alt={photo.title || 'Sighting'}
              draggable={false}
              className="max-h-[70vh] sm:max-h-[74vh] max-w-[92vw] w-auto h-auto object-contain rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.95)] border border-white/10 select-none transition-transform duration-75"
              style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
                transformOrigin: 'center center',
              }}
            />
          </div>
        )}
      </div>

      {/* ── Bottom Floating Frosted Bar (Matching Gallery Page) ── */}
      <div
        className="w-full max-w-[920px] mx-auto z-50 mt-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-black/85 via-[#0b1c14]/90 to-black/85 backdrop-blur-xl border border-white/15 rounded-2xl px-5 sm:px-7 py-3.5 sm:py-4 shadow-2xl flex flex-col gap-2 text-left">
          {/* Top Row: Title, Date, Location, Health, Threat */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-serif text-base sm:text-lg font-bold text-white tracking-wide m-0">
                {photo.title || `${tusker?.name} (${tusker?.id})`}
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              {photo.date && (
                <span className="bg-[#0b2518] text-[#c69b55] border border-[#c69b55]/40 font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                  <Calendar size={12} />
                  <span>{photo.date}</span>
                </span>
              )}

              {photo.location && (
                <span className="text-xs text-[#d4ded8] bg-white/10 px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
                  <MapPin size={12} className="text-accent" />
                  <span>{photo.location}</span>
                </span>
              )}

              {photo.healthCondition && (
                <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 font-bold px-2.5 py-0.5 rounded-full">
                  Health: {photo.healthCondition}
                </span>
              )}

              {photo.threatLevel && (
                <span className="bg-amber-950/80 text-amber-300 border border-amber-600/40 font-bold px-2.5 py-0.5 rounded-full">
                  Threat: {photo.threatLevel}
                </span>
              )}
            </div>
          </div>

          {/* Sighting Details & Notes */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#b8c7be] font-sans">
            <span className="flex items-center gap-1">
              <UserCheck size={13} className="text-accent" />
              <span>Recorded By: <strong className="text-white font-semibold">{photo.author || 'WTS Admin'}</strong></span>
            </span>
          </div>

          {photo.note && (
            <p className="font-sans text-[0.85rem] sm:text-sm text-[#d4ded8] leading-relaxed m-0 font-medium pt-1 border-t border-white/10">
              {photo.note}
            </p>
          )}

          {/* Thumbnails strip for multiple images */}
          {images && images.length > 1 && (
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => changeIndex(idx)}
                    className={`w-11 h-11 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer p-0 bg-black/40 ${
                      idx === activeIdx
                        ? 'border-accent ring-2 ring-accent/60 scale-105 opacity-100'
                        : 'border-white/15 opacity-60 hover:opacity-100 hover:border-white/40'
                    }`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-white/40 hidden md:flex items-center gap-2 shrink-0">
                <span>Scroll / Double-click to zoom</span>
                <span>•</span>
                <span>Drag to pan</span>
                <span>•</span>
                <span>Arrow keys ◀ ▶</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
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

  // Comparison Management State (Photographic & Ear Biometric)
  const [comparisonModal, setComparisonModal] = useState(null); // { type: 'photographic' | 'ear', item?: object, index?: number }
  const [deletingComparison, setDeletingComparison] = useState(null); // { type: 'photographic' | 'ear', index: number, item: object }
  const [isSavingComparison, setIsSavingComparison] = useState(false);
  const [comparisonSaveError, setComparisonSaveError] = useState('');

  const handleSaveComparison = async (formData, formType) => {
    setIsSavingComparison(true);
    setComparisonSaveError('');
    try {
      if (formType === 'photographic') {
        const currentList = Array.isArray(tusker.photographicComparison)
          ? [...tusker.photographicComparison]
          : [];
        if (comparisonModal?.index !== undefined && comparisonModal.index >= 0) {
          currentList[comparisonModal.index] = formData;
        } else {
          currentList.push(formData);
        }
        currentList.sort((a, b) => (parseInt(a.year, 10) || 0) - (parseInt(b.year, 10) || 0));
        await updateTusker(tusker.id, { photographicComparison: currentList });
      } else {
        const currentList = Array.isArray(tusker.earComparison)
          ? [...tusker.earComparison]
          : [];
        if (comparisonModal?.index !== undefined && comparisonModal.index >= 0) {
          currentList[comparisonModal.index] = formData;
        } else {
          currentList.push(formData);
        }
        currentList.sort((a, b) => (parseInt(a.year, 10) || 0) - (parseInt(b.year, 10) || 0));
        await updateTusker(tusker.id, { earComparison: currentList });
      }

      await reloadTusker();
      setComparisonModal(null);
    } catch (err) {
      console.error('Failed to save comparison milestone:', err);
      setComparisonSaveError(err.message || 'Failed to save comparison item.');
    } finally {
      setIsSavingComparison(false);
    }
  };

  const handleConfirmDeleteComparison = async () => {
    if (!deletingComparison) return;
    setIsSavingComparison(true);
    try {
      if (deletingComparison.type === 'photographic') {
        const currentList = Array.isArray(tusker.photographicComparison)
          ? [...tusker.photographicComparison]
          : [];
        currentList.splice(deletingComparison.index, 1);
        await updateTusker(tusker.id, { photographicComparison: currentList });
      } else {
        const currentList = Array.isArray(tusker.earComparison)
          ? [...tusker.earComparison]
          : [];
        currentList.splice(deletingComparison.index, 1);
        await updateTusker(tusker.id, { earComparison: currentList });
      }
      await reloadTusker();
      setDeletingComparison(null);
    } catch (err) {
      console.error('Failed to delete comparison milestone:', err);
    } finally {
      setIsSavingComparison(false);
    }
  };

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

    // If this is the latest sighting, synchronize the tusker profile status
    const allSightings = tusker?.sightings || [];
    const isLatest = allSightings.length > 0 && allSightings[allSightings.length - 1].id === sightingId;
    if (isLatest && updatedPayload.note && tusker?.id) {
      try {
        const parsed = JSON.parse(updatedPayload.note);
        const updates = {};
        if (parsed.location !== undefined) updates.lastSeenArea = parsed.location;
        if (parsed.healthCondition !== undefined) updates.healthCondition = parsed.healthCondition;
        if (parsed.threatLevel !== undefined) updates.threatLevel = parsed.threatLevel;
        if (parsed.specialMarks !== undefined) updates.specialMarks = parsed.specialMarks;
        if (parsed.specialWounds !== undefined) updates.specialWounds = parsed.specialWounds;
        if (parsed.remarks !== undefined || parsed.note !== undefined) updates.remarks = parsed.remarks || parsed.note;
        if (updatedPayload.captureDate) updates.lastSeen = `${updatedPayload.captureDate.slice(0, 7)}-01`;
        if (Object.keys(updates).length > 0) {
          await updateTusker(tusker.id, updates);
        }
      } catch {
        /* ignore parsing errors */
      }
    }

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
      const sightingId = deletingSighting.sighting.id;
      await deleteSighting(sightingId);

      // Recompute profile status based on remaining sightings
      const remainingSightings = (tusker?.sightings || []).filter(
        (s) => s.id !== sightingId
      );

      let profileRollback = {};
      if (remainingSightings.length > 0) {
        // Rollback to the latest remaining sighting observation
        const latestSighting = remainingSightings[remainingSightings.length - 1];
        const latestDetails = parseSightingDetails(latestSighting);
        profileRollback = {
          lastSeenArea: latestDetails.location || tusker?.location || '',
          healthCondition: latestDetails.healthCondition || 'Good',
          threatLevel: latestDetails.threatLevel || '',
          specialMarks: latestDetails.specialMarks || '',
          specialWounds: latestDetails.specialWounds || '',
          remarks: latestDetails.remarks || latestDetails.note || '',
        };
        if (latestSighting.captureDate) {
          profileRollback.lastSeen = `${latestSighting.captureDate.slice(0, 7)}-01`;
        }
      } else {
        // All subsequent field sightings deleted: restore original baseline tusker data
        profileRollback = {
          lastSeenArea: tusker?.location || '',
          healthCondition: 'Good',
          threatLevel: '',
          specialMarks: '',
          specialWounds: '',
          remarks: '',
        };
        if (tusker?.firstRecordedDate) {
          profileRollback.lastSeen = `${tusker.firstRecordedDate.slice(0, 7)}-01`;
        }
      }

      // Persist the rollback update to the database
      if (tusker?.id && Object.keys(profileRollback).length > 0) {
        try {
          await updateTusker(tusker.id, profileRollback);
        } catch (updateErr) {
          console.warn('Could not update tusker profile after deleting sighting:', updateErr);
        }
      }

      if (reloadTusker) {
        await reloadTusker();
      } else if (setTusker) {
        setTusker((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            ...profileRollback,
            sightings: remainingSightings,
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

  // Combine baseline tusker photos with ALL subsequent sighting photos at the end
  const allProfilePhotos = useMemo(() => {
    const basePhotos = Array.isArray(tusker?.photos)
      ? [...tusker.photos]
      : (tusker?.photo ? [tusker.photo] : []);
    const sightingPhotos = [];

    (tusker?.sightings || []).forEach((s) => {
      const details = parseSightingDetails(s);
      const list = [];

      // 1. All images from details.images
      if (Array.isArray(details.images) && details.images.length > 0) {
        details.images.forEach((u) => {
          if (u && typeof u === 'string' && u.trim().length > 0) list.push(u.trim());
        });
      }

      // 2. All images from s.imageUrl (string or comma-separated)
      if (s.imageUrl) {
        if (Array.isArray(s.imageUrl)) {
          s.imageUrl.forEach((u) => {
            if (u && typeof u === 'string' && u.trim().length > 0) list.push(u.trim());
          });
        } else if (typeof s.imageUrl === 'string') {
          s.imageUrl.split(',').forEach((u) => {
            const trimmed = u.trim();
            if (trimmed) list.push(trimmed);
          });
        }
      }

      // 3. Fallback to raw note JSON
      if (s.note && typeof s.note === 'string' && s.note.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(s.note);
          const rawImgs = Array.isArray(parsed.images)
            ? parsed.images
            : (Array.isArray(parsed.imageUrls) ? parsed.imageUrls : []);
          rawImgs.forEach((u) => {
            if (u && typeof u === 'string' && u.trim().length > 0) list.push(u.trim());
          });
        } catch {
          /* ignore */
        }
      }

      list.forEach((url) => {
        if (url && !basePhotos.includes(url) && !sightingPhotos.includes(url)) {
          sightingPhotos.push(url);
        }
      });
    });

    return [...basePhotos, ...sightingPhotos];
  }, [tusker?.photos, tusker?.photo, tusker?.sightings]);

  useEffect(() => {
    if (selectedComparisonImg || showRiskModal || previewModalPhoto || comparisonModal || deletingComparison) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow === 'hidden' ? '' : (prevOverflow || '');
      };
    }
  }, [selectedComparisonImg, showRiskModal, previewModalPhoto, comparisonModal, deletingComparison]);

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

            {/* Responsive Collage */}
            <div className={`grid grid-cols-1 ${comparisonList.length === 1 ? 'max-w-md mx-auto' : comparisonList.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6`}>
              {comparisonList.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#fcfdfd] border border-[#e5e7eb] rounded-[16px] overflow-hidden flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                >
                  {/* Top Stage & Year Header */}
                  <div className="px-4 py-3 bg-white border-b border-[#f0f0f0] flex items-center justify-between">
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-sans text-[0.82rem] font-bold text-[#555555] truncate">
                        {item.stage || `Stage ${index + 1}`}
                      </span>
                      {item.location && (
                        <span className="font-sans text-[0.72rem] text-[#888888] flex items-center gap-1 mt-0.5 truncate">
                          <MapPin size={10} className="text-accent shrink-0" />
                          <span>{item.location}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[#111111] font-sans text-[0.84rem] font-extrabold flex items-center gap-1.5 shrink-0">
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
                    {item.hasChange && item.changeType && (
                      <div className="mt-3 pt-2.5 border-t border-[#f2f2f2]">
                        <span className="inline-block text-[0.7rem] font-bold uppercase tracking-wider text-[#996515] bg-[#faf5ec] px-2 py-0.5 rounded-full border border-[#f0e6d2]">
                          {item.changeType}
                        </span>
                      </div>
                    )}
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
                  <span>Ear Biometric &amp; Venation Comparison</span>
                </h2>
                <p className="font-sans text-[0.9rem] text-[#666666] mt-1.5 mb-0 max-w-[780px] leading-relaxed">
                  Identification panel comparing pinna edge contours, tears, V-notches, and vascular branching across monitoring intervals.
                </p>
              </div>
            </div>

            {/* Responsive Collage of Ears */}
            <div className={`grid grid-cols-1 ${earComparisonList.length === 1 ? 'max-w-md mx-auto' : 'md:grid-cols-2'} gap-6`}>
              {earComparisonList.map((item, index) => (
                <div
                  key={index}
                  className="bg-white border border-[#e0e5e2] rounded-[16px] overflow-hidden flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                >
                  {/* Top Stage & Year Header */}
                  <div className="px-4 py-3 bg-[#fafbf9] border-b border-[#eeeeee] flex items-center justify-between">
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-sans text-[0.82rem] font-bold text-[#44554c] truncate">
                        {item.stage || (item.earSide ? `${item.earSide} Record` : `Stage ${index + 1}`)}
                      </span>
                      {item.location && (
                        <span className="font-sans text-[0.72rem] text-[#77887e] flex items-center gap-1 mt-0.5 truncate">
                          <MapPin size={10} className="text-accent shrink-0" />
                          <span>{item.location}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.earSide && (
                        <span className="bg-[#0b2518]/10 text-[#0b2518] text-[0.7rem] font-bold px-2 py-0.5 rounded-full">
                          {item.earSide}
                        </span>
                      )}
                      <span className="text-[#111111] font-sans text-[0.84rem] font-extrabold flex items-center gap-1.5">
                        <Calendar size={13} />
                        <span>{item.year}</span>
                      </span>
                    </div>
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
                          {tusker.id} • Ear Biometrics
                        </span>
                        <span className="font-sans text-[0.78rem] text-[#55695d] max-w-[200px] leading-tight">
                          {item.stage || 'Ear'} Record
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Sentence Below the Ear Photo */}
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
                          {(() => {
                            const allSightingImages = (details.images && details.images.length > 0)
                              ? details.images
                              : (sighting.imageUrl
                                ? (typeof sighting.imageUrl === 'string' ? sighting.imageUrl.split(',').map((u) => u.trim()).filter(Boolean) : [sighting.imageUrl])
                                : []);
                            const primaryPhoto = allSightingImages[0] || null;

                            return primaryPhoto ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewModalPhoto({
                                    url: primaryPhoto,
                                    images: allSightingImages,
                                    title: `${tusker.name} (${tusker.id}) - Sighting #${sightingNum}`,
                                    date: formatDate(sighting.captureDate) || sighting.captureDate || '—',
                                    author: sighting.author || 'WTS Admin',
                                    location: details.location || '',
                                    healthCondition: details.healthCondition || '',
                                    threatLevel: details.threatLevel || '',
                                    note: noteDisplay !== '—' ? noteDisplay : ''
                                  });
                                }}
                                className="group relative w-12 h-12 rounded-[8px] overflow-hidden border border-[#d5d5d5] bg-black/5 mx-auto block cursor-pointer transition-transform hover:scale-105 p-0"
                                title="Click to view primary image"
                              >
                                <img
                                  src={primaryPhoto}
                                  alt={`Sighting ${sightingNum}`}
                                  className="w-full h-full object-cover"
                                />
                                {allSightingImages.length > 1 && (
                                  <span className="absolute bottom-1 right-1 bg-black/80 text-[#c69b55] text-[9px] font-bold px-1 rounded shadow-xs">
                                    +{allSightingImages.length - 1}
                                  </span>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Eye size={14} />
                                </div>
                              </button>
                            ) : (
                              <span className="text-[#aaaaaa] text-xs">—</span>
                            );
                          })()}
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

            {/* Photographic & Ear Biometric Comparisons Management (Admin View) */}
            <div className="mt-10 pt-8 border-t border-[#e8e8e8]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-sans text-[1.25rem] font-bold text-[#111111] m-0 flex items-center gap-2">
                    <Camera size={20} className="text-accent" />
                    <span>Photographic &amp; Ear Biometric Comparisons</span>
                  </h3>
                  <p className="font-sans text-[0.82rem] text-[#666666] mt-1 mb-0 leading-relaxed max-w-[680px]">
                    Manage sequential multi-year photographic progressions and ear venation biometrics over the years. Added records are immediately reflected in the public comparison collage above.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2.5 shrink-0 ml-auto w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setComparisonModal({
                        type: 'photographic',
                        item: null,
                        index: -1,
                      });
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-[#0b2518] hover:bg-[#133824] text-white text-[0.82rem] font-semibold transition-all shadow-xs cursor-pointer border-none w-full sm:w-[195px] text-center"
                  >
                    <Plus size={15} className="text-[#c69b55]" />
                    <span>Add Photo Comparison</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setComparisonModal({
                        type: 'ear',
                        item: null,
                        index: -1,
                      });
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-[#0b2518] hover:bg-[#133824] text-white text-[0.82rem] font-semibold transition-all shadow-xs cursor-pointer border-none w-full sm:w-[195px] text-center"
                  >
                    <Plus size={15} className="text-[#c69b55]" />
                    <span>Add Ear Comparison</span>
                  </button>
                </div>
              </div>

              {/* Grid with 2 columns: Photographic progression & Ear biometrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Photographic Comparisons Column */}
                <div className="bg-[#fafbfb] border border-[#e5e7eb] rounded-[16px] p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#ededed]">
                    <div className="flex items-center gap-2">
                      <Camera size={16} className="text-accent" />
                      <span className="font-sans text-[0.92rem] font-bold text-[#111111]">
                        Photographic Progression
                      </span>
                    </div>
                    <span className="text-[0.72rem] font-bold px-2 py-0.5 rounded-full bg-white border border-[#d5d5d5] text-[#555555]">
                      {Array.isArray(tusker.photographicComparison) ? tusker.photographicComparison.length : 0} records
                    </span>
                  </div>

                  {Array.isArray(tusker.photographicComparison) && tusker.photographicComparison.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {tusker.photographicComparison.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-[#e8e8e8] rounded-[12px] p-3.5 flex gap-3.5 shadow-xs hover:border-[#cccccc] transition-colors"
                        >
                          <div
                            onClick={() => item.photo && setSelectedComparisonImg(item)}
                            className={`w-20 h-20 rounded-[8px] bg-[#f0f0f0] overflow-hidden shrink-0 border border-[#e0e0e0] flex items-center justify-center ${item.photo ? 'cursor-pointer group relative' : ''}`}
                          >
                            {item.photo ? (
                              <>
                                <img src={item.photo} alt={item.stage} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Eye size={14} />
                                </div>
                              </>
                            ) : (
                              <Camera size={18} className="text-[#999999]" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-sans text-[0.85rem] font-bold text-[#111111] truncate">
                                  {item.stage || `Stage ${idx + 1}`}
                                </span>
                                <span className="bg-[#0b2518] text-[#c69b55] text-[0.7rem] font-bold px-2 py-0.5 rounded-full shrink-0">
                                  {item.year}
                                </span>
                              </div>
                              {item.location && (
                                <span className="text-[0.72rem] text-[#777777] flex items-center gap-1 mt-0.5 truncate">
                                  <MapPin size={10} className="text-accent shrink-0" />
                                  <span>{item.location}</span>
                                </span>
                              )}
                              {item.hasChange && item.changeType && (
                                <span className="inline-block text-[0.68rem] font-bold uppercase tracking-wider text-[#996515] bg-[#faf5ec] px-1.5 py-0.5 rounded border border-[#f0e6d2] mt-1">
                                  {item.changeType}
                                </span>
                              )}
                              <p className="font-sans text-[0.78rem] text-[#444444] line-clamp-2 mt-1 mb-0 leading-snug">
                                {item.changeSentence}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#f2f2f2] justify-end">
                              <button
                                type="button"
                                onClick={() => setComparisonModal({ type: 'photographic', item, index: idx })}
                                className="inline-flex items-center gap-1 text-[0.72rem] font-medium text-[#444444] hover:text-[#111111] px-2 py-1 rounded bg-[#f5f5f5] hover:bg-[#ebebeb] border-none cursor-pointer transition-colors"
                              >
                                <Edit size={12} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingComparison({ type: 'photographic', index: idx, item })}
                                className="inline-flex items-center gap-1 text-[0.72rem] font-medium text-red-600 hover:text-red-700 px-2 py-1 rounded bg-red-50 hover:bg-red-100 border-none cursor-pointer transition-colors"
                              >
                                <Trash2 size={12} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 px-4 text-center border border-dashed border-[#d8d8d8] rounded-[12px] bg-white">
                      <Camera size={24} className="mx-auto text-[#bbbbbb] mb-1.5" />
                      <p className="font-sans text-[0.82rem] font-bold text-[#555555] m-0">No photographic comparisons added yet</p>
                      <p className="font-sans text-[0.75rem] text-[#888888] m-0 mt-0.5 max-w-[280px] mx-auto">
                        Track multi-year tusk and physical changes by clicking "+ Add Photo Comparison".
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Ear Biometric Comparisons Column */}
                <div className="bg-[#fafbfb] border border-[#e5e7eb] rounded-[16px] p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#ededed]">
                    <div className="flex items-center gap-2">
                      <Sliders size={16} className="text-accent" />
                      <span className="font-sans text-[0.92rem] font-bold text-[#111111]">
                        Ear Biometric Records
                      </span>
                    </div>
                    <span className="text-[0.72rem] font-bold px-2 py-0.5 rounded-full bg-white border border-[#d5d5d5] text-[#555555]">
                      {Array.isArray(tusker.earComparison) ? tusker.earComparison.length : 0} records
                    </span>
                  </div>

                  {Array.isArray(tusker.earComparison) && tusker.earComparison.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {tusker.earComparison.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-[#e8e8e8] rounded-[12px] p-3.5 flex gap-3.5 shadow-xs hover:border-[#cccccc] transition-colors"
                        >
                          <div
                            onClick={() => item.photo && setSelectedComparisonImg({ ...item, isEar: true })}
                            className={`w-20 h-20 rounded-[8px] bg-[#f0f0f0] overflow-hidden shrink-0 border border-[#e0e0e0] flex items-center justify-center ${item.photo ? 'cursor-pointer group relative' : ''}`}
                          >
                            {item.photo ? (
                              <>
                                <img src={item.photo} alt={item.stage} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Eye size={14} />
                                </div>
                              </>
                            ) : (
                              <Camera size={18} className="text-[#999999]" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-sans text-[0.85rem] font-bold text-[#111111] truncate">
                                  {item.stage || (item.earSide ? `${item.earSide} Record` : `Record ${idx + 1}`)}
                                </span>
                                <span className="bg-[#0b2518] text-[#c69b55] text-[0.7rem] font-bold px-2 py-0.5 rounded-full shrink-0">
                                  {item.year}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {item.earSide && (
                                  <span className="text-[0.68rem] font-semibold text-[#0b2518] bg-[#0b2518]/10 px-1.5 py-0.2 rounded">
                                    {item.earSide}
                                  </span>
                                )}
                                {item.location && (
                                  <span className="text-[0.72rem] text-[#777777] flex items-center gap-1 truncate">
                                    <MapPin size={10} className="text-accent shrink-0" />
                                    <span>{item.location}</span>
                                  </span>
                                )}
                              </div>
                              <p className="font-sans text-[0.78rem] text-[#444444] line-clamp-2 mt-1 mb-0 leading-snug">
                                {item.changeSentence}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#f2f2f2] justify-end">
                              <button
                                type="button"
                                onClick={() => setComparisonModal({ type: 'ear', item, index: idx })}
                                className="inline-flex items-center gap-1 text-[0.72rem] font-medium text-[#444444] hover:text-[#111111] px-2 py-1 rounded bg-[#f5f5f5] hover:bg-[#ebebeb] border-none cursor-pointer transition-colors"
                              >
                                <Edit size={12} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingComparison({ type: 'ear', index: idx, item })}
                                className="inline-flex items-center gap-1 text-[0.72rem] font-medium text-red-600 hover:text-red-700 px-2 py-1 rounded bg-red-50 hover:bg-red-100 border-none cursor-pointer transition-colors"
                              >
                                <Trash2 size={12} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 px-4 text-center border border-dashed border-[#d8d8d8] rounded-[12px] bg-white">
                      <Sliders size={24} className="mx-auto text-[#bbbbbb] mb-1.5" />
                      <p className="font-sans text-[0.82rem] font-bold text-[#555555] m-0">No ear biometric records added yet</p>
                      <p className="font-sans text-[0.75rem] text-[#888888] m-0 mt-0.5 max-w-[280px] mx-auto">
                        Document pinna contours, notches, and vascular branching by clicking "+ Add Ear Comparison".
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
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

            {/* Gallery-Style Comparison Photo Lightbox with Zoom & Fullscreen */}
      {selectedComparisonImg && (
        <ComparisonPhotoLightbox
          item={selectedComparisonImg}
          items={selectedComparisonImg.isEar ? earComparisonList : comparisonList}
          tusker={tusker}
          onClose={() => setSelectedComparisonImg(null)}
          onSelect={(newItem) => setSelectedComparisonImg(newItem)}
        />
      )}

      {/* Admin Comparison Form Modal */}
      {comparisonModal && (
        <ComparisonFormModal
          isOpen={Boolean(comparisonModal)}
          type={comparisonModal.type || 'photographic'}
          initialData={comparisonModal.item}
          isEditing={comparisonModal.index !== undefined && comparisonModal.index >= 0}
          tusker={tusker}
          onClose={() => setComparisonModal(null)}
          onSave={handleSaveComparison}
          isSaving={isSavingComparison}
          error={comparisonSaveError}
        />
      )}

      {/* Delete Comparison Milestone Confirmation Modal */}
      {deletingComparison && createPortal(
        <div
          className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => !isSavingComparison && setDeletingComparison(null)}
        >
          <div
            className="bg-white rounded-[16px] max-w-[420px] w-full p-6 shadow-2xl border border-[#e8e8e8] flex flex-col gap-4 relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-11 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={22} />
            </div>
            <div className="text-center">
              <h3 className="font-sans text-[1.1rem] font-bold text-[#111111] m-0">
                Delete Comparison Record?
              </h3>
              <p className="font-sans text-[0.84rem] text-[#666666] mt-2 mb-0 leading-relaxed">
                Are you sure you want to delete this {deletingComparison.type === 'photographic' ? 'photographic progression' : 'ear biometric'} record ({deletingComparison.item?.year} • {deletingComparison.item?.stage})? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingComparison(null)}
                disabled={isSavingComparison}
                className="flex-1 py-2.5 px-4 rounded-[10px] bg-[#f4f4f4] hover:bg-[#eaeaea] text-[#555555] font-sans text-sm font-semibold border-none cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteComparison}
                disabled={isSavingComparison}
                className="flex-1 py-2.5 px-4 rounded-[10px] bg-red-600 hover:bg-red-700 text-white font-sans text-sm font-semibold border-none cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-60"
              >
                {isSavingComparison && <Loader2 size={16} className="animate-spin" />}
                <span>{isSavingComparison ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

            {/* Gallery-Style Sighting / Observation Photo Lightbox with Zoom & Fullscreen */}
      {previewModalPhoto && (
        <SightingPhotoLightbox
          photo={previewModalPhoto}
          tusker={tusker}
          onClose={() => setPreviewModalPhoto(null)}
          onSelectIndex={(idx) => setPreviewModalPhoto((prev) => ({ ...prev, activeIdx: idx }))}
        />
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
