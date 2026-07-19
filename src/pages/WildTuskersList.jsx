import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, X, ChevronDown } from 'lucide-react';
import { getTuskers } from '../utils/tuskersStore';
import './WildTuskersList.css';

export default function WildTuskersList() {
  const navigate = useNavigate();
  const tuskers = useMemo(() => getTuskers(), []);

  const allLocations = useMemo(() => {
    return [...new Set(tuskers.map(t => t.location).filter(Boolean))].sort();
  }, [tuskers]);

  const [nameQuery, setNameQuery]         = useState('');
  const [nameSuggestions, setNameSugg]    = useState([]);
  const [showNameSugg, setShowNameSugg]   = useState(false);

  const [locationQuery, setLocationQuery] = useState('');
  const [selectedLocation, setSelectedLoc]= useState('');
  const [showLocDrop, setShowLocDrop]     = useState(false);
  const [locSuggestions, setLocSugg]      = useState([]);

  const [sortAZ, setSortAZ]               = useState(true); // true = A→Z, false = Z→A

  const nameRef     = useRef(null);
  const locationRef = useRef(null);

  /* ── Name auto-suggest ─────────────────────── */
  const handleNameInput = (val) => {
    setNameQuery(val);
    if (val.trim().length < 1) { setNameSugg([]); setShowNameSugg(false); return; }
    const hits = tuskers
      .filter(t => t.name.toLowerCase().includes(val.toLowerCase()) ||
                   t.id.toLowerCase().includes(val.toLowerCase()))
      .slice(0, 6);
    setNameSugg(hits);
    setShowNameSugg(true);
  };

  const pickName = (tusker) => {
    setNameQuery(tusker.name);
    setNameSugg([]);
    setShowNameSugg(false);
  };

  /* ── Location auto-suggest ─────────────────── */
  const handleLocInput = (val) => {
    setLocationQuery(val);
    setSelectedLoc('');
    if (val.trim().length < 1) { setLocSugg(allLocations); setShowLocDrop(true); return; }
    const hits = allLocations.filter(l => l.toLowerCase().includes(val.toLowerCase()));
    setLocSugg(hits);
    setShowLocDrop(true);
  };

  const pickLocation = (loc) => {
    setSelectedLoc(loc);
    setLocationQuery(loc);
    setShowLocDrop(false);
  };

  const clearLocation = () => {
    setSelectedLoc('');
    setLocationQuery('');
    setLocSugg([]);
    setShowLocDrop(false);
  };

  /* ── Close dropdowns on outside click ─────── */
  useEffect(() => {
    const handler = (e) => {
      if (nameRef.current && !nameRef.current.contains(e.target)) setShowNameSugg(false);
      if (locationRef.current && !locationRef.current.contains(e.target)) setShowLocDrop(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Filter + Sort ─────────────────────────── */
  const filtered = useMemo(() => {
    let list = [...tuskers];
    if (nameQuery.trim()) {
      const q = nameQuery.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
    }
    if (selectedLocation) {
      list = list.filter(t => t.location === selectedLocation);
    }
    list.sort((a, b) =>
      sortAZ ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    return list;
  }, [nameQuery, selectedLocation, sortAZ]);

  return (
    <div className="tuskers-page">

      {/* ── Page Header ── */}
      <div className="tuskers-header">
        <h1 className="tuskers-title">Wild Tuskers List</h1>
        <p className="tuskers-subtitle">
          {tuskers.length} identified tuskers documented by the WTS team
        </p>
      </div>

      {/* ── Search Toolbar ── */}
      <div className="tuskers-toolbar">

        {/* Name Search */}
        <div className="search-field" ref={nameRef}>
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search tusker name or ID…"
              value={nameQuery}
              onChange={e => handleNameInput(e.target.value)}
              onFocus={() => nameQuery && setShowNameSugg(true)}
            />
            {nameQuery && (
              <button className="search-clear" onClick={() => { setNameQuery(''); setNameSugg([]); setShowNameSugg(false); }}>
                <X size={14} />
              </button>
            )}
          </div>
          {showNameSugg && nameSuggestions.length > 0 && (
            <ul className="suggest-dropdown">
              {nameSuggestions.map(t => (
                <li key={t.id} className="suggest-item" onMouseDown={() => pickName(t)}>
                  <span className="suggest-id">{t.id}</span>
                  <span className="suggest-name">{t.name}</span>
                  <span className="suggest-loc"><MapPin size={11} />{t.location}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Location Filter */}
        <div className="search-field location-field" ref={locationRef}>
          <div className="search-input-wrap">
            <MapPin size={16} className="search-icon location-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Filter by location…"
              value={locationQuery}
              onChange={e => handleLocInput(e.target.value)}
              onFocus={() => { setLocSugg(allLocations); setShowLocDrop(true); }}
            />
            {locationQuery
              ? <button className="search-clear" onMouseDown={clearLocation}><X size={14} /></button>
              : <ChevronDown size={14} className="search-chevron" />
            }
          </div>
          {showLocDrop && locSuggestions.length > 0 && (
            <ul className="suggest-dropdown">
              {locSuggestions.map(loc => (
                <li
                  key={loc}
                  className={`suggest-item ${selectedLocation === loc ? 'active' : ''}`}
                  onMouseDown={() => pickLocation(loc)}
                >
                  <MapPin size={12} className="loc-pin" />
                  <span>{loc}</span>
                  <span className="loc-count">
                    {tuskers.filter(t => t.location === loc).length} tuskers
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>


      </div>

      {/* ── Results Count ── */}
      <div className="tuskers-results-bar">
        <span>{filtered.length} {filtered.length === 1 ? 'tusker' : 'tuskers'} found</span>
        {(nameQuery || selectedLocation) && (
          <button className="clear-all" onClick={() => { setNameQuery(''); setSelectedLoc(''); setLocationQuery(''); }}>
            Clear filters
          </button>
        )}
      </div>

      {/* ── Grid ── */}
      {filtered.length > 0 ? (
        <div className="tuskers-grid">
          {filtered.map(tusker => (
            <div
              key={tusker.id}
              className="tusker-card"
              onClick={() => navigate(`/tuskers/${tusker.id.toLowerCase()}`)}
            >
              <div className="tusker-card-image">
                <span className="tusker-card-id-badge">{tusker.id}</span>
                <span className="tusker-card-location"><MapPin size={10} /> {tusker.location}</span>
              </div>
              <div className="tusker-card-info">
                <p className="tusker-card-name">
                  {tusker.id} – {tusker.name}{' '}
                  <span className="tusker-sinhala">({tusker.sinhala})</span>
                </p>
                <p className="tusker-card-photos">{tusker.photos?.length || 0} photos</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="tuskers-empty">
          <Search size={40} strokeWidth={1.2} />
          <p>No tuskers match your search.</p>
          <button className="clear-all" onClick={() => { setNameQuery(''); setSelectedLoc(''); setLocationQuery(''); }}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
