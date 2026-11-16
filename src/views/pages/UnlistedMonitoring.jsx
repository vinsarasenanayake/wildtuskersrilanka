import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, X, ChevronDown, PlusCircle, Trash2, ShieldAlert } from 'lucide-react';
import { useUnlistedTuskers } from '../../controllers/useUnlistedTuskers';
import ImageUploadBox from '../components/ImageUploadBox';

export default function UnlistedMonitoring() {
  const navigate = useNavigate();
  const {
    tuskers,
    filtered,
    searchQuery,
    locationQuery,
    selectedLocation,
    showLocDrop,
    setShowLocDrop,
    locSuggestions,
    handleSearchInput,
    handleLocInput,
    pickLocation,
    clearLocation,
    clearFilters,
    focusLocation,
    isAdmin,
    authLoading,
    addUnlistedTusker,
    deleteUnlistedTusker,
  } = useUnlistedTuskers();

  const searchRef = useRef(null);
  const locationRef = useRef(null);

  // Modal states for admin adding new entries
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFormData, setNewFormData] = useState({
    id: '',
    location: '',
    listedDate: new Date().toISOString().split('T')[0],
    recordedBy: 'WTS Field Team',
    description: '',
    specialMarks: '',
    photoUrl: '',
    photos: []
  });

  /* ── Click Outside to Close Location Dropdown ── */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowLocDrop(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [setShowLocDrop]);

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Unlisted Monitoring';
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newFormData.location || !newFormData.description) {
      alert('Please provide at least location and description.');
      return;
    }
    const photos = (newFormData.photos && newFormData.photos.length > 0)
      ? newFormData.photos
      : (newFormData.photoUrl
          ? (newFormData.photoUrl.includes(',')
              ? newFormData.photoUrl.split(',').map(s => s.trim()).filter(Boolean)
              : [newFormData.photoUrl])
          : []);
    let created;
    try {
      created = await addUnlistedTusker({
        id: newFormData.id.trim() || undefined,
        location: newFormData.location,
        listedDate: newFormData.listedDate,
        recordedBy: newFormData.recordedBy || 'WTS Field Team',
        description: newFormData.description,
        specialMarks: newFormData.specialMarks || 'None recorded.',
        photos
      });
    } catch (err) {
      alert(`Could not add unlisted tusker: ${err.message}`);
      return;
    }
    setShowAddModal(false);
    setNewFormData({
      id: '',
      location: 'Yala',
      listedDate: new Date().toISOString().split('T')[0],
      recordedBy: 'WTS Field Team',
      description: '',
      specialMarks: '',
      photoUrl: ''
    });
    if (created && created.id) {
      navigate('/unlisted/' + encodeURIComponent(created.id.toLowerCase().replace(/\s+/g, '-')));
    }
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${id} from Unlisted Monitoring?`)) {
      deleteUnlistedTusker(id);
    }
  };

  // Admin access guard
  if (authLoading) {
    return (
      <div className="w-full min-h-[70vh] pt-[calc(80px+4rem)] flex items-center justify-center font-sans text-[#888888]">
        Loading…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="w-full max-w-[800px] mx-auto pt-[calc(80px+4rem)] pb-20 px-8 min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center mb-4 border border-amber-500/30">
          <ShieldAlert size={32} />
        </div>
        <h1 className="font-sans text-[2rem] font-bold text-[#111111] mb-2">Admin Access Required</h1>
        <p className="font-sans text-[#666666] max-w-[480px] mb-8 text-[0.95rem] leading-relaxed">
          The Unlisted Monitoring registry contains provisional observation records and is strictly reserved for authorized administrators.
        </p>
        <Link
          to="/login"
          className="bg-primary hover:bg-primary-light text-white font-semibold text-[0.92rem] px-7 py-3 rounded-[8px] transition-all shadow-md"
        >
          Admin Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto pt-[calc(80px+2.5rem)] pb-20 px-8 min-h-screen bg-white">

      {/* ── Page Header ── */}
      <div className="text-center mb-10 pb-6 border-b border-[#eeeeee] relative">
        <div className="flex flex-col items-center">
          <h1 className="font-sans text-[2.25rem] font-bold text-[#111111] mb-1.5">
            Unlisted Monitoring
          </h1>
          <p className="font-sans text-[0.95rem] text-[#777777] max-w-[640px] leading-relaxed">
            {tuskers.length} unlisted tuskers under active observation across Sri Lanka
          </p>
        </div>

        {/* Admin Add Button */}
        <div className="mt-4 sm:absolute sm:top-2 sm:right-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-accent text-primary font-semibold text-[0.88rem] px-4 py-2 rounded-[6px] inline-flex items-center gap-1.5 shadow-[0_4px_10px_rgba(11,37,24,0.15)] hover:-translate-y-[0.5px] hover:bg-accent-hover transition-all duration-300 border-none cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>Add Unlisted Tusker</span>
          </button>
        </div>
      </div>

      {/* ── Search Toolbar ── */}
      <div className="flex items-center gap-4 mb-4 flex-wrap max-sm:flex-col">

        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-sm:max-w-full max-sm:w-full" ref={searchRef}>
          <div className="flex items-center gap-2 bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-2.5 transition-all focus-within:border-accent focus-within:bg-white focus-within:ring-3 focus-within:ring-accent/12">
            <Search size={16} className="text-[#aaaaaa] shrink-0" />
            <input
              type="text"
              className="border-none bg-transparent outline-none font-sans text-[0.9rem] text-[#111111] caret-[#111111] w-full placeholder:text-[#bbbbbb]"
              placeholder="Search unlisted ID or location..."
              value={searchQuery}
              onChange={e => handleSearchInput(e.target.value)}
            />
            {searchQuery && (
              <button
                className="bg-none border-none cursor-pointer text-[#aaaaaa] p-0 flex items-center shrink-0 transition-colors hover:text-[#555555]"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Location Filter */}
        <div className="relative flex-1 min-w-[220px] max-w-[280px] max-md:max-w-full max-sm:max-w-full max-sm:w-full" ref={locationRef}>
          <div className="flex items-center gap-2 bg-[#f7f7f8] border-1.5 border-[#e8e8e8] rounded-[10px] px-3.5 py-2.5 transition-all focus-within:border-accent focus-within:bg-white focus-within:ring-3 focus-within:ring-accent/12">
            <MapPin size={16} className="text-[#aaaaaa] shrink-0 text-accent" />
            <input
              type="text"
              className="border-none bg-transparent outline-none font-sans text-[0.9rem] text-[#111111] caret-[#111111] w-full placeholder:text-[#bbbbbb]"
              placeholder="Filter by location..."
              value={locationQuery}
              onChange={e => handleLocInput(e.target.value)}
              onFocus={focusLocation}
            />
            {locationQuery ? (
              <button
                className="bg-none border-none cursor-pointer text-[#aaaaaa] p-0 flex items-center shrink-0 transition-colors hover:text-[#555555]"
                onMouseDown={clearLocation}
              >
                <X size={14} />
              </button>
            ) : (
              <ChevronDown size={14} className="text-[#aaaaaa] shrink-0 pointer-events-none" />
            )}
          </div>

          {showLocDrop && locSuggestions.length > 0 && (
            <ul className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border-1.5 border-[#e8e8e8] rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.1)] z-[200] list-none m-0 py-1.5 overflow-hidden">
              {locSuggestions.map(loc => (
                <li
                  key={loc}
                  className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer font-sans text-[0.88rem] text-[#333333] transition-colors hover:bg-[#faf5ec] ${
                    selectedLocation === loc ? 'bg-[#faf5ec]' : ''
                  }`}
                  onMouseDown={() => pickLocation(loc)}
                >
                  <MapPin size={12} className="text-accent shrink-0" />
                  <span className="flex-1 text-[#111111] font-medium">{loc}</span>
                  <span className="ml-auto text-[0.78rem] text-[#aaaaaa]">
                    {tuskers.filter(t => t.location === loc).length} unlisted
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

      {/* ── Results Count ── */}
      <div className="flex items-center justify-between mb-7 font-sans text-[0.85rem] text-[#888888]">
        <span>{filtered.length} {filtered.length === 1 ? 'unlisted tusker' : 'unlisted tuskers'} found</span>
        {(searchQuery || selectedLocation) && (
          <button
            className="bg-none border-none font-sans text-[0.85rem] text-accent cursor-pointer font-medium underline p-0 hover:text-accent-hover"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Grid: Navigates to full profile page on click (no popup) ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8 min-h-[60vh] content-start">
          {filtered.map(item => (
            <div
              key={item.id}
              className="flex flex-col gap-2.5 cursor-pointer group relative"
              onClick={() => navigate('/unlisted/' + encodeURIComponent(item.id.toLowerCase().replace(/\s+/g, '-')))}
            >
              {/* Square Image / Placeholder */}
              <div className="w-full aspect-square bg-[#e8e8e8] rounded-[6px] relative overflow-hidden flex flex-col items-center justify-center gap-1 transition-opacity duration-200 group-hover:opacity-85 shadow-xs">
                {item.photos && item.photos.length > 0 ? (
                  <img
                    src={item.photos[0]}
                    alt={item.id}
                    className="w-full h-full object-cover absolute inset-0"
                  />
                ) : null}
                <span className="font-sans text-[1rem] font-bold text-[#888888] tracking-widest z-[1] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  {item.id}
                </span>
                <span className="flex items-center gap-[3px] font-sans text-[0.74rem] text-[#aaaaaa] z-[1] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  <MapPin size={10} /> {item.location}
                </span>
              </div>

              {/* Title & Location Below Card */}
              <div className="flex flex-col gap-0.5">
                <p className="font-sans text-[0.92rem] font-bold text-[#111111] leading-[1.4] m-0">
                  {item.id}
                </p>
                <p className="font-sans text-[0.82rem] text-[#888888] m-0 flex items-center gap-1">
                  <MapPin size={11} className="text-accent" /> {item.location}
                </p>
              </div>

              {/* Admin Quick Delete */}
              <button
                onClick={(e) => handleDelete(item.id, e)}
                title={`Delete ${item.id}`}
                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-rose-50 text-gray-500 hover:text-rose-600 flex items-center justify-center border-none shadow-sm cursor-pointer transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 min-h-[60vh] py-8 px-4 text-[#bbbbbb] font-sans text-[0.95rem]">
          <Search size={40} strokeWidth={1.2} />
          <p>No unlisted tuskers match your search.</p>
          <button
            className="bg-none border-none font-sans text-[0.85rem] text-accent cursor-pointer font-medium underline p-0 hover:text-accent-hover"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* ── Add Unlisted Tusker Modal (Admin Creation Only) ── */}
      {showAddModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs animate-fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-[16px] max-w-[540px] w-full p-6 shadow-2xl border border-[#e8e8e8] flex flex-col gap-4 my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-[#eeeeee]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h3 className="font-sans text-[1.15rem] font-bold text-[#111111] m-0">Add Unlisted Tusker</h3>
                  <p className="font-sans text-xs text-[#888888] m-0">Create a provisional monitoring entry</p>
                </div>
              </div>
              <button
                className="w-8 h-8 rounded-full border-none bg-[#f5f5f5] hover:bg-[#e8e8e8] text-[#555555] cursor-pointer flex items-center justify-center transition-colors"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Unlisted ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. UNLISTED ${String(tuskers.length + 1).padStart(3, '0')}`}
                    value={newFormData.id}
                    onChange={e => setNewFormData({ ...newFormData, id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yala, Galgamuwa, Minneriya"
                    value={newFormData.location}
                    onChange={e => setNewFormData({ ...newFormData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    First Spotted Date
                  </label>
                  <input
                    type="date"
                    value={newFormData.listedDate}
                    onChange={e => setNewFormData({ ...newFormData, listedDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    First Sighted By
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. WTS Team / Ranger"
                    value={newFormData.recordedBy}
                    onChange={e => setNewFormData({ ...newFormData, recordedBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Special Marks & Identifiers
                </label>
                <input
                  type="text"
                  placeholder="e.g. Broken left tusk tip, triangular tear on right ear"
                  value={newFormData.specialMarks}
                  onChange={e => setNewFormData({ ...newFormData, specialMarks: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Field Description / Observation Details *
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Record initial sighting coordinates, estimated age, tusk shape, herd behavior..."
                  value={newFormData.description}
                  onChange={e => setNewFormData({ ...newFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-accent resize-y"
                />
              </div>

              <ImageUploadBox
                label="Direct Photo Upload"
                folder="unlisted"
                multiple
                value={newFormData.photos && newFormData.photos.length > 0 ? newFormData.photos : (newFormData.photoUrl ? [newFormData.photoUrl] : [])}
                onChange={(urls) => {
                  const list = Array.isArray(urls) ? urls : (urls ? [urls] : []);
                  setNewFormData({ ...newFormData, photos: list, photoUrl: list[0] || '' });
                }}
                aspectClass="aspect-[16/10]"
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-light rounded-lg border-none shadow-sm cursor-pointer"
                >
                  Save Unlisted Tusker
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
