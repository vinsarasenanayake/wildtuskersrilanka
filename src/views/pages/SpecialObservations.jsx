/**
 * @file SpecialObservations.jsx
 * @description In-depth annual field observations documenting significant behaviors,
 * musth cycles, physical developments, and health records of Sri Lanka's wild tuskers.
 * Features year filtering, text searching, admin create/edit/delete, and photo lightbox integration.
 */

import React, { useEffect, useState } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { useSpecialObservationsFeed } from '../../controllers/useSpecialObservations';
import ImageLightboxModal from '../components/ImageLightboxModal';
import { formatDisplayTime } from '../../utils/localDate';

export default function SpecialObservations({ embedded = false }) {
  const navigate = useNavigate();
  const {
    loading,
    observations,
    allObservations = [],
    availableYears,
    selectedYear,
    setSelectedYear,
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
      <div className={embedded ? "w-full flex flex-col gap-6" : "max-w-[1100px] mx-auto px-4 sm:px-6 flex flex-col gap-6 sm:gap-8"}>
      {/* Page Header (standalone only) */}
      {!embedded && (
        <div className="flex flex-col items-center justify-center text-center mb-6 pb-6 border-b border-[#e5e7eb] gap-3">
          <h1 className="font-sans text-[clamp(1.15rem,4.5vw,2.85rem)] font-bold text-[#111111] m-0 tracking-tight leading-snug whitespace-nowrap text-center">
            Special Observations Over The Years
          </h1>
          <p className="font-sans text-xs sm:text-[0.95rem] text-[#555555] leading-[1.75] max-w-3xl mx-auto m-0 text-center">
            In-depth annual field observations documenting significant behaviors, musth cycles, physical developments, and health records of Sri Lanka's wild tuskers.
          </p>

          {canAddObservation && (
            <div className="flex items-center justify-center w-full sm:w-auto mt-2">
              <button
                onClick={() => navigate('/admin/add-observation')}
                className="bg-accent text-primary font-semibold text-xs sm:text-[0.88rem] px-6 sm:px-8 py-2.5 rounded-[8px] inline-flex items-center justify-center gap-2 border-none cursor-pointer hover:bg-accent-hover transition-colors shrink-0 whitespace-nowrap shadow-sm w-full sm:w-auto text-center"
              >
                <PlusCircle size={16} />
                <span>Add Special Observation</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Embedded Admin Add Button */}
      {embedded && canAddObservation && (
        <div className="flex items-center w-full sm:w-auto sm:justify-end">
          <button
            onClick={() => navigate('/admin/add-observation')}
            className="w-full sm:w-auto bg-accent text-primary font-bold text-xs sm:text-[0.88rem] px-5 sm:px-6 py-3 sm:py-2.5 rounded-xl sm:rounded-lg inline-flex items-center justify-center gap-2 border-none cursor-pointer hover:bg-accent-hover transition-colors whitespace-nowrap shadow-xs"
          >
            <PlusCircle size={16} />
            <span>Add Special Observation</span>
          </button>
        </div>
      )}

        {/* Controls: Year Filter Tabs & Search Bar (hidden when empty) */}
        {allObservations.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            {/* Year Tabs - scrollable horizontally on mobile */}
            {availableYears.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
                <button
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

            {/* Search Box */}
            <div className="relative w-full sm:w-auto min-w-0 sm:min-w-[240px] sm:max-w-sm sm:ml-auto">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999]" />
              <input
                type="text"
                placeholder="Search by tusker, title, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#e2e8f0] rounded-full pl-9 pr-4 py-2 text-xs sm:text-[0.88rem] text-[#111111] placeholder:text-[#999999] outline-none focus:border-accent transition-all"
              />
            </div>
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
            {observations.map((item) => (
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

                    {/* Date */}
                    <span className="inline-flex items-center gap-1.5 font-sans text-[0.75rem] sm:text-[0.82rem] text-[#666666] font-medium">
                      <Calendar size={13} className="text-accent" />
                      {formatDate(item.date)}
                    </span>

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

                {/* Description Body */}
                <div className="font-sans text-xs sm:text-[0.95rem] text-[#333333] leading-[1.8] whitespace-pre-line">
                  {item.description}
                </div>

                {/* Photos / Images Gallery */}
                {item.images && item.images.length > 0 && (
                  <div className="pt-2">
                    <p className="font-sans text-[0.72rem] sm:text-[0.78rem] font-bold text-[#888888] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <ImageIcon size={14} />
                      <span>Observation Photographs ({item.images.length})</span>
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                      {item.images.map((imgUrl, i) => (
                        <div
                          key={i}
                          onClick={() =>
                            setActiveLightboxPhoto({
                              imageUrl: imgUrl,
                              title: item.title,
                              tuskerName: item.tuskerName,
                              location: item.location,
                              date: item.date,
                              author: item.author,
                              id: item.id,
                              item: item,
                            })
                          }
                          className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#e8e8e8] border border-[#e0e0e0] cursor-pointer group shadow-xs"
                        >
                          <img
                            src={imgUrl}
                            alt={`${item.tuskerName} observation ${i + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <ExternalLink size={18} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-2xl border border-[#e8ece9] text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-[#faf5ec] text-accent flex items-center justify-center mb-1">
              <Binoculars size={32} />
            </div>
            <h3 className="font-sans text-[1.2rem] font-bold text-[#111111] m-0">No Special Observations Found</h3>
            <p className="font-sans text-[0.88rem] sm:text-[0.92rem] text-[#777777] max-w-sm sm:max-w-md m-0 leading-relaxed">
              {allObservations.length === 0
                ? <>No special observations have been <span className="inline-block whitespace-nowrap">recorded yet.</span></>
                : searchQuery
                ? 'No observations match your current search query. Try clearing the search or switching year filter.'
                : <>No observations recorded for this year <span className="inline-block whitespace-nowrap">yet.</span></>}
            </p>
            {searchQuery && (
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
          isAdmin={isAdmin}
          onEdit={() => {
            const itemId = activeLightboxPhoto.id;
            setActiveLightboxPhoto(null);
            navigate(`/admin/edit-observation/${itemId}`);
          }}
          onDelete={() => {
            const itemId = activeLightboxPhoto.id;
            setActiveLightboxPhoto(null);
            handleDelete(itemId);
          }}
          onClose={() => setActiveLightboxPhoto(null)}
          fromPath="/observations"
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
