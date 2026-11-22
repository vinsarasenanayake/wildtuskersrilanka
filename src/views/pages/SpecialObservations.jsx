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

export default function SpecialObservations() {
  const navigate = useNavigate();
  const {
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
    document.title = 'Wild Tuskers Sri Lanka | Special Observations';
  }, []);

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

  return (
    <div className="bg-[#f7f8fa] min-h-screen pt-[calc(80px+2.5rem)] pb-24">
      <div className="max-w-[1100px] mx-auto px-6 flex flex-col gap-8">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#e5e7eb]">
          <div>
            <h1 className="font-sans text-[2.1rem] sm:text-[2.4rem] font-extrabold text-[#111111] m-0 tracking-tight leading-tight">
              Special Observations Over The Years
            </h1>
            <p className="font-sans text-[0.98rem] text-[#666666] max-w-[640px] mt-2 mb-0 leading-relaxed">
              In-depth annual field observations documenting significant behaviors, musth cycles, physical developments, and health records of Sri Lanka's wild tuskers.
            </p>
          </div>

          {canAddObservation && (
            <button
              onClick={() => navigate('/admin/add-observation')}
              className="bg-accent text-primary font-semibold text-[0.88rem] px-5 py-2.5 rounded-[6px] inline-flex items-center gap-2 border-none cursor-pointer hover:bg-accent-hover transition-colors shrink-0 whitespace-nowrap"
            >
              <PlusCircle size={16} />
              <span>Add Special Observation</span>
            </button>
          )}
        </div>

        {/* Controls: Year Filter Tabs & Search Bar (hidden when empty) */}
        {allObservations.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Year Tabs - hidden if no specific years */}
            {availableYears.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedYear('ALL')}
                  className={`font-sans text-[0.88rem] font-bold px-4 py-2 rounded-full transition-all cursor-pointer border-none shrink-0 ${
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
                    className={`font-sans text-[0.88rem] font-bold px-4 py-2 rounded-full transition-all cursor-pointer border-none shrink-0 ${
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
            <div className="relative min-w-[240px] max-w-sm ml-auto">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999]" />
              <input
                type="text"
                placeholder="Search by tusker, title, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#e2e8f0] rounded-full pl-9 pr-4 py-2 text-[0.88rem] text-[#111111] placeholder:text-[#999999] outline-none focus:border-accent transition-all"
              />
            </div>
          </div>
        )}

        {/* Observations List */}
        {observations.length > 0 ? (
          <div className="flex flex-col gap-6">
            {observations.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-2xl border border-[#e8ece9] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col gap-4 relative"
              >
                {/* Top Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f0f2f0]">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Tusker Tag */}
                    <span className="font-sans text-[0.82rem] font-bold px-3 py-1 rounded-full bg-accent/15 text-[#9a7020] border border-accent/30 tracking-wide">
                      {item.tuskerName}
                    </span>

                    {/* Date */}
                    <span className="inline-flex items-center gap-1.5 font-sans text-[0.82rem] text-[#666666] font-medium">
                      <Calendar size={14} className="text-accent" />
                      {formatDate(item.date)}
                    </span>

                    {/* Location */}
                    {item.location && (
                      <span className="inline-flex items-center gap-1.5 font-sans text-[0.82rem] text-[#666666] font-medium">
                        <MapPin size={14} className="text-accent" />
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
                <h2 className="font-sans text-[1.35rem] sm:text-[1.5rem] font-bold text-[#111111] leading-snug m-0">
                  {item.title}
                </h2>

                {/* Description Body */}
                <div className="font-sans text-[0.95rem] text-[#333333] leading-[1.8] whitespace-pre-line">
                  {item.description}
                </div>

                {/* Photos / Images Gallery */}
                {item.images && item.images.length > 0 && (
                  <div className="pt-2">
                    <p className="font-sans text-[0.78rem] font-bold text-[#888888] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <ImageIcon size={14} />
                      <span>Observation Photographs ({item.images.length})</span>
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
            <p className="font-sans text-[0.92rem] text-[#777777] max-w-md m-0">
              {allObservations.length === 0
                ? 'No special observations have been recorded yet.'
                : searchQuery
                ? 'No observations match your current search query. Try clearing the search or switching year filter.'
                : 'No observations recorded for this year yet.'}
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
    </div>
  );
}
