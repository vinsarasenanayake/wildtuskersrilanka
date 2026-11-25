/**
 * @file PdfDownloadConfirmModal.jsx
 * @description Confirmation modal for downloading large project publications (e.g. Kalawewa Guide).
 * Gives visitors options to confirm download, view inline in a new tab, or cancel.
 */

import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Download, ExternalLink, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import useFocusTrap from '../../hooks/useFocusTrap';

export default function PdfDownloadConfirmModal({
  isOpen,
  onClose,
  pdfUrl = '/documents/wts_kalawewa_identification_guide_2018.pdf',
  title = 'Kalawewa Tusker Identification Guide (2018)',
  fileSize = '83.6 MB',
  filename = 'WTS_Kalawewa_Identification_Guide_2018.pdf',
}) {
  const modalRef = useRef(null);
  const cancelBtnRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useFocusTrap(modalRef, isOpen, {
    initialFocusRef: cancelBtnRef,
    onEscape: onClose,
  });

  if (!isOpen) return null;

  const handleConfirmDownload = () => {
    setDownloading(true);

    try {
      // Trigger native download
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = filename;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloading(false);
        setTimeout(() => {
          onClose();
          setDownloadSuccess(false);
        }, 1200);
      }, 800);
    } catch {
      setDownloading(false);
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-download-title"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl max-w-[480px] w-full p-6 sm:p-7 shadow-2xl border border-gray-200 flex flex-col gap-5 animate-scale-up"
      >
        {/* Header with Close */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-700 flex items-center justify-center shrink-0">
            <FileText size={24} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0 pr-1">
            <h3 id="pdf-download-title" className="font-sans text-[1.12rem] sm:text-[1.22rem] font-bold text-gray-900 m-0 leading-tight">
              Download Project Publication
            </h3>
            <p className="font-sans text-xs sm:text-[0.84rem] text-gray-500 m-0 mt-1">
              Field identification research and documentation
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center border-none cursor-pointer transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Document Info Card */}
        <div className="p-4 rounded-xl bg-[#fafafa] border border-gray-200/80 flex flex-col gap-2">
          <div className="font-sans text-sm font-bold text-gray-900 leading-snug">
            {title}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Official PDF
            </span>
            <span>·</span>
            <span className="font-mono font-medium text-gray-700">Size: {fileSize}</span>
          </div>
        </div>

        {/* Notice about file size */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/70 border border-blue-200/60 text-blue-900 text-xs leading-relaxed">
          <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <span>
            This official field book is <strong>{fileSize}</strong> in high-resolution vector and photo format. Depending on your internet speed, the download may take a moment to complete.
          </span>
        </div>

        {downloadSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Download started! Check your browser's download manager.</span>
          </div>
        )}

        {/* Actions: View and Download in one horizontal line, Cancel below */}
        <div className="flex flex-col gap-2.5 pt-1">
          {/* Row 1: View in Tab & Download side by side */}
          <div className="flex items-center gap-2.5 w-full">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-sans text-xs sm:text-sm font-semibold border border-gray-300 transition-colors flex items-center justify-center gap-1.5 no-underline shadow-2xs"
            >
              <ExternalLink size={14} />
              <span>View in Tab</span>
            </a>

            <button
              type="button"
              onClick={handleConfirmDownload}
              disabled={downloading}
              className="flex-1 py-2.5 px-3 rounded-xl bg-accent hover:bg-accent-hover text-primary font-sans text-xs sm:text-sm font-bold border-none cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-60"
            >
              {downloading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-primary" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Download ({fileSize})</span>
                </>
              )}
            </button>
          </div>

          {/* Row 2: Cancel below those two */}
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-sans text-xs sm:text-sm font-semibold border-none cursor-pointer transition-colors text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
