/**
 * @file ImageLightboxModal.jsx
 * @description Unified high-resolution image lightbox modal. Supports smooth mouse wheel
 * and double-click zoom (1x-5x), cursor-drag panning, background scroll locking,
 * admin moderation actions (Edit, Approve, Delete), and multi-tusker registry profile navigation.
 * Used identically across Gallery, Special Observations, and Field Notes.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, MapPin, Camera, Calendar, Pencil, Trash2, CheckCircle2, ExternalLink, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { getTuskers } from '../../models/TuskerModel';

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  try {
    const s = String(dateStr).trim();
    if (/^\d{4}$/.test(s)) return s;
    const parts = s.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (monthIndex >= 0 && monthIndex < 12 && !isNaN(day)) {
        return `${day} ${months[monthIndex]} ${year}`;
      }
    }
  } catch {
    // fallback
  }
  return String(dateStr);
}

/**
 * ImageLightboxModal
 * Unified full-screen zoomable lightbox modal used across Gallery, Special Observations, and Field Notes.
 */
export default function ImageLightboxModal({
  photo,
  tusker,
  tuskers: passedTuskers = [],
  onClose,
  isAdmin = false,
  onApprove,
  onDelete,
  onEdit,
  fromPath = '/gallery',
}) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const rafRef = useRef(null);

  const [tuskersList, setTuskersList] = useState(passedTuskers);

  // Load tuskers list if not provided
  useEffect(() => {
    if (passedTuskers && passedTuskers.length > 0) {
      setTuskersList(passedTuskers);
      return;
    }
    let active = true;
    getTuskers()
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setTuskersList(data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [passedTuskers]);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
  }, []);

  const zoomIn = useCallback((e) => {
    e?.stopPropagation();
    setScale((prev) => Math.min(prev + 0.5, 5));
  }, []);

  const zoomOut = useCallback((e) => {
    e?.stopPropagation();
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const toggleZoom = useCallback(
    (e) => {
      e?.stopPropagation();
      if (scale > 1) {
        resetZoom();
      } else {
        setScale(2.5);
      }
    },
    [scale, resetZoom]
  );

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0045;
    setScale((prev) => {
      const nextScale = Math.min(Math.max(prev + delta, 1), 5);
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
    if (Math.abs(newX - position.x) > 2 || Math.abs(newY - position.y) > 2) {
      hasDraggedRef.current = true;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setPosition({ x: newX, y: newY });
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch gesture support for mobile pinch-to-zoom, single-finger drag pan & double tap
  const touchStartDistRef = useRef(0);
  const touchStartScaleRef = useRef(1);
  const lastTapRef = useRef(0);

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      touchStartScaleRef.current = scale;
      setIsDragging(false);
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        toggleZoom(e);
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      if (scale > 1) {
        setIsDragging(true);
        hasDraggedRef.current = false;
        dragStartRef.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        };
      }
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && touchStartDistRef.current > 0) {
      if (e.cancelable) e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchStartDistRef.current;
      const nextScale = Math.min(Math.max(touchStartScaleRef.current * factor, 1), 5);
      if (nextScale === 1) setPosition({ x: 0, y: 0 });
      setScale(nextScale);
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      if (e.cancelable) e.preventDefault();
      const newX = e.touches[0].clientX - dragStartRef.current.x;
      const newY = e.touches[0].clientY - dragStartRef.current.y;
      if (Math.abs(newX - position.x) > 2 || Math.abs(newY - position.y) > 2) {
        hasDraggedRef.current = true;
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setPosition({ x: newX, y: newY });
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = 0;
  };

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

  // Keyboard escape listener to close modal or reset zoom
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (scale > 1) {
          resetZoom();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, scale, resetZoom]);

  // Match all tuskers if multiple are featured in this photograph
  const allMatchedTuskers = useMemo(() => {
    if (!photo) return tusker ? [tusker] : [];
    const sourceText = `${photo.tuskerName || ''} ${photo.title || ''} ${photo.specialNote || ''} ${photo.description || ''}`;
    const idMatches = Array.from(sourceText.matchAll(/\b(T\d{2,4})\b/gi)).map((m) => m[1].toUpperCase());
    const uniqueIds = Array.from(new Set(idMatches));

    const matched = [];
    if (tuskersList && tuskersList.length > 0) {
      // 1. Match by ID from text
      for (const id of uniqueIds) {
        const found = tuskersList.find((t) => t.id.toUpperCase() === id);
        if (found && !matched.some((m) => m.id === found.id)) {
          matched.push(found);
        }
      }

      // 2. Direct photo.tuskerId match
      if (photo.tuskerId) {
        const directId = String(photo.tuskerId).toUpperCase().trim();
        const found = tuskersList.find((t) => t.id.toUpperCase() === directId);
        if (found && !matched.some((m) => m.id === found.id)) {
          matched.push(found);
        }
      }

      // 3. Fallback name match if no IDs found
      if (matched.length === 0) {
        const lowerSource = sourceText.toLowerCase();
        for (const t of tuskersList) {
          const tname = String(t.name || '').toLowerCase().trim();
          if (tname.length >= 4 && lowerSource.includes(tname)) {
            if (!matched.some((m) => m.id === t.id)) {
              matched.push(t);
            }
          }
        }
      }
    }

    if (matched.length > 0) return matched;
    if (tusker) return [tusker];
    return [];
  }, [photo, tuskersList, tusker]);

  if (!photo) return null;

  // Resolve Tusker / Observation display title
  const tuskerDisplayName = (() => {
    if (allMatchedTuskers.length > 1) {
      // If multiple tuskers were found, show full names of all tuskers
      return allMatchedTuskers.map((t) => `${t.id} - ${t.name}`).join(' & ');
    }
    if (allMatchedTuskers.length === 1) {
      const t = allMatchedTuskers[0];
      const customTitle = photo.title && photo.title !== photo.tuskerName ? photo.title : null;
      if (customTitle && !customTitle.includes(t.id)) {
        return `${t.id} - ${t.name}: ${customTitle}`;
      }
      return `${t.id} - ${t.name}`;
    }
    return photo.tuskerName || photo.title || 'Wild Tusker';
  })();

  const locationTaken = photo.location || tusker?.location || '';
  const formattedDate = formatDisplayDate(photo.date);
  const rawPhotographer = photo.photographer || photo.author || photo.sharedBy || '';
  const photographerName =
    rawPhotographer === 'WTS Research Team' || rawPhotographer === 'WTS Team'
      ? 'WTS Admin'
      : rawPhotographer;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-2.5 sm:p-5 md:p-6 overflow-hidden select-none animate-fade-in"
      onClick={onClose}
    >
      {/* ── Top Bar: Zoom Controls & Close Button ── */}
      <div className="w-full flex justify-between items-center z-50 pt-1 sm:pt-0 landscape:pt-0 px-1 gap-2">
        {/* Zoom Controls (Mobile & Desktop) */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-black/60 backdrop-blur-md border border-white/20 rounded-full px-2 sm:px-2.5 py-1 landscape:py-0.5 shadow-lg" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={zoomOut}
            disabled={scale <= 1}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none border-none bg-transparent cursor-pointer transition-colors p-0"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut size={15} />
          </button>
          <span className="font-mono text-[0.72rem] sm:text-xs font-bold text-[#c69b55] min-w-[34px] sm:min-w-[38px] text-center select-none">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={zoomIn}
            disabled={scale >= 5}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none border-none bg-transparent cursor-pointer transition-colors p-0"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn size={15} />
          </button>
          {scale > 1 && (
            <button
              type="button"
              onClick={resetZoom}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 border-none bg-transparent cursor-pointer transition-colors p-0 ml-0.5"
              title="Reset Zoom"
              aria-label="Reset zoom"
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-9 h-9 sm:w-10 sm:h-10 landscape:w-8 landscape:h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 backdrop-blur-md cursor-pointer transition-all shadow-lg hover:scale-105 active:scale-95 shrink-0"
          title="Close (Esc)"
          aria-label="Close photo view"
        >
          <X size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* ── Center Area: Full View Photo with Zoom and Pan ── */}
      <div
        className="flex-1 w-full flex items-center justify-center min-h-0 my-auto py-1 sm:py-2 landscape:py-0.5 relative overflow-hidden select-none"
        style={{
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          touchAction: 'none',
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            if (scale === 1) onClose();
            else resetZoom();
            return;
          }
          e.stopPropagation();
          if (hasDraggedRef.current) {
            hasDraggedRef.current = false;
            return;
          }
          if (scale === 1) setScale(2.5);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          toggleZoom(e);
        }}
      >
        <img
          src={photo.imageUrl}
          alt={tuskerDisplayName}
          draggable={false}
          className="max-w-full max-h-[72vh] sm:max-h-[78vh] md:max-h-[82vh] landscape:max-h-[85vh] w-auto h-auto object-contain rounded-xl sm:rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.95)] select-none border border-white/10 will-change-transform"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)',
          }}
        />
      </div>

      {/* ── Bottom Bar: Full Names, Location, Date, Author & Tusker Profiles ── */}
      <div
        className="w-full max-w-[1100px] mx-auto z-50 mt-1 sm:mt-2 landscape:mt-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-black/92 via-[#0b1c14]/94 to-black/92 backdrop-blur-xl border border-white/15 rounded-xl sm:rounded-2xl px-3 sm:px-6 md:px-7 py-2 sm:py-4 landscape:py-1.5 shadow-2xl flex flex-col md:flex-row landscape:flex-row items-center justify-between gap-1.5 sm:gap-3 text-center md:text-left landscape:text-left">

          {/* Left: T-Numbers & Full Names of Tuskers */}
          <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0 flex-1">
            <h2 className="font-serif text-sm sm:text-[1.15rem] md:text-[1.25rem] font-bold text-white tracking-wide m-0 drop-shadow-sm leading-snug break-words">
              {tuskerDisplayName}
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 sm:gap-x-4 gap-y-1 text-[0.72rem] sm:text-[0.85rem] text-[#d4ded8] font-sans">
              {locationTaken && (
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <MapPin size={13} className="text-accent shrink-0" />
                  <span>{locationTaken}</span>
                </span>
              )}

              {formattedDate && (
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <Calendar size={13} className="text-accent shrink-0" />
                  <span>{formattedDate}</span>
                </span>
              )}

              {photographerName && (
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <Camera size={13} className="text-accent shrink-0" />
                  <span>
                    Photo by <strong className="text-white font-semibold">{photographerName}</strong>
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Right: Quick Actions (Admin Moderation & Tusker Profile Links with Names) */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-1.5 sm:gap-2 shrink-0">
            {isAdmin && (
              <>
                {onEdit && (
                  <button
                    onClick={() => onEdit(photo)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-sans text-[0.72rem] sm:text-xs font-semibold py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg border-none cursor-pointer flex items-center gap-1 sm:gap-1.5 shadow-sm transition-colors"
                    title="Edit details"
                  >
                    <Pencil size={12} />
                    <span>Edit</span>
                  </button>
                )}
                {photo.status === 'pending' && onApprove && (
                  <button
                    onClick={() => {
                      onApprove(photo.id || photo);
                      onClose();
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-[0.72rem] sm:text-xs font-semibold py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg border-none cursor-pointer flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <CheckCircle2 size={12} />
                    <span>Approve</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete(photo.id || photo);
                      onClose();
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-sans text-[0.72rem] sm:text-xs font-semibold py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg border-none cursor-pointer flex items-center gap-1 shadow-sm transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                )}
              </>
            )}

            {/* Profile links showing each tusker's name */}
            {allMatchedTuskers.map((t) => (
              <Link
                key={t.id}
                to={`/tuskers/${t.id.toLowerCase()}`}
                state={{ from: fromPath }}
                className="bg-white/10 hover:bg-white/20 text-[#f5ecd7] hover:text-white font-sans text-[0.72rem] sm:text-xs font-semibold py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg border border-white/20 transition-all flex items-center gap-1 sm:gap-1.5 no-underline shadow-xs shrink-0"
              >
                <span>{allMatchedTuskers.length > 1 ? `${t.id} - ${t.name} Profile` : (t.name ? `${t.name} Profile` : 'Tusker Profile')}</span>
                <ExternalLink size={11} />
              </Link>
            ))}
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
