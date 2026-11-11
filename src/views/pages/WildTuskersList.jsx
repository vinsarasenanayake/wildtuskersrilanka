import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, X, ChevronDown } from 'lucide-react';
import { useTuskerList } from '../../controllers/useTusker';

export default function WildTuskersList() {
  const navigate = useNavigate();
  const {
    filtered,
    tuskers,
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

  /* ── Click Outside to Close ────────────────── */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (nameRef.current && !nameRef.current.contains(e.target)) {
        setShowNameSugg(false);
      }
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowLocDrop(false);
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
      <div className="text-center mb-10 pb-6 border-b border-[#eeeeee]">
        <h1 className="font-sans text-[2.25rem] font-bold text-[#111111] mb-1.5">Wild Tuskers List</h1>
        <p className="font-sans text-[0.95rem] text-[#777777]">
          {tuskers.length} identified tuskers documented by the WTS team
        </p>
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
            />
            {locationQuery
              ? <button className="bg-none border-none cursor-pointer text-[#aaaaaa] p-0 flex items-center shrink-0 transition-colors hover:text-[#555555]" onMouseDown={clearLocation}><X size={14} /></button>
              : <ChevronDown size={14} className="text-[#aaaaaa] shrink-0 pointer-events-none" />
            }
          </div>
          {showLocDrop && locSuggestions.length > 0 && (
            <ul className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border-1.5 border-[#e8e8e8] rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.1)] z-[200] list-none m-0 py-1.5 overflow-hidden">
              {locSuggestions.map(loc => (
                <li
                  key={loc}
                  className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer font-sans text-[0.88rem] text-[#333333] transition-colors hover:bg-[#faf5ec] ${selectedLocation === loc ? 'bg-[#faf5ec]' : ''}`}
                  onMouseDown={() => pickLocation(loc)}
                >
                  <MapPin size={12} className="text-accent shrink-0" />
                  <span className="flex-1 text-[#111111] font-medium">{loc}</span>
                  <span className="ml-auto text-[0.78rem] text-[#aaaaaa]">
                    {tuskers.filter(t => t.location === loc).length} tuskers
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

      {/* ── Results Count ── */}
      <div className="flex items-center justify-between mb-7 font-sans text-[0.85rem] text-[#888888]">
        <span>{filtered.length} {filtered.length === 1 ? 'tusker' : 'tuskers'} found</span>
        {(nameQuery || selectedLocation) && (
          <button className="bg-none border-none font-sans text-[0.85rem] text-accent cursor-pointer font-medium underline p-0 hover:text-accent-hover" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      {/* ── Grid ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8 min-h-[60vh] content-start">
          {filtered.map(tusker => (
            <div
              key={tusker.id}
              className="flex flex-col gap-2.5 cursor-pointer group"
              onClick={() => navigate(`/tuskers/${tusker.id.toLowerCase()}`)}
            >
              <div className="w-full aspect-square bg-[#e8e8e8] rounded-[6px] relative overflow-hidden flex flex-col items-center justify-center gap-1 transition-opacity duration-200 group-hover:opacity-82">
                {tusker.photos && tusker.photos.length > 0 && (
                  <img src={tusker.photos[0]} alt={tusker.name} className="w-full h-full object-cover absolute inset-0" />
                )}
                <span className="font-sans text-[1rem] font-semibold text-[#999999] tracking-widest z-[1] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{tusker.id}</span>
                <span className="flex items-center gap-[3px] font-sans text-[0.72rem] text-[#bbbbbb] z-[1] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"><MapPin size={10} /> {tusker.location}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="font-sans text-[0.88rem] font-semibold text-[#111111] leading-[1.4] m-0">
                  {tusker.id} – {tusker.name}{' '}
                  <span className="font-normal text-[#444444]">({tusker.sinhala})</span>
                </p>
                <p className="font-sans text-[0.8rem] text-[#999999] m-0">{tusker.location}</p>
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
    </div>
  );
}
