/**
 * @file WildTuskersList.jsx
 * @description Master catalog and registry directory for identified Sri Lankan wild tuskers.
 * Features multi-parameter filtering (status, location, name/ID search, sorting),
 * session-based scroll & card focus restoration, and admin creation shortcuts.
 */

import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, MapPin, X, ChevronDown, PlusCircle, Radar, ArrowUpDown, Check, Layers } from 'lucide-react';
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
    selectedDistrict,
    districtQuery,
    showDistrictDrop,
    setShowDistrictDrop,
    districtSuggestions,
    countInDistrict,
    handleDistrictInput,
    pickDistrict,
    clearDistrict,
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

  const location = useLocation();
  const nameRef     = useRef(null);
  const districtRef = useRef(null);
  const locationRef = useRef(null);
  const sortRef     = useRef(null);
  const [showSortDrop, setShowSortDrop] = useState(false);

  /* ── Restore Scroll & Card Position on Return ─────── */
  useLayoutEffect(() => {
    // Only restore scroll when explicitly navigated via Back button with restoreScroll: true
    const shouldRestore = Boolean(location.state?.restoreScroll);

    if (!shouldRestore) {
      try {
        sessionStorage.removeItem('wts_last_tusker_id');
        sessionStorage.removeItem('wts_last_tusker_scroll');
      } catch {}
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    const savedId = sessionStorage.getItem('wts_last_tusker_id');
    const savedScroll = sessionStorage.getItem('wts_last_tusker_scroll');

    if (!savedId && !savedScroll) return;

    const restore = () => {
      if (savedId) {
        const el = document.getElementById(`tusker-card-${savedId}`);
        if (el) {
          el.scrollIntoView({ block: 'center', behavior: 'instant' });
          return true;
        }
      }
      if (savedScroll !== null) {
        const y = parseInt(savedScroll, 10);
        if (!isNaN(y) && y > 0) {
          window.scrollTo({ top: y, behavior: 'instant' });
          return true;
        }
      }
      return false;
    };

    restore();
    const frameId = requestAnimationFrame(restore);
    const t1 = setTimeout(restore, 50);
    const t2 = setTimeout(restore, 150);
    const t3 = setTimeout(() => {
      restore();
      try {
        sessionStorage.removeItem('wts_last_tusker_id');
        sessionStorage.removeItem('wts_last_tusker_scroll');
      } catch {}
    }, 300);

    const hasActiveFilters = Boolean(
    nameQuery ||
    selectedDistrict ||
    districtQuery ||
    selectedLocation ||
    locationQuery ||
    (statusFilter && statusFilter !== 'ALL') ||
    sortOrder !== 'ID_DESC'
  );

  return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [loading, filtered.length, location.state]);

  /* ── Click Outside to Close ────────────────── */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (nameRef.current && !nameRef.current.contains(e.target)) {
        setShowNameSugg(false);
      }
      if (districtRef.current && !districtRef.current.contains(e.target)) {
        setShowDistrictDrop(false);
      }
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowLocDrop(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setShowSortDrop(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    const hasActiveFilters = Boolean(
    nameQuery ||
    selectedDistrict ||
    districtQuery ||
    selectedLocation ||
    locationQuery ||
    (statusFilter && statusFilter !== 'ALL') ||
    sortOrder !== 'ID_DESC'
  );

  return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [setShowNameSugg, setShowDistrictDrop, setShowLocDrop]);

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Wild Tuskers List';
  }, []);

  const renderSortDropdown = (extraClass = '') => (
    <div className={`relative ${extraClass}`} ref={sortRef}>
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
  );

  const hasActiveFilters = Boolean(
    nameQuery ||
    selectedDistrict ||
    districtQuery ||
    selectedLocation ||
    locationQuery ||
    (statusFilter && statusFilter !== 'ALL') ||
    sortOrder !== 'ID_DESC'
  );

  return (
    <div className="w-full max-w-[1280px] mx-auto pt-[calc(68px+1.5rem)] sm:pt-[calc(80px+2.5rem)] pb-20 px-4 sm:px-6 lg:px-8 min-h-screen bg-white">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 mb-8 sm:mb-10 pb-6 border-b border-[#eeeeee]">
        <div className="text-center sm:text-left w-full sm:w-auto">
          <h1 className="font-sans text-2xl sm:text-3xl md:text-[2.25rem] font-bold text-[#111111] mb-1.5 whitespace-nowrap text-center sm:text-left">
            Wild Tuskers List
          </h1>
          <p className="font-sans text-xs sm:text-[0.88rem] md:text-[0.95rem] text-[#777777] m-0 text-center sm:text-left">
            {tuskers.length} identified tuskers documented by the WTS team
          </p>
        </div>

        {/* Action Buttons: Add Tusker & Unlisted Monitoring for Admin */}
        {isAdmin && (
          <div className="flex max-sm:flex-row sm:flex-col lg:flex-row items-stretch sm:items-end lg:items-center gap-2 sm:gap-2.5 w-full sm:w-auto shrink-0 landscape:mr-4 sm:landscape:mr-6 lg:mr-0">
            <Link
              to="/admin/add-tusker"
              className="max-sm:flex-1 sm:w-full sm:min-w-[195px] lg:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-accent hover:bg-accent-hover text-primary font-semibold text-[0.78rem] sm:text-[0.85rem] shadow-sm hover:shadow-md transition-all duration-200 no-underline shrink-0 whitespace-nowrap text-center"
            >
              <PlusCircle size={15} />
              <span>Add a New Tusker</span>
            </Link>
            <Link
              to="/unlisted"
              className="max-sm:flex-1 sm:w-full sm:min-w-[195px] lg:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#faf5ec] hover:bg-[#f3ebd9] text-primary border border-accent/40 font-semibold text-[0.78rem] sm:text-[0.85rem] shadow-sm hover:shadow-md transition-all duration-200 no-underline shrink-0 whitespace-nowrap text-center"
            >
              <Radar size={15} className="text-accent" />
              <span>Unlisted Monitoring</span>
            </Link>
          </div>
        )}
      </div>

      {/* ── Search Toolbar: Name Search, District Filter, Location Filter ── */}
      <div className="flex items-center gap-3 sm:gap-3.5 mb-4 flex-wrap max-sm:flex-col">

        {/* Name Search (Stretched to fill remaining section width) */}
        <div className="relative flex-1 min-w-[220px] max-sm:w-full" ref={nameRef}>
          <div className="flex items-center gap-2 bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-2.5 transition-all focus-within:border-accent focus-within:bg-white focus-within:ring-3 focus-within:ring-accent/12">
            <Search size={16} className="text-[#aaaaaa] shrink-0" />
            <input
              type="text"
              className="border-none bg-transparent outline-none font-sans text-[0.88rem] sm:text-[0.9rem] text-[#111111] caret-[#111111] w-full placeholder:text-[#bbbbbb]"
              placeholder="Search tusker name or ID…"
              value={nameQuery}
              onChange={e => handleNameInput(e.target.value)}
              onFocus={() => nameQuery && setShowNameSugg(true)}
            />
            {nameQuery && (
              <button aria-label="Clear name search" className="bg-none border-none cursor-pointer text-[#aaaaaa] p-0 flex items-center shrink-0 transition-colors hover:text-[#555555]" onClick={() => handleNameInput('')}>
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

        {/* District Filter (Exact length) */}
        <div className="relative w-full sm:w-[230px] md:w-[245px] shrink-0" ref={districtRef}>
          <div className="flex items-center gap-2 bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-2.5 transition-all focus-within:border-accent focus-within:bg-white focus-within:ring-3 focus-within:ring-accent/12">
            <Layers size={16} className="text-[#aaaaaa] shrink-0 text-accent" />
            <input
              type="text"
              className="border-none bg-transparent outline-none font-sans text-[0.88rem] sm:text-[0.9rem] text-[#111111] caret-[#111111] w-full placeholder:text-[#bbbbbb]"
              placeholder="Filter by district…"
              value={districtQuery}
              onChange={e => handleDistrictInput(e.target.value)}
              onFocus={() => setShowDistrictDrop(true)}
              onClick={() => setShowDistrictDrop(true)}
            />
            <div className="flex items-center gap-1.5 shrink-0">
              {districtQuery && (
                <button
                  type="button"
                  aria-label="Clear district filter"
                  className="bg-none border-none cursor-pointer text-[#aaaaaa] p-0 flex items-center shrink-0 transition-colors hover:text-[#555555]"
                  onMouseDown={clearDistrict}
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="button"
                aria-label="Toggle district list"
                className="bg-none border-none cursor-pointer text-[#aaaaaa] p-0 flex items-center shrink-0 transition-colors hover:text-[#555555]"
                onClick={() => setShowDistrictDrop(prev => !prev)}
              >
                <ChevronDown size={14} className={`transition-transform duration-200 ${showDistrictDrop ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          {showDistrictDrop && districtSuggestions.length > 0 && (
            <ul className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border border-[#e2e8f0] rounded-[12px] shadow-[0_12px_32px_rgba(0,0,0,0.12)] z-[200] list-none m-0 py-1.5 max-h-[270px] overflow-y-auto overscroll-contain divide-y divide-[#f8f9fa]">
              {districtSuggestions.map(dist => (
                <li
                  key={dist}
                  className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer font-sans text-[0.88rem] text-[#333333] transition-colors hover:bg-[#faf5ec] ${selectedDistrict === dist ? 'bg-[#faf5ec]' : ''}`}
                  onMouseDown={() => pickDistrict(dist)}
                >
                  <Layers size={12} className="text-accent shrink-0" />
                  <span className="flex-1 text-[#111111] font-medium">{dist}</span>
                  <span className="ml-auto text-[0.78rem] text-[#aaaaaa]">
                    {countInDistrict(dist)} {countInDistrict(dist) === 1 ? 'tusker' : 'tuskers'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Location Filter (Exact length, District-scoped) */}
        <div className="relative w-full sm:w-[230px] md:w-[245px] shrink-0" ref={locationRef}>
          <div className="flex items-center gap-2 bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-2.5 transition-all focus-within:border-accent focus-within:bg-white focus-within:ring-3 focus-within:ring-accent/12">
            <MapPin size={16} className="text-[#aaaaaa] shrink-0 text-accent" />
            <input
              type="text"
              className="border-none bg-transparent outline-none font-sans text-[0.88rem] sm:text-[0.9rem] text-[#111111] caret-[#111111] w-full placeholder:text-[#bbbbbb]"
              placeholder={selectedDistrict ? `Location in ${selectedDistrict}…` : 'Filter by location…'}
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
            <ul className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border border-[#e2e8f0] rounded-[12px] shadow-[0_12px_32px_rgba(0,0,0,0.12)] z-[200] list-none m-0 py-1.5 max-h-[270px] overflow-y-auto overscroll-contain divide-y divide-[#f8f9fa]">
              {locSuggestions.map(loc => (
                <li
                  key={loc}
                  className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer font-sans text-[0.88rem] text-[#333333] transition-colors hover:bg-[#faf5ec] ${selectedLocation === loc ? 'bg-[#faf5ec]' : ''}`}
                  onMouseDown={() => pickLocation(loc)}
                >
                  <MapPin size={12} className="text-accent shrink-0" />
                  <span className="flex-1 text-[#111111] font-medium">{loc}</span>
                  <span className="ml-auto text-[0.78rem] text-[#aaaaaa]">
                    {countInArea(loc)} {countInArea(loc) === 1 ? 'tusker' : 'tuskers'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mobile-only Sort Dropdown: directly below Filter by Location */}
        {renderSortDropdown('w-full sm:hidden')}

      </div>

      {/* ── Living Status Filter & Sort Row: Desktop keeps Sort aligned on the right, directly under Location ── */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        {/* Living Status Pills (2x2 grid on mobile, flex on desktop) */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          {['ALL', ...LIVING_STATUSES].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`font-sans text-[0.8rem] sm:text-[0.82rem] font-semibold rounded-full px-3.5 py-1.5 border cursor-pointer transition-all flex items-center justify-center ${
                statusFilter === st
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-[#555555] border-[#e8e8e8] hover:border-accent hover:text-accent'
              }`}
            >
              <span>{st === 'ALL' ? 'All' : st}</span>
              <span className={`ml-1.5 font-normal ${statusFilter === st ? 'text-white/70' : 'text-[#aaaaaa]'}`}>
                {statusCounts[st] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Desktop-only Sort Dropdown: directly below Filter by Location */}
        {renderSortDropdown('hidden sm:block relative flex-1 min-w-[220px] max-w-[280px] max-md:max-w-full max-sm:max-w-full max-sm:w-full ml-auto')}
      </div>

      {/* ── Results Count ── */}
      <div className="flex items-center justify-between mb-7 font-sans text-[0.85rem] text-[#888888]">
        <span>{filtered.length} {filtered.length === 1 ? 'tusker' : 'tuskers'} found</span>
        {(nameQuery || selectedDistrict || districtQuery || selectedLocation || locationQuery || statusFilter !== 'ALL' || sortOrder !== 'ID_DESC') && (
          <button
            type="button"
            className="bg-none border-none font-sans text-[0.85rem] text-accent cursor-pointer font-semibold underline p-0 hover:text-accent-hover inline-flex items-center gap-1 transition-colors"
            onClick={clearFilters}
          >
            <X size={14} className="text-accent" />
            <span>Clear filters</span>
          </button>
        )}
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh] font-sans text-[#aaaaaa]">Loading tuskers…</div>
      ) : loadError ? (
        <div className="flex items-center justify-center min-h-[60vh] font-sans text-[#e53e3e]">Could not load tuskers: {loadError}</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3.5 sm:gap-x-6 gap-y-6 sm:gap-y-8 min-h-[60vh] content-start">
          {filtered.map(tusker => (
            <Link
              key={tusker.id}
              id={`tusker-card-${tusker.id.toLowerCase()}`}
              to={`/tuskers/${tusker.id.toLowerCase()}`}
              state={{ from: '/tuskers' }}
              onClick={() => {
                try {
                  sessionStorage.setItem('wts_last_tusker_id', tusker.id.toLowerCase());
                  sessionStorage.setItem('wts_last_tusker_scroll', String(window.scrollY));
                } catch {}
              }}
              className="flex flex-col gap-2.5 cursor-pointer group no-underline text-inherit"
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
                <p className="font-sans text-[0.80rem] sm:text-[0.85rem] font-semibold text-[#111111] leading-[1.35] m-0">
                  {tusker.id} – {tusker.name}
                  {tusker.sinhala && <span className="font-normal text-[#444444]"> ({tusker.sinhala})</span>}
                </p>
                <p className="font-sans text-[0.8rem] text-[#888888] m-0 flex items-center gap-1.5 truncate">
                  <MapPin size={11} className="text-accent shrink-0" />
                  <span className="truncate">{tusker.location || 'Location not recorded'}</span>
                </p>
              </div>
            </Link>
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
