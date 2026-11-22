import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, MapPin, Camera, Calendar, Pencil, Trash2, CheckCircle2, ExternalLink } from 'lucide-react';
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
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-5 md:p-6 overflow-hidden select-none animate-fade-in"
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

      {/* ── Center Area: Full View Photo with Zoom and Pan ── */}
      <div
        className="flex-1 w-full flex items-center justify-center min-h-0 my-auto py-2 relative overflow-hidden select-none"
        style={{
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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
          className="max-w-full max-h-[72vh] sm:max-h-[78vh] w-auto h-auto object-contain rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.95)] select-none border border-white/10 will-change-transform"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)',
          }}
        />
      </div>

      {/* ── Bottom Bar: Full Names, Location, Date, Author & Tusker Profiles ── */}
      <div
        className="w-full max-w-[1100px] mx-auto z-50 mt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-black/90 via-[#0b1c14]/92 to-black/90 backdrop-blur-xl border border-white/15 rounded-2xl px-5 sm:px-7 py-3.5 sm:py-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">

          {/* Left: T-Numbers & Full Names of Tuskers */}
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <h2 className="font-serif text-base sm:text-[1.2rem] md:text-[1.3rem] font-bold text-white tracking-wide m-0 drop-shadow-sm leading-snug break-words">
              {tuskerDisplayName}
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-xs sm:text-[0.85rem] text-[#d4ded8] font-sans">
              {locationTaken && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-accent shrink-0" />
                  <span>{locationTaken}</span>
                </span>
              )}

              {formattedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-accent shrink-0" />
                  <span>{formattedDate}</span>
                </span>
              )}

              {photographerName && (
                <span className="flex items-center gap-1.5">
                  <Camera size={14} className="text-accent shrink-0" />
                  <span>
                    Photo by <strong className="text-white font-semibold">{photographerName}</strong>
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Right: Quick Actions (Admin Moderation & Tusker Profile Links with Names) */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 shrink-0">
            {isAdmin && (
              <>
                {onEdit && (
                  <button
                    onClick={() => onEdit(photo)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-sans text-xs font-semibold py-2 px-3 rounded-lg border-none cursor-pointer flex items-center gap-1.5 shadow-sm transition-colors"
                    title="Edit details"
                  >
                    <Pencil size={13} />
                    <span>Edit</span>
                  </button>
                )}
                {photo.status === 'pending' && onApprove && (
                  <button
                    onClick={() => {
                      onApprove(photo.id || photo);
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
                      onDelete(photo.id || photo);
                      onClose();
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-sans text-xs font-semibold py-2 px-3 rounded-lg border-none cursor-pointer flex items-center gap-1 shadow-sm transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={13} />
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
                className="bg-white/10 hover:bg-white/20 text-[#f5ecd7] hover:text-white font-sans text-xs font-semibold py-2 px-3.5 rounded-lg border border-white/20 transition-all flex items-center gap-1.5 no-underline shadow-xs shrink-0"
              >
                <span>{allMatchedTuskers.length > 1 ? `${t.id} - ${t.name} Profile` : (t.name ? `${t.name} Profile` : 'Tusker Profile')}</span>
                <ExternalLink size={12} />
              </Link>
            ))}
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
