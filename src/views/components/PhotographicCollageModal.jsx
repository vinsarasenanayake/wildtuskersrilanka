/**
 * @file PhotographicCollageModal.jsx
 * @description Interactive modal to select multiple progression sightings for a tusker
 * in a scrollable left sidebar, inspect tusker details & live collage preview on the right,
 * and download the combined photographic comparison collage as PNG.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Check, Calendar, Loader2 } from 'lucide-react';
import useFocusTrap from '../../hooks/useFocusTrap';

/**
 * Load an image URL safely for Canvas drawing using CORS fetch -> Blob URL
 * so cached non-CORS <img> tags never taint the canvas.
 */
async function loadCorsImage(url) {
  const res = await fetch(url, { mode: 'cors', cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load image (${res.status})`);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Image decode failed'));
      el.src = objectUrl;
    });
    return { img, revoke: () => URL.revokeObjectURL(objectUrl) };
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    throw err;
  }
}

/** Draw an image onto a target rectangle using CSS `object-fit: cover` math. */
function drawCoverImage(ctx, img, dx, dy, dw, dh) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const scale = Math.max(dw / iw, dh / ih);
  const sw = dw / scale;
  const sh = dh / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

export default function PhotographicCollageModal({
  isOpen,
  onClose,
  tusker,
  items = [],
  formatDate,
}) {
  const photoItems = useMemo(() => {
    const sortedSightings = Array.isArray(tusker?.sightings)
      ? [...tusker.sightings].sort(
          (a, b) =>
            String(a.captureDate || '').localeCompare(String(b.captureDate || '')) ||
            (a.id || 0) - (b.id || 0)
        )
      : [];

    return (items || [])
      .map((item, idx) => {
        const rawDate =
          item.date ||
          item.captureDate ||
          (idx === 0
            ? tusker?.listedDate || tusker?.firstRecordedDate || tusker?.firstRecordDate || sortedSightings[0]?.captureDate
            : sortedSightings[idx - 1]?.captureDate) ||
          '';
        const formattedFullDate = rawDate ? formatDate(rawDate) : '';
        const yearLabel = formattedFullDate || item.year || '-';
        const recordLabel =
          item.recordNum === 1 || idx === 0
            ? '1st Record'
            : `Sighting #${item.recordNum ? item.recordNum - 1 : idx}`;
        return {
          ...item,
          _idx: idx,
          yearLabel: String(yearLabel),
          recordLabel,
        };
      })
      .filter((item) => Boolean(item.photo));
  }, [items, tusker, formatDate]);

  const [selectedIndices, setSelectedIndices] = useState(() => photoItems.map((i) => i._idx));
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const containerRef = useRef(null);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndices(photoItems.map((i) => i._idx));
      setDownloadError('');
    }
  }, [isOpen, photoItems]);

  useFocusTrap(containerRef, isOpen, {
    initialFocusRef: closeBtnRef,
    onEscape: () => !downloading && onClose(),
  });

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow === 'hidden' ? '' : prevOverflow || '';
    };
  }, [isOpen]);

  if (!isOpen || !tusker) return null;

  const selectedItems = photoItems.filter((item) => selectedIndices.includes(item._idx));

  const toggleItem = (idx) => {
    setDownloadError('');
    setSelectedIndices((prev) =>
      prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx].sort((a, b) => a - b)
    );
  };

  const tuskerHeaderText = [
    tusker.id,
    tusker.name,
    tusker.sinhala ? `(${tusker.sinhala})` : '',
  ]
    .filter(Boolean)
    .join(' • ');

  const handleDownload = async () => {
    if (selectedItems.length < 2 || downloading) return;
    setDownloading(true);
    setDownloadError('');

    const loaded = [];
    try {
      for (const item of selectedItems) {
        loaded.push(await loadCorsImage(item.photo));
      }

      const count = selectedItems.length;
      const panelW = count <= 4 ? 380 : count <= 6 ? 320 : 270;
      const panelH = Math.round(panelW * 1.24);
      const gap = 6;
      const outerPad = 24;
      const headerH = 68;
      const footerH = 48;

      const canvasW = outerPad * 2 + count * panelW + (count - 1) * gap;
      const canvasH = outerPad + headerH + panelH + footerH + outerPad;

      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasW, canvasH);

      ctx.fillStyle = '#111111';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const titleFontSize = Math.min(28, Math.max(18, Math.floor((canvasW - outerPad * 2) / 28)));
      ctx.font = `700 ${titleFontSize}px "Segoe UI", system-ui, -apple-system, sans-serif`;
      ctx.fillText(tuskerHeaderText, canvasW / 2, outerPad + headerH / 2 - 4, canvasW - outerPad * 2);

      const imgY = outerPad + headerH;
      const labelY = imgY + panelH + footerH / 2 + 2;
      const yearFontSize = count <= 5 ? 20 : 17;

      selectedItems.forEach((item, i) => {
        const x = outerPad + i * (panelW + gap);
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(x, imgY, panelW, panelH);

        drawCoverImage(ctx, loaded[i].img, x, imgY, panelW, panelH);

        ctx.fillStyle = '#111111';
        ctx.font = `700 ${yearFontSize}px "Segoe UI", system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.yearLabel, x + panelW / 2, labelY, panelW - 12);
      });

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));
      if (!blob) throw new Error('Could not generate collage PNG.');

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeName = String(tusker.name || 'tusker')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      a.href = url;
      a.download = `${String(tusker.id || 'tusker').toLowerCase()}-${safeName}-comparison-collage.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Collage download failed:', err);
      setDownloadError('Could not export collage image. Please try again.');
    } finally {
      loaded.forEach((entry) => entry?.revoke?.());
      setDownloading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={() => !downloading && onClose()}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="collage-modal-title"
        className="w-full max-w-[1140px] bg-white rounded-2xl shadow-2xl border border-[#e5e7eb] overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal Top Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#f8f9fa] border-b border-[#e5e7eb] flex items-center justify-between gap-3 shrink-0">
          <span className="font-sans text-[clamp(0.8rem,3.5vw,0.98rem)] font-bold text-[#111111] whitespace-nowrap truncate">
            Photography Comparison Collage Builder
          </span>
          <button
            ref={closeBtnRef}
            type="button"
            disabled={downloading}
            onClick={onClose}
            aria-label="Close collage builder"
            className="w-8 h-8 rounded-full border-none bg-[#e9ecef] hover:bg-[#dee2e6] text-[#444444] flex items-center justify-center cursor-pointer shrink-0 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* 2-Column Body: Left Scrollable Sighting List | Right Details + Collage Preview */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* LEFT SIDEBAR: Vertical Scrollable Sightings */}
          <div className="w-full md:w-[290px] lg:w-[310px] shrink-0 border-b md:border-b-0 md:border-r border-[#e5e7eb] bg-[#fafbfc] flex flex-col max-h-[260px] md:max-h-none">
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between gap-2 shrink-0 bg-white">
              <span className="font-sans text-xs font-bold text-[#111111]">
                Sightings ({selectedItems.length}/{photoItems.length})
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedIndices(photoItems.map((i) => i._idx))}
                  className="font-sans text-[11px] font-semibold px-2 py-1 rounded bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#333333] border-none cursor-pointer transition-colors"
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIndices([])}
                  className="font-sans text-[11px] font-semibold px-2 py-1 rounded bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#333333] border-none cursor-pointer transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="p-3 overflow-y-auto flex flex-col gap-2.5 flex-1">
              {photoItems.map((item) => {
                const isSelected = selectedIndices.includes(item._idx);
                return (
                  <button
                    key={item.recordNum || item._idx}
                    type="button"
                    onClick={() => toggleItem(item._idx)}
                    className={`w-full text-left rounded-xl overflow-hidden border-2 transition-all cursor-pointer p-2 bg-white flex items-center gap-3 shrink-0 ${
                      isSelected
                        ? 'border-primary shadow-xs ring-1 ring-primary/15'
                        : 'border-[#e5e7eb] opacity-70 hover:opacity-100 hover:border-[#cbd5e1]'
                    }`}
                  >
                    <div className="relative w-18 h-14 rounded-lg bg-[#eef1ee] overflow-hidden shrink-0">
                      <img
                        src={item.photo}
                        alt={`${tusker.name} ${item.yearLabel}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <span className="font-sans text-[11px] font-bold text-primary uppercase tracking-wide">
                        {item.recordLabel}
                      </span>
                      <span className="font-sans text-xs font-bold text-[#111111] flex items-center gap-1">
                        <Calendar size={11} className="text-accent shrink-0" />
                        <span>{item.yearLabel}</span>
                      </span>
                      <span className="font-sans text-[11px] text-[#666666] truncate">
                        {item.location || '-'}
                      </span>
                    </div>
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-primary border-primary text-white'
                          : 'bg-white border-[#cccccc] text-transparent'
                      }`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL: Tusker Details + Combined Collage Preview */}
          <div className="flex-1 min-w-0 p-5 sm:p-6 overflow-y-auto flex flex-col gap-5">
            {/* Tusker Details */}
            <div className="pb-4 border-b border-[#eeeeee]">
              <h2 id="collage-modal-title" className="font-sans text-lg sm:text-xl font-extrabold text-[#111111] m-0 flex items-baseline gap-2 flex-wrap">
                <span className="text-accent font-extrabold">{tusker.id}</span>
                <span>{tusker.name}</span>
                {tusker.sinhala && (
                  <span className="font-normal text-base text-[#666666]">({tusker.sinhala})</span>
                )}
              </h2>
              {tusker.description && (
                <p className="font-sans text-xs sm:text-[0.85rem] text-[#555555] m-0 mt-1.5 line-clamp-3 leading-relaxed">
                  {tusker.description}
                </p>
              )}
            </div>

            {/* Collage Preview */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <h3 className="font-sans text-sm font-bold text-[#111111] m-0">
                  Collage Preview
                </h3>
                <span className="font-sans text-xs text-[#777777]">
                  Select 2 or more sightings{' '}
                  <span className="md:hidden">above</span>
                  <span className="hidden md:inline">on the left</span>
                </span>
              </div>

              {selectedItems.length < 2 ? (
                <div className="flex-1 min-h-[220px] rounded-xl border border-dashed border-[#d1d5db] bg-[#f9fafb] flex items-center justify-center py-10 px-4 text-center font-sans text-xs sm:text-sm text-[#666666]">
                  <span>
                    Select at least <strong>2 sightings</strong>{' '}
                    <span className="md:hidden">above</span>
                    <span className="hidden md:inline">from the left list</span>{' '}
                    to preview your comparison collage.
                  </span>
                </div>
              ) : (
                <div className="rounded-xl border border-[#e5e7eb] bg-white p-3 sm:p-4 shadow-xs overflow-x-auto">
                  <div className={selectedItems.length > 4 ? 'min-w-[460px]' : 'w-full'}>
                    <div className="text-center font-sans text-sm sm:text-base font-bold text-[#111111] pb-2.5">
                      {tuskerHeaderText}
                    </div>
                    <div
                      className="grid gap-[4px] bg-white"
                      style={{ gridTemplateColumns: `repeat(${selectedItems.length}, minmax(0, 1fr))` }}
                    >
                      {selectedItems.map((item) => (
                        <div key={item.recordNum || item._idx} className="flex flex-col">
                          <div className="w-full aspect-[4/5] bg-[#f3f4f6] overflow-hidden">
                            <img
                              src={item.photo}
                              alt={`${tusker.name} ${item.yearLabel}`}
                              className="w-full h-full object-cover block"
                            />
                          </div>
                          <div className="py-1.5 text-center font-sans text-xs sm:text-[0.8rem] font-bold text-[#111111] bg-white">
                            {item.yearLabel}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {downloadError && (
                <p className="font-sans text-xs font-semibold text-red-600 mt-2 mb-0">
                  {downloadError}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#f8f9fa] border-t border-[#e5e7eb] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            disabled={downloading}
            onClick={onClose}
            className="flex-1 sm:flex-initial sm:min-w-[140px] px-6 py-2.5 sm:py-2 rounded-lg border border-[#d1d5db] bg-white hover:bg-[#f3f4f6] text-[#444444] font-sans text-xs sm:text-sm font-semibold cursor-pointer transition-colors text-center"
          >
            Close
          </button>
          <button
            type="button"
            disabled={selectedItems.length < 2 || downloading}
            onClick={handleDownload}
            className="flex-1 sm:flex-initial px-5 py-2.5 sm:py-2 rounded-lg border-none bg-primary hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-sans text-xs sm:text-sm font-semibold cursor-pointer inline-flex items-center justify-center gap-2 shadow-xs transition-all whitespace-nowrap"
          >
            {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            <span>{downloading ? 'Generating Collage…' : 'Download Collage (PNG)'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
