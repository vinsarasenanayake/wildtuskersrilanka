/**
 * @file OurProjects.jsx
 * @description Conservation projects, outreach initiatives, and expedition timelines
 * conducted by the Wild Tuskers Sri Lanka team. Displays upcoming and past events
 * with professional justified typography, scrollable descriptions, dedicated photo galleries,
 * full-screen lightbox exploration, and admin moderation controls.
 */

import React, { useEffect, useLayoutEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectFeed } from '../../controllers/useProjects';
import {
  Calendar,
  PlusCircle,
  Edit3,
  Trash2,
  User,
  Clock,
  MapPin,
  CheckCircle2,
  Image as ImageIcon,
  ZoomIn,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  ExternalLink,
} from 'lucide-react';
import ImageLightboxModal from '../components/ImageLightboxModal';
import PdfDownloadConfirmModal from '../components/PdfDownloadConfirmModal';

function formatEventDate(dateStr) {
  if (!dateStr) return '';
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;
  const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
  return dateObj.toLocaleDateString('en-US', options);
}

function parseImages(imageField) {
  if (!imageField) return [];
  if (Array.isArray(imageField)) return imageField.filter(Boolean);
  return String(imageField)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

function orderDescriptionLanguages(text) {
  if (!text) return text;
  const hasSinhala = /[\u0D80-\u0DFF]/.test(text);
  const hasLatin = /[a-zA-Z]/.test(text);
  if (!hasSinhala || !hasLatin) return text;

  // Split by divider or double newlines
  const parts = text.split(/(?:^[━─=\-_]{6,}$|\n{2,}[━─=\-_]{6,}\n{2,}|\n{3,})/m);
  if (parts.length >= 2) {
    const firstPart = parts[0].trim();
    const isFirstSinhala = /[\u0D80-\u0DFF]/.test(firstPart) && !/[a-zA-Z]{10,}/.test(firstPart);
    if (isFirstSinhala) {
      const sinhalaParts = [];
      const englishParts = [];
      parts.forEach((p) => {
        const trimmed = p.trim();
        if (!trimmed) return;
        const sinhalaChars = (trimmed.match(/[\u0D80-\u0DFF]/g) || []).length;
        const englishChars = (trimmed.match(/[a-zA-Z]/g) || []).length;
        if (sinhalaChars > englishChars) {
          sinhalaParts.push(trimmed);
        } else {
          englishParts.push(trimmed);
        }
      });
      if (englishParts.length > 0 && sinhalaParts.length > 0) {
        return `${englishParts.join('\n\n')}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${sinhalaParts.join('\n\n')}`;
      }
    }
  }
  return text;
}

function renderJustifiedParagraphs(rawText) {
  if (!rawText) return null;
  const text = orderDescriptionLanguages(rawText);
  const paragraphs = text
    .split(/\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return (
      <p
        className="font-sans text-[0.84rem] sm:text-[0.92rem] text-[#374151] leading-[1.8] text-justify m-0"
        style={{ textAlign: 'justify', textJustify: 'inter-word' }}
      >
        {text}
      </p>
    );
  }

  return paragraphs.map((para, idx) => {
    if (/^[━─=\-_]{6,}$/.test(para)) {
      return (
        <div key={idx} className="my-2.5 border-t border-[#e5e7eb]" role="separator" />
      );
    }
    return (
      <p
        key={idx}
        className="font-sans text-[0.84rem] sm:text-[0.92rem] text-[#374151] leading-[1.8] text-justify m-0"
        style={{ textAlign: 'justify', textJustify: 'inter-word' }}
      >
        {para}
      </p>
    );
  });
}

function PhotosScrollRow({ images, event, onPhotoClick }) {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Smooth mouse drag & touch state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const movedDistanceRef = useRef(0);
  const [isGrabbing, setIsGrabbing] = useState(false);

  const checkScroll = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll, images.length]);

  const scrollByAmount = (direction) => {
    if (!rowRef.current) return;
    const offset = direction === 'left' ? -280 : 280;
    rowRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(checkScroll, 320);
  };

  /* ── Mouse Drag-to-Scroll Handlers ── */
  const handleMouseDown = (e) => {
    if (e.button !== 0 || !rowRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - rowRef.current.offsetLeft;
    scrollLeftRef.current = rowRef.current.scrollLeft;
    movedDistanceRef.current = 0;
    setIsGrabbing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !rowRef.current) return;
    e.preventDefault();
    const x = e.pageX - rowRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    movedDistanceRef.current = Math.abs(x - startXRef.current);
    rowRef.current.scrollLeft = scrollLeftRef.current - walk;
    checkScroll();
  };

  const handleMouseUpOrLeave = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsGrabbing(false);
  };

  const handleCardClick = (imgUrl, event) => {
    // If the user dragged to scroll (moved > 6px), do not trigger lightbox
    if (movedDistanceRef.current > 6) return;
    onPhotoClick(imgUrl, event);
  };

  return (
    <div className="pt-2 flex flex-col gap-2 relative">
      <div className="flex items-center justify-between">
        <span className="font-sans text-[0.72rem] sm:text-[0.78rem] font-bold text-[#777777] uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon size={14} className="text-accent shrink-0" />
          <span>Project Photographs ({images.length})</span>
        </span>
        <div className="flex items-center gap-2">
          {images.length > 2 && (
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollByAmount('left')}
                disabled={!canScrollLeft}
                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center text-gray-700 border-none cursor-pointer transition-all"
                aria-label="Scroll photos left"
                title="Scroll left"
              >
                <ChevronLeft size={13} />
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount('right')}
                disabled={!canScrollRight}
                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center text-gray-700 border-none cursor-pointer transition-all"
                aria-label="Scroll photos right"
                title="Scroll right"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          )}
          <span className="text-[0.7rem] sm:text-[0.75rem] text-[#888888]">
            Click to enlarge
          </span>
        </div>
      </div>

      {/* Horizontally scrollable photos in one line with touch and mouse drag */}
      <div
        ref={rowRef}
        onScroll={checkScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2.5 pt-1 overscroll-contain select-none ${
          isGrabbing ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          scrollbarColor: '#c5a059 transparent',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {images.map((imgUrl, idx) => (
          <div
            key={idx}
            onClick={() => handleCardClick(imgUrl, event)}
            className="group relative w-[160px] sm:w-[200px] md:w-[230px] aspect-[4/3] rounded-xl overflow-hidden bg-[#f3f4f6] border border-[#e5e7eb] shadow-2xs shrink-0 select-none"
          >
            <img
              src={imgUrl}
              alt={`${event.title} photograph ${idx + 1}`}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              className="w-full h-full object-cover pointer-events-none transition-transform duration-300 group-hover:scale-105 select-none"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
              <ZoomIn size={18} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ event, isAdmin, onEdit, onDelete, onPhotoClick }) {
  const images = parseImages(event.image);
  const isUpcoming = event.type === 'upcoming';
  const [showPdfModal, setShowPdfModal] = useState(false);

  return (
    <article className="bg-white rounded-2xl border border-[#e5e7eb] p-4 sm:p-6 md:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col gap-3.5 sm:gap-4 relative">
      {/* Top Meta Bar */}
      <div className="flex flex-col gap-2 pb-3 border-b border-[#f0f2f0]">
        {/* Row 1: Status badge and Date */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.7rem] sm:text-[0.75rem] font-bold uppercase tracking-wider ${
                isUpcoming
                  ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
              }`}
            >
              {isUpcoming ? <Clock size={11} /> : <CheckCircle2 size={11} />}
              <span>{isUpcoming ? 'Upcoming Event' : 'Completed Project'}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 font-sans text-[0.75rem] sm:text-[0.82rem] font-semibold text-accent">
              <Calendar size={13} className="shrink-0" />
              <span>{formatEventDate(event.date)}</span>
            </span>

            {event.time && (
              <span className="inline-flex items-center gap-1.5 font-sans text-[0.75rem] sm:text-[0.82rem] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <Clock size={12} className="shrink-0 text-emerald-700" />
                <span>{event.time}</span>
              </span>
            )}

            {event.location && (
              <span className="inline-flex items-center gap-1.5 font-sans text-[0.75rem] sm:text-[0.82rem] font-medium text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                <MapPin size={12} className="shrink-0 text-amber-600" />
                <span>{event.location}</span>
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Organizer on left, Admin action buttons on right */}
        <div className="flex items-center justify-between gap-2 flex-wrap w-full">
          {event.sharedBy ? (
            <span className="inline-flex items-center gap-1.5 font-sans text-[0.75rem] sm:text-[0.82rem] text-[#6b7280] min-w-0">
              <User size={13} className="text-[#9ca3af] shrink-0" />
              <span>
                Organized by <strong className="text-[#374151] font-semibold">{event.sharedBy}</strong>
              </span>
            </span>
          ) : (
            <span />
          )}

          {isAdmin && (
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              <button
                type="button"
                onClick={() => onEdit(event.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 font-sans text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                title={`Edit "${event.title}"`}
                aria-label={`Edit ${event.title}`}
              >
                <Edit3 size={13} className="shrink-0 text-accent" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(event)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 font-sans text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                title={`Delete "${event.title}"`}
                aria-label={`Delete ${event.title}`}
              >
                <Trash2 size={13} className="shrink-0 text-rose-500" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Project Title */}
      <h3 className="font-sans text-base sm:text-lg md:text-xl font-bold text-[#111827] leading-snug m-0">
        {event.title}
      </h3>

      {/* Description: Scrollable with Justified Paragraphs */}
      {event.description && (
        <div
          tabIndex={0}
          role="region"
          aria-label={`Description for ${event.title}`}
          className="max-h-[190px] sm:max-h-[230px] overflow-y-auto pr-2 sm:pr-3 flex flex-col gap-2.5 overscroll-contain focus:outline-hidden"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#c5a059 transparent',
          }}
        >
          {renderJustifiedParagraphs(event.description)}
        </div>
      )}

      {/* Attached Document / Publication Download Card */}
      {((event.title && event.title.toLowerCase().includes('kalawewa') && event.title.toLowerCase().includes('identification')) || event.pdfUrl) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-[#fafbfa] border border-[#e5e7eb] shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center shrink-0">
              <FileText size={20} className="text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-[0.88rem] font-bold text-[#111827] truncate">
                {event.title}
              </div>
              <div className="text-[11px] sm:text-xs text-[#6b7280] flex items-center gap-2 mt-0.5">
                <span className="font-semibold text-emerald-800">Official Field Guide</span>
                <span>·</span>
                <span>PDF (83.6 MB)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
            <a
              href={event.pdfUrl || "/documents/wts_kalawewa_identification_guide_2018.pdf"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-[#111827] font-bold text-xs sm:text-[0.84rem] border border-[#d1d5db] shadow-2xs transition-all no-underline cursor-pointer text-center"
              title="Open publication in new tab"
            >
              <ExternalLink size={15} />
              <span>View Guide</span>
            </a>

            <button
              type="button"
              onClick={() => setShowPdfModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-primary font-bold text-xs sm:text-[0.84rem] shadow-xs transition-all border-none cursor-pointer text-center"
            >
              <Download size={15} />
              <span>Download Guide (PDF · 83.6 MB)</span>
            </button>
          </div>

          {showPdfModal && (
            <PdfDownloadConfirmModal
              isOpen={showPdfModal}
              onClose={() => setShowPdfModal(false)}
              pdfUrl={event.pdfUrl || "/documents/wts_kalawewa_identification_guide_2018.pdf"}
              title={event.title || "Kalawewa Tusker Identification Guide (2018)"}
              fileSize="83.6 MB"
              filename="WTS_Kalawewa_Identification_Guide_2018.pdf"
            />
          )}
        </div>
      )}

      {/* Images Gallery: Rendered Under the Texts (Scrollable in one line) */}
      {images.length > 0 && (
        <PhotosScrollRow
          images={images}
          event={event}
          onPhotoClick={onPhotoClick}
        />
      )}
    </article>
  );
}

export default function OurProjects() {
  const navigate = useNavigate();
  const { upcomingEvents, pastEvents, loading, isAdmin, removeEvent } = useProjectFeed();

  const [selectedYear, setSelectedYear] = useState('ALL');
  const [actionNotice, setActionNotice] = useState(null);
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState(null);

  // Compute available years for past events (sorted descending)
  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    pastEvents.forEach((ev) => {
      const yr = ev.date ? new Date(ev.date).getFullYear().toString() : '';
      if (yr) yearsSet.add(yr);
    });
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [pastEvents]);

  // Filter past events by selected year
  const filteredPastEvents = useMemo(() => {
    if (selectedYear === 'ALL') return pastEvents;
    return pastEvents.filter((ev) => {
      if (!ev.date) return false;
      return new Date(ev.date).getFullYear().toString() === selectedYear;
    });
  }, [pastEvents, selectedYear]);

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Our Projects';
  }, []);

  // Persist scroll position across page reloads
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 0) {
            try {
              sessionStorage.setItem('wts_projects_scroll', String(window.scrollY));
            } catch {}
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Restore scroll position on reload without jumping to top
  useLayoutEffect(() => {
    let savedY = null;
    try {
      savedY = sessionStorage.getItem('wts_projects_scroll');
    } catch {}
    if (savedY) {
      const y = parseInt(savedY, 10);
      if (!isNaN(y) && y > 0) {
        window.scrollTo({ top: y, behavior: 'instant' });
        const frame = requestAnimationFrame(() => {
          window.scrollTo({ top: y, behavior: 'instant' });
        });
        const timer = setTimeout(() => {
          window.scrollTo({ top: y, behavior: 'instant' });
        }, 50);
        return () => {
          cancelAnimationFrame(frame);
          clearTimeout(timer);
        };
      }
    }
  }, [upcomingEvents.length, pastEvents.length]);

  const handleEdit = (id) => {
    navigate(`/admin/edit-event/${id}`);
  };

  const handleDelete = async (event) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${event.title}"?\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await removeEvent(event.id);
      setActionNotice({
        type: 'success',
        message: `Project "${event.title}" has been deleted successfully.`
      });
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err) {
      console.error('Failed to delete event:', err);
      setActionNotice({
        type: 'error',
        message: `Failed to delete project: ${err.message || 'Please try again.'}`
      });
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handlePhotoClick = (imgUrl, event) => {
    setActiveLightboxPhoto({
      imageUrl: imgUrl,
      title: event.title,
      date: event.date,
      author: event.sharedBy,
      item: event,
    });
  };

  return (
    <div className="bg-[#f0f2f5] min-h-screen pt-[calc(68px+1.5rem)] sm:pt-[calc(80px+2.5rem)] pb-20">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 flex flex-col gap-6 sm:gap-8">

        {/* Action Notice Toast */}
        {actionNotice && (
          <div
            className={`p-3.5 sm:p-4 rounded-xl flex items-center justify-between shadow-sm animate-fade-in ${
              actionNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5 font-sans text-xs sm:text-sm font-medium">
              {actionNotice.type === 'success' ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-rose-600 shrink-0" />
              )}
              <span>{actionNotice.message}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="p-1 text-gray-500 hover:text-gray-800 bg-none border-none cursor-pointer"
              aria-label="Dismiss notice"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Page Title */}
        <div className="flex flex-col items-center justify-center text-center pb-2 border-b border-[#e5e7eb] gap-2.5">
          <h1 className="font-sans text-[clamp(1.25rem,4.5vw,2.75rem)] font-bold text-[#111111] m-0 tracking-tight leading-snug whitespace-nowrap text-center">
            Our Projects
          </h1>
          <p className="font-sans text-sm sm:text-[0.98rem] md:text-[1.02rem] text-[#555555] leading-relaxed max-w-3xl mx-auto m-0 text-center">
            Conservation begins with knowledge. For more than a decade, Wild Tuskers Sri Lanka has led initiatives to identify, document, and monitor the island’s rare tusked elephants, creating valuable resources that support research, wildlife management, and conservation efforts. Each project showcased below is part of our mission to secure a future for Sri Lanka’s iconic tuskers, transforming passion, science, and field experience into meaningful conservation impact.
          </p>
        </div>

        {/* Upcoming Events Section (Hidden for visitors if empty) */}
        {(isAdmin || upcomingEvents.length > 0) && (
          <section className="flex flex-col gap-4">
            {/* Header Row: Stacks full-width action button on mobile portrait */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-sans text-[0.95rem] sm:text-[1.2rem] font-bold text-[#111111] m-0 whitespace-nowrap shrink-0 flex items-center gap-2">
                <span>Upcoming Events</span>
                {upcomingEvents.length > 0 && (
                  <span className="font-sans text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    {upcomingEvents.length}
                  </span>
                )}
              </h2>
              {isAdmin && (
                <div className="flex gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    className="w-full sm:w-auto bg-accent text-primary font-semibold text-xs sm:text-[0.88rem] px-3 sm:px-4 py-2.5 sm:py-2 rounded-[6px] inline-flex items-center justify-center gap-1.5 border-none cursor-pointer hover:bg-accent-hover transition-colors shrink-0 whitespace-nowrap shadow-sm text-center"
                    onClick={() => navigate('/admin/create-event')}
                  >
                    <PlusCircle size={14} className="shrink-0" />
                    <span>Create Project / Event</span>
                  </button>
                </div>
              )}
            </div>

            {loading && upcomingEvents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-xs animate-pulse flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-28 bg-gray-200 rounded-full" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
                <div className="h-6 w-1/2 bg-gray-200 rounded" />
                <div className="h-16 w-full bg-gray-100 rounded" />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 sm:py-12 px-4 gap-3 bg-white rounded-2xl border border-[#e5e7eb] text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Calendar size={24} strokeWidth={1.5} />
                </div>
                <p className="font-sans text-xs sm:text-[0.95rem] text-[#888888] m-0">
                  No upcoming events currently scheduled.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5 sm:gap-6">
                {upcomingEvents.map(event => (
                  <ProjectCard
                    key={event.id}
                    event={event}
                    isAdmin={isAdmin}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPhotoClick={handlePhotoClick}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Past Events Section */}
        <section className={`flex flex-col gap-4 ${(isAdmin || upcomingEvents.length > 0) ? 'pt-4 sm:pt-6 border-t border-[#e5e7eb]' : ''}`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-sans text-base sm:text-[1.2rem] font-bold text-[#111111] m-0 flex items-center gap-2 shrink-0">
              <span>Past Events & Expeditions</span>
              {pastEvents.length > 0 && (
                <span className="font-sans text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                  {filteredPastEvents.length}
                </span>
              )}
            </h2>

            {/* Year Filter Pills: max 5 pills visible (All Years + 4 years), others scroll horizontally on one line */}
            {availableYears.length > 0 && (
              <div
                className="flex items-center flex-nowrap gap-1.5 max-w-full sm:max-w-[396px] overflow-x-auto pb-1 wts-slim-scrollbar"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedYear('ALL')}
                  className={`font-sans text-xs sm:text-[0.88rem] font-bold px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all cursor-pointer border-none shrink-0 ${
                    selectedYear === 'ALL'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white text-[#555555] hover:bg-[#eaeaea] hover:text-[#111111]'
                  }`}
                >
                  All Years
                </button>
                {availableYears.map((year) => (
                  <button
                    type="button"
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`font-sans text-xs sm:text-[0.88rem] font-bold px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all cursor-pointer border-none shrink-0 ${
                      selectedYear === year
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white text-[#555555] hover:bg-[#eaeaea] hover:text-[#111111]'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading && pastEvents.length === 0 ? (
            <div className="flex flex-col gap-5 sm:gap-6">
              {[1, 2].map(n => (
                <div key={n} className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-xs animate-pulse flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-28 bg-gray-200 rounded-full" />
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                  </div>
                  <div className="h-6 w-1/2 bg-gray-200 rounded" />
                  <div className="h-16 w-full bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : filteredPastEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 sm:py-12 px-4 gap-3 bg-white rounded-2xl border border-[#e5e7eb] text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 size={24} strokeWidth={1.5} />
              </div>
              <p className="font-sans text-xs sm:text-[0.95rem] text-[#888888] m-0">
                {selectedYear !== 'ALL'
                  ? `No events recorded for year ${selectedYear}.`
                  : 'No past events recorded yet.'}
              </p>
              {selectedYear !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedYear('ALL')}
                  className="text-accent text-xs sm:text-sm font-semibold hover:underline border-none bg-none cursor-pointer mt-1"
                >
                  Show All Years
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-5 sm:gap-6">
              {filteredPastEvents.map(event => (
                <ProjectCard
                  key={event.id}
                  event={event}
                  isAdmin={isAdmin}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPhotoClick={handlePhotoClick}
                />
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Image Lightbox Modal */}
      {activeLightboxPhoto && (
        <ImageLightboxModal
          photo={activeLightboxPhoto}
          onClose={() => setActiveLightboxPhoto(null)}
          fromPath="/projects"
        />
      )}
    </div>
  );
}
