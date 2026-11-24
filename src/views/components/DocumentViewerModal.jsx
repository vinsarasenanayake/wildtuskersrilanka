/**
 * @file DocumentViewerModal.jsx
 * @description Full-screen presentation and document reading modal.
 * Always displays the full document directly (PowerPoint, Word, PDF, or document images)
 * with keyboard arrow key scrolling (↑/↓/←/→/PageUp/PageDown), touch scroll/swipe gestures
 * for mobile and tablet devices, and viewer engine fallback controls.
 */

import React, { useEffect, useState, useCallback, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  Presentation,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

export default function DocumentViewerModal({ item, onClose }) {
  const titleId = useId();
  const viewerEngine = 'office';
  const [iframeLoading, setIframeLoading] = useState(true);

  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const touchStartYRef = useRef(0);
  const touchStartXRef = useRef(0);

  const fileUrl = item?.fileUrl || '';
  const fileType = (item?.fileType || (fileUrl ? fileUrl.split('.').pop() : 'pptx')).toLowerCase();
  const isPdf = fileType === 'pdf';
  const isOffice = ['pptx', 'ppt', 'docx', 'doc', 'xlsx', 'xls'].includes(fileType);
  const isImageDoc = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileType) || (!fileUrl && Boolean(item?.coverImage));
  const fallbackImageUrl = item?.coverImage || fileUrl;

  // Lock body scroll while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Smooth scroll helper for keyboard and touch controls
  const scrollDocument = useCallback((deltaY, deltaX = 0) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        top: deltaY,
        left: deltaX,
        behavior: 'smooth',
      });
    }
  }, []);

  // Keyboard navigation: Arrow keys (Up, Down, Left, Right), PageUp/Down, Space, Esc
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      const SCROLL_STEP = 120;
      const PAGE_STEP = 450;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollDocument(SCROLL_STEP);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollDocument(-SCROLL_STEP);
      } else if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        scrollDocument(PAGE_STEP);
      } else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        scrollDocument(-PAGE_STEP);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollDocument(0, SCROLL_STEP);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollDocument(0, -SCROLL_STEP);
      } else if (e.key === 'Home') {
        e.preventDefault();
        if (containerRef.current) {
          containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (e.key === 'End') {
        e.preventDefault();
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }
    },
    [onClose, scrollDocument]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Touch gesture support on mobile & tablet devices
  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartYRef.current = e.touches[0].clientY;
      touchStartXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e) => {
    if (!e.touches || !e.touches[0]) return;
    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const diffY = touchStartYRef.current - currentY;
    const diffX = touchStartXRef.current - currentX;

    // Apply smooth scroll delta
    if (containerRef.current) {
      containerRef.current.scrollBy({ top: diffY * 0.8, left: diffX * 0.8 });
    }

    touchStartYRef.current = currentY;
    touchStartXRef.current = currentX;
  };

  // Attempt to focus the iframe once loaded so native office/pdf controls respond to arrows
  const handleIframeLoad = () => {
    setIframeLoading(false);
    try {
      iframeRef.current?.focus();
    } catch {}
  };

  if (!item) return null;

  // Compute viewer iframe URL
  let viewerIframeSrc = '';
  if (isPdf) {
    viewerIframeSrc = `${fileUrl}#toolbar=1&view=FitH`;
  } else if (isOffice) {
    if (viewerEngine === 'office') {
      viewerIframeSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
    } else {
      viewerIframeSrc = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    }
  } else if (!isImageDoc && fileUrl) {
    viewerIframeSrc = fileUrl;
  }

  const formatFileSize = (bytes) => {
    if (!bytes || bytes <= 0) return '';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const getFormatBadge = () => {
    if (fileType === 'pptx' || fileType === 'ppt') return 'POWERPOINT PRESENTATION';
    if (fileType === 'docx' || fileType === 'doc') return 'WORD DOCUMENT';
    if (fileType === 'pdf') return 'PDF DOCUMENT';
    if (isImageDoc) return 'EDUCATIONAL DOCUMENT';
    return fileType.toUpperCase();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-md flex flex-col text-white animate-fade-in select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* ── Top Header / Control Bar ── */}
      <header className="h-[60px] sm:h-[68px] bg-[#071d13]/95 border-b border-white/10 px-3 sm:px-6 flex items-center justify-between shrink-0 gap-2 sm:gap-4 select-none">
        {/* Left: Document Info */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-accent/20 text-accent flex items-center justify-center shrink-0 border border-accent/30">
            {isOffice ? (
              <Presentation size={18} />
            ) : isPdf ? (
              <FileText size={18} />
            ) : (
              <ImageIcon size={18} />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[0.62rem] sm:text-[0.68rem] tracking-wider uppercase font-bold text-accent px-1.5 py-0.5 rounded-sm bg-accent/15 border border-accent/25 shrink-0">
                {getFormatBadge()}
              </span>
            </div>
            <h2 id={titleId} className="font-sans text-xs sm:text-sm lg:text-base font-bold text-white truncate m-0">
              {item.title}
            </h2>
          </div>
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Download Presentation File Button */}
          {fileUrl && (
            <a
              href={fileUrl}
              download={item.fileName || 'presentation'}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-lg inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-primary bg-accent hover:bg-accent-hover transition-all no-underline shadow-xs cursor-pointer shrink-0"
              title="Download presentation file"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Download</span>
              {item.fileSize > 0 && (
                <span className="hidden xl:inline text-[0.68rem] opacity-80">
                  ({formatFileSize(item.fileSize)})
                </span>
              )}
            </a>
          )}

          {/* Close Viewer Modal */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-red-600/80 hover:bg-red-600 text-white flex items-center justify-center transition-all cursor-pointer border-none shadow-xs shrink-0"
            aria-label="Close reader (Esc)"
            title="Close reader (Esc)"
          >
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>
      </header>

      {/* ── Main Full-Document View Area ── */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-auto bg-[#0c120e] flex items-center justify-center overscroll-contain"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y pan-x',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {isImageDoc ? (
          /* Photographic / Image Document Full View */
          <div className="w-full h-full flex flex-col items-center justify-center p-3 sm:p-6 overflow-auto">
            <img
              src={fallbackImageUrl}
              alt={item.title}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-all"
            />
          </div>
        ) : (
          /* Office / PDF / Full Document Iframe Reader */
          <div className="w-full h-full relative flex flex-col">
            {iframeLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0c120e] text-white/70 gap-3">
                <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="font-sans text-xs sm:text-sm">
                  Loading full document ({viewerEngine === 'office' ? 'Office Web Reader' : 'Google Docs Reader'})...
                </span>
                <span className="text-[0.72rem] text-white/40 max-w-xs text-center">
                  Large presentations and documents may take a few moments to render.
                </span>
              </div>
            )}
            <iframe
              ref={iframeRef}
              key={viewerIframeSrc}
              src={viewerIframeSrc}
              title={item.title}
              className="w-full h-full border-none bg-white flex-1"
              onLoad={handleIframeLoad}
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* ── Bottom Information Footer ── */}
      <footer className="bg-[#071d13] border-t border-white/10 px-4 py-2 sm:py-2.5 flex items-center justify-between text-xs text-white/60 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span>{item.author || 'Wild Tuskers Sri Lanka Research Team'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">
            Use <kbd className="bg-white/15 px-1 py-0.5 rounded text-[0.7rem] text-white">↑</kbd> <kbd className="bg-white/15 px-1 py-0.5 rounded text-[0.7rem] text-white">↓</kbd> or touch to scroll
          </span>
          <span className="hidden md:inline">•</span>
          <span className="hidden sm:inline">
            Press <kbd className="bg-white/15 px-1 py-0.5 rounded text-[0.7rem] text-white">Esc</kbd> to exit full view
          </span>
        </div>
      </footer>
    </div>,
    document.body
  );
}
