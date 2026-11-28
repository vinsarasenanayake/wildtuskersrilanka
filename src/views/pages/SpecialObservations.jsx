/**
 * @file SpecialObservations.jsx
 * @description In-depth annual field observations documenting significant behaviors,
 * musth cycles, physical developments, and health records of Sri Lanka's wild tuskers.
 * Features year filtering, text searching, admin create/edit/delete, and photo lightbox integration.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Binoculars,
  PlusCircle,
  Calendar,
  Clock,
  MapPin,
  Search,
  Trash2,
  Edit3,
  User,
  Image as ImageIcon,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from 'lucide-react';
import { useSpecialObservationsFeed } from '../../controllers/useSpecialObservations';
import ImageLightboxModal from '../components/ImageLightboxModal';
import BilingualParagraphs from '../components/BilingualParagraphs';
import { formatDisplayTime } from '../../utils/localDate';
import { LOOKALIKE_PAIRS } from '../../data/lookalikePairs';

const DEFAULT_LOOKALIKE_INTRO_EN = [
  'In the field, wild tuskers often share remarkably similar silhouettes, tusk lengths, and head shapes, leading to frequent misidentifications even among experienced observers and wildlife photographers. Systematic morphological identification - focusing on ear venation, top-fold curvatures, tears, facial depigmentation, and tusk angles - is essential to correctly distinguish these lookalike individuals.',
  'This comparative study examines 4 pairs (8 iconic Sri Lankan tuskers) that look remarkably alike at first glance, detailing the key diagnostic features that separate them:',
];

function extractLookalikeIntroParagraphs(description) {
  if (!description || !description.trim()) {
    return DEFAULT_LOOKALIKE_INTRO_EN;
  }

  const lines = description.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const introParas = [];
  let inPairBlock = false;

  for (const line of lines) {
    if (/^[━─\-=_]{3,}$/.test(line)) {
      continue;
    }
    if (/^යුගලය\s*0?[1-4]/i.test(line)) {
      break;
    }
    if (/^Pair\s*0?[1-4]\b/i.test(line)) {
      inPairBlock = true;
      continue;
    }
    if (
      inPairBlock &&
      /^(?:•\s*(?:Left Tusker|Right Tusker|Diagnostic Differences)|-\s*(?:Tusks|Ears|Facial))/i.test(line)
    ) {
      continue;
    }
    inPairBlock = false;
    introParas.push(line);
  }

  const hasEnglishIntro = introParas.some((p) => /[a-zA-Z]{4,}/.test(p));
  if (!hasEnglishIntro) {
    return [...DEFAULT_LOOKALIKE_INTRO_EN, ...introParas];
  }
  return introParas.length > 0 ? introParas : DEFAULT_LOOKALIKE_INTRO_EN;
}

const PAIR_PATTERNS = {
  'pair-01': /wijaya|walagamba/i,
  'pair-02': /agbo|gajabahu/i,
  'pair-03': /missaka|homo/i,
  'pair-04': /devra|parinda/i,
};

const LOOKALIKE_EXPANDED_PAIRS = LOOKALIKE_PAIRS.map((pair) => ({
  pattern: PAIR_PATTERNS[pair.id] || new RegExp(pair.left.id, 'i'),
  idSuffix: pair.id,
  tuskerName: `${pair.left.id} - ${pair.left.name} vs ${pair.right.id} - ${pair.right.name}`,
  location: `${pair.left.range.split('/')[0].trim()} / ${pair.right.range.split('/')[0].trim()}`,
  title: pair.title,
  image: pair.image,
  description: [
    `• Left Tusker: ${pair.left.name} (${pair.left.id}) - Roaming Range: ${pair.left.range}`,
    `• Right Tusker: ${pair.right.name} (${pair.right.id}) - Roaming Range: ${pair.right.range}`,
    pair.titleSi,
    `• වම්පස දළ ඇතා: ${pair.left.nameSi} (${pair.left.id}) - සැරිසරන ප්‍රදේශ: ${pair.left.rangeSi}`,
    `• දකුණුපස දළ ඇතා: ${pair.right.nameSi} (${pair.right.id}) - සැරිසරන ප්‍රදේශ: ${pair.right.rangeSi}`,
  ].join('\n'),
}));

function buildObservationPhotos(item) {
  if (!item.images || item.images.length === 0) return [];
  const isLookalikes = item.id === 5 || /lookalike|alike/i.test(item.title);

  return item.images.map((imgUrl, idx) => {
    let title = item.title;
    let tuskerName = item.tuskerName;
    let hideDate = Boolean(item.hideDate);
    let hideLocation = false;

    if (isLookalikes) {
      hideDate = true;
      hideLocation = true;
      const pairMeta =
        LOOKALIKE_EXPANDED_PAIRS.find((m) => m.pattern.test(imgUrl)) ||
        LOOKALIKE_EXPANDED_PAIRS[idx];
      if (pairMeta) {
        title = pairMeta.title;
        tuskerName = pairMeta.tuskerName;
      }
    }

    return {
      id: `${item.id}_${idx}`,
      imageUrl: imgUrl,
      title,
      tuskerName,
      location: hideLocation ? null : item.location,
      date: hideDate ? null : item.date,
      hideDate,
      hideLocation,
      author: item.author,
      item,
    };
  });
}

function ObservationPhotosScrollRow({ item, obsPhotos, onPhotoClick }) {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
  }, [checkScroll, item.images.length]);

  const scrollByAmount = (direction) => {
    if (!rowRef.current) return;
    const offset = direction === 'left' ? -280 : 280;
    rowRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(checkScroll, 320);
  };

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

  const handleCardClick = (photo) => {
    if (movedDistanceRef.current > 6) return;
    onPhotoClick(photo);
  };

  return (
    <div className="pt-2 flex flex-col gap-2 relative w-full min-w-0 max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="font-sans text-[0.72rem] sm:text-[0.78rem] font-bold text-[#888888] uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon size={14} className="text-accent shrink-0" />
          <span>Observation Photographs ({item.images.length})</span>
        </span>
        <div className="flex items-center gap-2">
          {item.images.length > 2 && (
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

      <div
        ref={rowRef}
        onScroll={checkScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2.5 pt-1 overscroll-contain select-none ${isGrabbing ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          scrollbarColor: '#c5a059 transparent',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {item.images.map((imgUrl, idx) => (
          <div
            key={idx}
            onClick={() => handleCardClick(obsPhotos[idx])}
            className="group relative w-[160px] sm:w-[200px] md:w-[230px] aspect-[4/3] rounded-xl overflow-hidden bg-[#f3f4f6] border border-[#e5e7eb] shadow-2xs shrink-0 select-none cursor-pointer"
          >
            <img
              src={imgUrl}
              alt={`${item.tuskerName} observation photograph ${idx + 1}`}
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

function ObservationPhotosGallery({ item, setActiveLightboxPhoto }) {
  if (!item.images || item.images.length === 0) return null;
  const count = item.images.length;
  const obsPhotos = buildObservationPhotos(item);

  // If more than 4 images: horizontal scroll row with touch and mouse drag (matching Our Projects)
  if (count > 4) {
    return (
      <ObservationPhotosScrollRow
        item={item}
        obsPhotos={obsPhotos}
        onPhotoClick={(photo) => setActiveLightboxPhoto({ ...photo, allPhotos: obsPhotos })}
      />
    );
  }

  return (
    <div className="pt-2 flex flex-col gap-2 w-full min-w-0 max-w-full">
      <div className="flex items-center justify-between">
        <span className="font-sans text-[0.72rem] sm:text-[0.78rem] font-bold text-[#888888] uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon size={14} className="text-accent shrink-0" />
          <span>Observation Photographs ({count})</span>
        </span>
        <span className="text-[0.7rem] sm:text-[0.75rem] text-[#888888]">
          Click to enlarge
        </span>
      </div>

      {/* 1 Image: Full view matching the full length/width of the section */}
      {count === 1 && (
        <div
          onClick={() => setActiveLightboxPhoto({ ...obsPhotos[0], allPhotos: obsPhotos })}
          className="relative w-full rounded-2xl overflow-hidden bg-[#f8f9fa] border border-[#e5e7eb] cursor-pointer group shadow-2xs"
        >
          <img
            src={item.images[0]}
            alt={`${item.tuskerName} observation photograph`}
            className="w-full h-auto max-h-[580px] object-contain block mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            <ExternalLink size={22} />
          </div>
        </div>
      )}

      {/* 2 Images: 50% 50% of the section length */}
      {count === 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {item.images.map((imgUrl, i) => (
            <div
              key={i}
              onClick={() => setActiveLightboxPhoto({ ...obsPhotos[i], allPhotos: obsPhotos })}
              className="relative aspect-[16/10] sm:aspect-[4/3] rounded-xl overflow-hidden bg-[#f8f9fa] border border-[#e5e7eb] cursor-pointer group shadow-2xs"
            >
              <img
                src={imgUrl}
                alt={`${item.tuskerName} observation ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <ExternalLink size={18} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3 Images: 3/3 of the section length */}
      {count === 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {item.images.map((imgUrl, i) => (
            <div
              key={i}
              onClick={() => setActiveLightboxPhoto({ ...obsPhotos[i], allPhotos: obsPhotos })}
              className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#f8f9fa] border border-[#e5e7eb] cursor-pointer group shadow-2xs"
            >
              <img
                src={imgUrl}
                alt={`${item.tuskerName} observation ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <ExternalLink size={18} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4 Images: 4 images across the section like Looks Alike */}
      {count === 4 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {item.images.map((imgUrl, i) => (
            <div
              key={i}
              onClick={() => setActiveLightboxPhoto({ ...obsPhotos[i], allPhotos: obsPhotos })}
              className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#f8f9fa] border border-[#e5e7eb] cursor-pointer group shadow-2xs"
            >
              <img
                src={imgUrl}
                alt={`${item.tuskerName} observation ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <ExternalLink size={18} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SpecialObservations({ embedded = false }) {
  const navigate = useNavigate();
  const {
    loading,
    observations,
    allObservations = [],
    searchQuery,
    setSearchQuery,
    canAddObservation,
    isAdmin,
    handleDelete,
  } = useSpecialObservationsFeed();

  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState(null);

  useEffect(() => {
    if (!embedded) {
      document.title = 'Wild Tuskers Sri Lanka | Special Observations';
    }
  }, [embedded]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        if (monthIndex >= 0 && monthIndex < 12) {
          return `${day} ${months[monthIndex]} ${year}`;
        }
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  const mainContent = (
    <>
      <div className={embedded ? "w-full min-w-0 max-w-full flex flex-col gap-6" : "w-full max-w-[1100px] mx-auto px-4 sm:px-6 flex flex-col gap-6 sm:gap-8 min-w-0"}>
        {/* Page Header (standalone only) */}
        {!embedded && (
          <div className="flex flex-col items-center justify-center text-center mb-6 pb-6 border-b border-[#e5e7eb] gap-3">
            <h1 className="font-sans text-[clamp(1.15rem,4.5vw,2.85rem)] font-bold text-[#111111] m-0 tracking-tight leading-snug whitespace-nowrap text-center">
              Special Observations Over The Years
            </h1>
            <p className="font-sans text-sm sm:text-[0.98rem] md:text-[1.02rem] text-[#555555] leading-relaxed max-w-3xl mx-auto m-0 text-center">
              In-depth annual field observations documenting significant behaviors, musth cycles, physical developments, and health records of Sri Lanka's wild tuskers.
            </p>
          </div>
        )}

        {/* Controls Bar: Search (Left) + Add Observation (Right) - Visible strictly to authenticated admins */}
        {isAdmin && (
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Admin Search Box */}
              <div className="relative w-full sm:max-w-md flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by tusker, title, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 sm:h-10 bg-white border border-[#e2e8f0] rounded-xl sm:rounded-lg pl-9 pr-9 text-xs sm:text-[0.88rem] text-[#111111] placeholder:text-[#999999] outline-none focus:border-accent transition-all shadow-2xs box-border"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 border-none bg-none cursor-pointer p-0 text-base leading-none"
                    aria-label="Clear search"
                  >
                    &times;
                  </button>
                )}
              </div>

              {/* Add Special Observation Button */}
              {canAddObservation && (
                <button
                  type="button"
                  onClick={() => navigate('/admin/add-observation')}
                  className="h-10 sm:h-10 bg-accent text-primary font-bold text-xs sm:text-[0.88rem] px-4 sm:px-6 rounded-xl sm:rounded-lg inline-flex items-center justify-center gap-2 border-none cursor-pointer hover:bg-accent-hover transition-colors whitespace-nowrap shadow-xs w-full sm:w-auto shrink-0"
                >
                  <PlusCircle size={16} />
                  <span>Add Special Observation</span>
                </button>
              )}
            </div>

            {/* Records Found Indicator */}
            {searchQuery.trim() && (
              <div className="font-sans text-xs sm:text-[0.85rem] text-[#666666] px-1 font-medium flex items-center gap-1.5 animate-fade-in">
                <span>
                  Found <strong className="text-primary font-bold">{observations.length}</strong> {observations.length === 1 ? 'record' : 'records'} matching &ldquo;<span className="text-[#111111] font-semibold">{searchQuery}</span>&rdquo;
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-accent hover:underline cursor-pointer border-none bg-none font-semibold text-xs ml-1"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        )}

        {/* Observations List & Loading Skeleton */}
        {loading && allObservations.length === 0 ? (
          <div className="flex flex-col gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-[#e8ece9] p-5 sm:p-7 shadow-xs animate-pulse flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-28 bg-gray-200 rounded-full" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
                <div className="h-6 w-3/4 bg-gray-200 rounded" />
                <div className="h-16 w-full bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : observations.length > 0 ? (
          <div className="flex flex-col gap-6">
            {observations.map((item) => {
              const isLookalikes = item.id === 5 || /lookalike|alike/i.test(item.title);

              if (isLookalikes) {
                const allLookalikePhotos = LOOKALIKE_EXPANDED_PAIRS.map((p, pIdx) => ({
                  id: `${item.id}_${pIdx}`,
                  imageUrl: p.image,
                  title: p.title,
                  tuskerName: p.tuskerName,
                  location: p.location,
                  hideDate: true,
                  author: item.author || 'Wild Tuskers Sri Lanka Team',
                  item,
                }));

                const visiblePairs = (isAdmin && searchQuery)
                  ? LOOKALIKE_EXPANDED_PAIRS.filter(
                    (p) =>
                      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.tuskerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.description.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  : LOOKALIKE_EXPANDED_PAIRS;

                if (isAdmin && searchQuery && visiblePairs.length === 0 && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                  return null;
                }

                const pairsToRender = visiblePairs.length > 0 ? visiblePairs : LOOKALIKE_EXPANDED_PAIRS;

                return (
                  <React.Fragment key={item.id}>
                    {/* ── Main Title & Introductory Paragraph (Header without section card box) ── */}
                    <div className="pt-2 pb-1 flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="font-sans text-xl sm:text-2xl md:text-[1.75rem] font-bold text-[#111111] leading-snug m-0">
                          {item.title}
                        </h2>
                        {isAdmin && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => navigate(`/admin/edit-observation/${item.id}`)}
                              className="p-1.5 text-[#777777] hover:text-accent hover:bg-[#f5f5f5] rounded-md transition-colors cursor-pointer border-none bg-none"
                              title="Edit Observation"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-[#777777] hover:text-rose-600 hover:bg-[#fff0f0] rounded-md transition-colors cursor-pointer border-none bg-none"
                              title="Delete Observation"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2.5 text-sm sm:text-[0.96rem] md:text-[1rem] text-[#4b5563] leading-[1.8] text-justify">
                        <BilingualParagraphs
                          paragraphs={extractLookalikeIntroParagraphs(item.description)}
                          className="m-0"
                        />
                      </div>
                    </div>

                    {/* ── 4 Separate Observation Sections for the 4 Comparison Pairs ── */}
                    {pairsToRender.map((pair, pIdx) => {
                      const photoMeta = {
                        id: `${item.id}_${pIdx}`,
                        imageUrl: pair.image,
                        title: pair.title,
                        tuskerName: pair.tuskerName,
                        location: pair.location,
                        hideDate: true,
                        author: item.author || 'Wild Tuskers Sri Lanka Team',
                        allPhotos: allLookalikePhotos,
                      };

                      return (
                        <article
                          key={`${item.id}-${pair.idSuffix}`}
                          className="bg-white rounded-2xl border border-[#e8ece9] p-4 sm:p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col gap-3 sm:gap-4 relative"
                        >
                          {/* Top Meta Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 pb-3 border-b border-[#f0f2f0]">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                              {/* Tusker Tag */}
                              <span className="font-sans text-[0.75rem] sm:text-[0.82rem] font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-accent/15 text-[#9a7020] border border-accent/30 tracking-wide">
                                {pair.tuskerName}
                              </span>

                              {/* Location */}
                              {pair.location && (
                                <span className="inline-flex items-center gap-1.5 font-sans text-[0.75rem] sm:text-[0.82rem] text-[#666666] font-medium">
                                  <MapPin size={13} className="text-accent" />
                                  {pair.location}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Title */}
                          <h2 className="font-sans text-lg sm:text-[1.35rem] md:text-[1.5rem] font-bold text-[#111111] leading-snug m-0">
                            {pair.title}
                          </h2>

                          {/* Description: Scrollable with Justified Paragraphs */}
                          <div
                            tabIndex={0}
                            role="region"
                            aria-label={`Description for ${pair.title}`}
                            className="max-h-[220px] sm:max-h-[260px] overflow-y-auto pr-2 sm:pr-3 flex flex-col gap-2.5 overscroll-contain focus:outline-hidden"
                            style={{
                              scrollbarWidth: 'thin',
                              scrollbarColor: '#c5a059 transparent',
                            }}
                          >
                            <BilingualParagraphs
                              paragraphs={pair.description.split(/\n+/)}
                              className="font-sans text-xs sm:text-[0.93rem] text-[#374151] leading-[1.8] text-justify m-0"
                            />
                          </div>

                          {/* Photograph in Full View across the section */}
                          <div className="pt-2 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="font-sans text-[0.72rem] sm:text-[0.78rem] font-bold text-[#888888] uppercase tracking-wider flex items-center gap-1.5">
                                <ImageIcon size={14} className="text-accent shrink-0" />
                                <span>Comparison Photograph</span>
                              </span>
                              <span className="text-[0.7rem] sm:text-[0.75rem] text-[#888888]">
                                Click to enlarge
                              </span>
                            </div>
                            <div
                              onClick={() => setActiveLightboxPhoto(photoMeta)}
                              className="relative w-full rounded-2xl overflow-hidden bg-[#f8f9fa] border border-[#e5e7eb] cursor-pointer group shadow-2xs"
                            >
                              <img
                                src={pair.image}
                                alt={`${pair.title} photograph`}
                                className="w-full h-auto max-h-[580px] object-contain block mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <ExternalLink size={22} />
                              </div>
                            </div>
                          </div>

                          {/* Footer Attribution */}
                          <div className="pt-3 border-t border-[#f5f5f5] flex items-center justify-between text-[0.8rem] text-[#888888] font-sans">
                            <span className="inline-flex items-center gap-1.5">
                              <User size={13} className="text-[#999999]" />
                              Recorded by: <strong className="text-[#555555] font-semibold">{item.author || 'Wild Tuskers Sri Lanka Team'}</strong>
                            </span>
                          </div>
                        </article>
                      );
                    })}
                  </React.Fragment>
                );
              }

              // Normal Observation (e.g. Deega 2, Gemunu)
              return (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#e8ece9] p-4 sm:p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col gap-3 sm:gap-4 relative"
                >
                  {/* Top Meta Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 pb-3 border-b border-[#f0f2f0]">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                      {/* Tusker Tag */}
                      <span className="font-sans text-[0.75rem] sm:text-[0.82rem] font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-accent/15 text-[#9a7020] border border-accent/30 tracking-wide">
                        {item.tuskerName}
                      </span>

                      {/* Date (hidden if multi-year/comparative observation specifies hideDate) */}
                      {item.date && !item.hideDate && (
                        <span className="inline-flex items-center gap-1.5 font-sans text-[0.75rem] sm:text-[0.82rem] text-[#666666] font-medium">
                          <Calendar size={13} className="text-accent" />
                          {formatDate(item.date)}
                        </span>
                      )}

                      {/* Time of Observation */}
                      {item.time && (
                        <span className="inline-flex items-center gap-1.5 font-sans text-[0.75rem] sm:text-[0.82rem] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Clock size={12} className="text-emerald-700" />
                          {formatDisplayTime(item.time) || item.time}
                        </span>
                      )}

                      {/* Location */}
                      {item.location && (
                        <span className="inline-flex items-center gap-1.5 font-sans text-[0.75rem] sm:text-[0.82rem] text-[#666666] font-medium">
                          <MapPin size={13} className="text-accent" />
                          {item.location}
                        </span>
                      )}
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/admin/edit-observation/${item.id}`)}
                          className="p-1.5 text-[#777777] hover:text-accent hover:bg-[#f5f5f5] rounded-md transition-colors cursor-pointer border-none bg-none"
                          title="Edit Observation"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-[#777777] hover:text-rose-600 hover:bg-[#fff0f0] rounded-md transition-colors cursor-pointer border-none bg-none"
                          title="Delete Observation"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="font-sans text-lg sm:text-[1.35rem] md:text-[1.5rem] font-bold text-[#111111] leading-snug m-0">
                    {item.title}
                  </h2>

                  {/* Description: Scrollable with Justified Paragraphs */}
                  {item.description && (
                    <div
                      tabIndex={0}
                      role="region"
                      aria-label={`Description for ${item.title}`}
                      className="max-h-[220px] sm:max-h-[260px] overflow-y-auto pr-2 sm:pr-3 flex flex-col gap-2.5 overscroll-contain focus:outline-hidden"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#c5a059 transparent',
                      }}
                    >
                      <BilingualParagraphs
                        paragraphs={item.description.split(/\n+/)}
                        className="font-sans text-xs sm:text-[0.93rem] text-[#374151] leading-[1.8] text-justify m-0"
                      />
                    </div>
                  )}

                  {/* Photos / Images Gallery */}
                  <ObservationPhotosGallery
                    item={item}
                    setActiveLightboxPhoto={setActiveLightboxPhoto}
                  />

                  {/* Footer Attribution */}
                  {item.author && (
                    <div className="pt-3 border-t border-[#f5f5f5] flex items-center justify-between text-[0.8rem] text-[#888888] font-sans">
                      <span className="inline-flex items-center gap-1.5">
                        <User size={13} className="text-[#999999]" />
                        Recorded by: <strong className="text-[#555555] font-semibold">{item.author}</strong>
                      </span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-2xl border border-[#e8ece9] text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-[#faf5ec] text-accent flex items-center justify-center mb-1">
              <Binoculars size={32} />
            </div>
            <h3 className="font-sans text-base sm:text-[1.2rem] font-bold text-[#111111] m-0">No Special Observations Found</h3>
            <p className="font-sans text-[0.88rem] sm:text-[0.92rem] text-[#777777] max-w-sm sm:max-w-md m-0 leading-relaxed">
              {allObservations.length === 0
                ? <>No special observations have been <span className="inline-block whitespace-nowrap">recorded yet.</span></>
                : (isAdmin && searchQuery)
                  ? 'No observations match your current search query. Try clearing the search.'
                  : <>No observations recorded yet.</>}
            </p>
            {isAdmin && searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-accent text-[0.88rem] font-semibold hover:underline cursor-pointer border-none bg-none"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

      </div>

      {/* Lightbox Modal with Zoom, Edit, Delete and Tusker Profiles */}
      {activeLightboxPhoto && (
        <ImageLightboxModal
          photo={activeLightboxPhoto}
          allPhotos={activeLightboxPhoto.allPhotos || [activeLightboxPhoto]}
          onNavigatePhoto={(nextPhoto) =>
            setActiveLightboxPhoto({
              ...nextPhoto,
              allPhotos: activeLightboxPhoto.allPhotos,
            })
          }
          isAdmin={isAdmin}
          onEdit={() => {
            const itemId = activeLightboxPhoto.item?.id || activeLightboxPhoto.id;
            setActiveLightboxPhoto(null);
            navigate(`/admin/edit-observation/${itemId}`);
          }}
          onDelete={() => {
            const itemId = activeLightboxPhoto.item?.id || activeLightboxPhoto.id;
            setActiveLightboxPhoto(null);
            handleDelete(itemId);
          }}
          onClose={() => setActiveLightboxPhoto(null)}
          fromPath={embedded ? '/special-observations?tab=observations' : '/special-observations'}
        />
      )}
    </>
  );

  if (embedded) {
    return mainContent;
  }

  return (
    <div className="bg-[#f7f8fa] min-h-screen pt-[calc(68px+1.5rem)] sm:pt-[calc(80px+2.5rem)] pb-24">
      {mainContent}
    </div>
  );
}
