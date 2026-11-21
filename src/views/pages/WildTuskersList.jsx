import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, X, ChevronDown, ArrowRight, PlusCircle, Radar, ArrowUpDown, Check } from 'lucide-react';
import { useTuskerList } from '../../controllers/useTusker';
import { useAuth } from '../../controllers/useAuth';
import { LIVING_STATUSES } from '../../models/TuskerModel';
import StatusBadge from '../components/StatusBadge';
import Footer from '../components/Footer';
import { setCachedAspect } from '../../utils/photoAspectCache';
import { thumbUrl } from '../../utils/storageUpload';

const SORT_OPTIONS = [
  { id: 'ID_DESC', label: 'Default (T-ID: Descending)' },
  { id: 'NAME_ASC', label: 'Name: A → Z (Ascending)' },
  { id: 'NAME_DESC', label: 'Name: Z → A (Descending)' },
  { id: 'ID_ASC', label: 'T-ID: Ascending' },
];

export default function WildTuskersList() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const {
    filtered,
    tuskers,
    loading,
    loadError,
    statusFilter,
    setStatusFilter,
    statusCounts,
    sortOrder,
    setSortOrder,
    countInArea,
    nameQuery,
    nameSuggestions,
    showNameSugg,
    setShowNameSugg,
    locationQuery,
    selectedLocation,
    showLocDrop,
    setShowLocDrop,
    locSuggestions,
    handleNameInput,
    pickName,
    handleLocInput,
    pickLocation,
    clearLocation,
    clearFilters,
    focusLocation,
  } = useTuskerList();

  const nameRef     = useRef(null);
  const locationRef = useRef(null);
  const sortRef     = useRef(null);
  const [showSortDrop, setShowSortDrop] = useState(false);

  /* ── Click Outside to Close ────────────────── */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (nameRef.current && !nameRef.current.contains(e.target)) {
        setShowNameSugg(false);
      }
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowLocDrop(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setShowSortDrop(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [setShowNameSugg, setShowLocDrop]);

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Wild Tuskers List';
  }, []);

  return (
    <div className="w-full max-w-[1280px] mx-auto pt-[calc(80px+2.5rem)] pb-20 px-8 min-h-screen bg-white">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-[#eeeeee]">
        <div className="text-center sm:text-left">
          <h1 className="font-sans text-[2.25rem] font-bold text-[#111111] mb-1.5">Wild Tuskers List</h1>
          <p className="font-sans text-[0.95rem] text-[#777777] m-0">
            {tuskers.length} identified tuskers documented by the WTS team
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center sm:justify-end">
          {isAdmin && (
            <>
              <Link
                to="/admin/add-tusker"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-primary font-semibold text-[0.88rem] shadow-sm hover:shadow-md transition-all duration-200 no-underline shrink-0"
              >
                <PlusCircle size={16} />
                <span>Add a New Tusker</span>
              </Link>
              <Link
                to="/unlisted"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#faf5ec] hover:bg-[#f3ebd9] text-primary border border-accent/40 font-semibold text-[0.88rem] shadow-sm hover:shadow-md transition-all duration-200 no-underline shrink-0"
              >
                <Radar size={16} className="text-accent" />
                <span>Unlisted Monitoring</span>
              </Link>
            </>
          )}
          <Link
            to="/ai-app"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#16402b] hover:bg-[#1f593c] text-white font-medium text-[0.88rem] shadow-sm hover:shadow-md border border-[#2d8056]/30 transition-all duration-200 shrink-0 group no-underline"
          >
            <span>AI Re-Identification App</span>
            <ArrowRight size={14} className="text-white transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* ── Search Toolbar ── */}
      <div className="flex items-center gap-4 mb-4 flex-wrap max-sm:flex-col">

        {/* Name Search */}
        <div className="relative flex-1 min-w-[220px] max-sm:max-w-full max-sm:w-full" ref={nameRef}>
          <div className="flex items-center gap-2 bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-2.5 transition-all focus-within:border-accent focus-within:bg-white focus-within:ring-3 focus-within:ring-accent/12">
            <Search size={16} className="text-[#aaaaaa] shrink-0" />
            <input
              type="text"
              className="border-none bg-transparent outline-none font-sans text-[0.9rem] text-[#111111] caret-[#111111] w-full placeholder:text-[#bbbbbb]"
              placeholder="Search tusker name or ID…"
              value={nameQuery}
              onChange={e => handleNameInput(e.target.value)}
              onFocus={() => nameQuery && setShowNameSugg(true)}
            />
            {nameQuery && (
              <button className="bg-none border-none cursor-pointer text-[#aaaaaa] p-0 flex items-center shrink-0 transition-colors hover:text-[#555555]" onClick={clearFilters}>
                <X size={14} />
              </button>
            )}
          </div>
          {showNameSugg && nameSuggestions.length > 0 && (
            <ul className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border-1.5 border-[#e8e8e8] rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.1)] z-[200] list-none m-0 py-1.5 overflow-hidden">
              {nameSuggestions.map(t => (
                <li key={t.id} className="flex items-center gap-2 px-4 py-2.5 cursor-pointer font-sans text-[0.88rem] text-[#333333] transition-colors hover:bg-[#faf5ec]" onMouseDown={() => pickName(t)}>
                  <span className="font-semibold text-accent min-w-[42px] text-[0.8rem]">{t.id}</span>
                  <span className="flex-1 text-[#111111] font-medium">{t.name}</span>
                  <span className="flex items-center gap-[3px] text-[#aaaaaa] text-[0.78rem] ml-auto whitespace-nowrap"><MapPin size={11} className="text-accent shrink-0" />{t.location}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Location Filter */}
        <div className="relative flex-1 min-w-[220px] max-w-[280px] max-md:max-w-full max-sm:max-w-full max-sm:w-full" ref={locationRef}>
          <div className="flex items-center gap-2 bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-2.5 transition-all focus-within:border-accent focus-within:bg-white focus-within:ring-3 focus-within:ring-accent/12">
            <MapPin size={16} className="text-[#aaaaaa] shrink-0 text-accent" />
            <input
              type="text"
              className="border-none bg-transparent outline-none font-sans text-[0.9rem] text-[#111111] caret-[#111111] w-full placeholder:text-[#bbbbbb]"
              placeholder="Filter by location…"
              value={locationQuery}
              onChange={e => handleLocInput(e.target.value)}
              onFocus={focusLocation}
              onClick={() => setShowLocDrop(true)}
            />
            <div className="flex items-center gap-1.5 shrink-0">
              {locationQuery && (
                <button
                  type="button"
                  aria-label="Clear location filter"
                  className="bg-none border-none cursor-pointer text-[#aaaaaa] p-0 flex items-center shrink-0 transition-colors hover:text-[#555555]"
                  onMouseDown={clearLocation}
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="button"
                aria-label="Toggle location list"
                className="bg-none border-none cursor-pointer text-[#aaaaaa] p-0 flex items-center shrink-0 transition-colors hover:text-[#555555]"
                onClick={() => setShowLocDrop(prev => !prev)}
              >
                <ChevronDown size={14} className={`transition-transform duration-200 ${showLocDrop ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          {showLocDrop && locSuggestions.length > 0 && (
            <ul className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border-1.5 border-[#e8e8e8] rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.1)] z-[200] list-none m-0 py-1.5 max-h-[320px] overflow-y-auto">
              {locSuggestions.map(loc => (
                <li
                  key={loc}
                  className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer font-sans text-[0.88rem] text-[#333333] transition-colors hover:bg-[#faf5ec] ${selectedLocation === loc ? 'bg-[#faf5ec]' : ''}`}
                  onMouseDown={() => pickLocation(loc)}
                >
                  <MapPin size={12} className="text-accent shrink-0" />
                  <span className="flex-1 text-[#111111] font-medium">{loc}</span>
                  <span className="ml-auto text-[0.78rem] text-[#aaaaaa]">
                    {countInArea(loc)} tuskers
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

      {/* ── Living Status Filter & Sort Row ── */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        {/* Living Status Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', ...LIVING_STATUSES].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`font-sans text-[0.82rem] font-semibold rounded-full px-3.5 py-1.5 border cursor-pointer transition-all ${
                statusFilter === st
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-[#555555] border-[#e8e8e8] hover:border-accent hover:text-accent'
              }`}
            >
              {st === 'ALL' ? 'All' : st}
              <span className={`ml-1.5 font-normal ${statusFilter === st ? 'text-white/70' : 'text-[#aaaaaa]'}`}>
                {statusCounts[st] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Sort Dropdown - directly below Filter by Location, matching its design */}
        <div className="relative flex-1 min-w-[220px] max-w-[280px] max-md:max-w-full max-sm:max-w-full max-sm:w-full ml-auto" ref={sortRef}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setShowSortDrop(prev => !prev)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowSortDrop(prev => !prev); } }}
            className={`flex items-center gap-2 bg-[#f7f7f8] border-1.5 rounded-[10px] px-3.5 py-2.5 transition-all cursor-pointer select-none ${
              showSortDrop ? 'border-accent bg-white ring-3 ring-accent/12' : 'border-[#e8e8e8] hover:border-accent/60'
            }`}
          >
            <ArrowUpDown size={16} className="text-accent shrink-0" />
            <span
              className={`font-sans text-[0.9rem] font-normal flex-1 truncate select-none ${
                sortOrder === 'ID_DESC' ? 'text-[#bbbbbb]' : 'text-[#111111]'
              }`}
            >
              {sortOrder === 'ID_DESC' ? 'Sort by…' : (SORT_OPTIONS.find(o => o.id === sortOrder)?.label || 'Sort by…')}
            </span>

            {sortOrder !== 'ID_DESC' ? (
              <button
                type="button"
                className="bg-none border-none cursor-pointer text-[#aaaaaa] p-0 flex items-center shrink-0 transition-colors hover:text-[#555555]"
                onClick={(e) => {
                  e.stopPropagation();
                  setSortOrder('ID_DESC');
                  setShowSortDrop(false);
                }}
                title="Reset sorting"
              >
                <X size={14} />
              </button>
            ) : (
              <ChevronDown
                size={14}
                className={`text-[#aaaaaa] shrink-0 transition-transform duration-200 pointer-events-none ${
                  showSortDrop ? 'rotate-180 text-accent' : ''
                }`}
              />
            )}
          </div>

          {showSortDrop && (
            <ul className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border-1.5 border-[#e8e8e8] rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.1)] z-[200] list-none m-0 py-1.5 overflow-hidden">
              {SORT_OPTIONS.map(opt => (
                <li
                  key={opt.id}
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer font-sans text-[0.88rem] transition-colors hover:bg-[#faf5ec] ${
                    sortOrder === opt.id ? 'bg-[#faf5ec] text-accent font-semibold' : 'text-[#333333]'
                  }`}
                  onMouseDown={() => {
                    setSortOrder(opt.id);
                    setShowSortDrop(false);
                  }}
                >
                  <span className="truncate">{opt.label}</span>
                  {sortOrder === opt.id && <Check size={14} className="text-accent shrink-0 ml-2" />}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Results Count ── */}
      <div className="flex items-center justify-between mb-7 font-sans text-[0.85rem] text-[#888888]">
        <span>{filtered.length} {filtered.length === 1 ? 'tusker' : 'tuskers'} found</span>
        {(nameQuery || selectedLocation || statusFilter !== 'ALL' || sortOrder !== 'ID_DESC') && (
          <button className="bg-none border-none font-sans text-[0.85rem] text-accent cursor-pointer font-medium underline p-0 hover:text-accent-hover" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh] font-sans text-[#aaaaaa]">Loading tuskers…</div>
      ) : loadError ? (
        <div className="flex items-center justify-center min-h-[60vh] font-sans text-[#e53e3e]">Could not load tuskers: {loadError}</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8 min-h-[60vh] content-start">
          {filtered.map(tusker => (
            <div
              key={tusker.id}
              className="flex flex-col gap-2.5 cursor-pointer group content-auto"
              onClick={() => navigate(`/tuskers/${tusker.id.toLowerCase()}`)}
            >
              <div className="w-full aspect-square bg-[#e8e8e8] rounded-[6px] relative overflow-hidden flex flex-col items-center justify-center gap-1 transition-opacity duration-200 group-hover:opacity-82">
                {tusker.livingStatus && tusker.livingStatus !== 'Alive' && (
                  <StatusBadge
                    status={tusker.livingStatus}
                    deathYear={tusker.deathYear}
                    className="absolute top-2 left-2 z-[2] text-[0.68rem] px-2 py-0.5"
                  />
                )}
                {tusker.photos && tusker.photos[0] ? (
                  <img
                    src={thumbUrl(tusker.photos[0])}
                    alt={tusker.name}
                    loading="lazy"
                    decoding="async"
                    onLoad={(e) => {
                      if (e.target.naturalWidth && e.target.naturalHeight) {
                        setCachedAspect(tusker.photos[0], e.target.naturalHeight > e.target.naturalWidth);
                      }
                    }}
                    className="w-full h-full object-cover absolute inset-0"
                  />
                ) : (
                  <>
                    <span className="font-sans text-[1rem] font-semibold text-[#999999] tracking-widest">{tusker.id}</span>
                    <span className="flex items-center gap-[3px] font-sans text-[0.72rem] text-[#bbbbbb]"><MapPin size={10} /> {tusker.location}</span>
                  </>
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="font-sans text-[0.88rem] font-semibold text-[#111111] leading-[1.4] m-0">
                  {tusker.id} – {tusker.name}
                  {tusker.sinhala && <span className="font-normal text-[#444444]"> ({tusker.sinhala})</span>}
                </p>
                <p className="font-sans text-[0.8rem] text-[#888888] m-0 flex items-center gap-1.5 truncate">
                  <MapPin size={11} className="text-accent shrink-0" />
                  <span className="truncate">{tusker.location || 'Location not recorded'}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 min-h-[60vh] py-8 px-4 text-[#bbbbbb] font-sans text-[0.95rem]">
          <Search size={40} strokeWidth={1.2} />
          <p>No tuskers match your search.</p>
          <button className="bg-none border-none font-sans text-[0.85rem] text-accent cursor-pointer font-medium underline p-0 hover:text-accent-hover" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      )}
      {/* ── Footer Attribution ── */}
      <Footer />
    </div>
  );
}
