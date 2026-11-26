/**
 * @file LocationSearchInput.jsx
 * @description Multi-location search input with auto-suggestions from the comprehensive
 * Sri Lanka wildlife database, live geocoding, and an interactive click-to-pick map modal.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Search, X, Map, Check, Navigation, Loader2, Info } from 'lucide-react';
import {
  SRI_LANKA_WILDLIFE_LOCATIONS,
  resolveLocationCoordinatesAsync,
  getLocationCoordinates,
  cacheLocationCoordinates,
  reverseGeocodeCoordinatesAsync,
  searchPlacesLive,
} from '../../utils/sriLankaLocations';
import { createMap } from '../../utils/mapEngine';
import useFocusTrap from '../../hooks/useFocusTrap';

const parseLocations = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
  return String(val)
    .split(/\s*[/]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
};

/**
 * LocationSearchInput
 * Reusable location search & select input with live place search (Photon / OpenStreetMap),
 * full Sri Lanka locations database (cities, towns, villages, tanks, sanctuaries),
 * multi-location support, and an interactive map modal (CARTO Voyager + satellite) with click-to-pick pin and reverse geocoding.
 */
export default function LocationSearchInput({
  name = 'location',
  value = '',
  onChange,
  onSelectPlace,
  placeholder = 'Search & select location (e.g. Yala, Kumana, Wilpattu, Colombo)...',
  required = false,
  className = '',
  id,
  disabled = false,
  showMapButton = true,
  autoComplete = 'off',
  multi = false,
}) {
  const [inputValue, setInputValue] = useState(multi ? '' : value || '');
  const [selectedLocations, setSelectedLocations] = useState(() => (multi ? parseLocations(value) : []));
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalSuggestions, setModalSuggestions] = useState([]);
  const [pendingPickedLocation, setPendingPickedLocation] = useState(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const modalDebounceRef = useRef(null);
  const mapModalRef = useRef(null);
  const mapCloseBtnRef = useRef(null);

  useFocusTrap(mapModalRef, showMapModal, {
    initialFocusRef: mapCloseBtnRef,
    onEscape: () => setShowMapModal(false),
  });
  const modalMapContainerRef = useRef(null);
  const modalMapRef = useRef(null);
  const modalMarkerRef = useRef(null);

  // Live in-modal search effect supporting all Sri Lankan locations & live geocoder
  useEffect(() => {
    const q = modalSearch.trim().toLowerCase();
    if (!q) {
      const topParks = SRI_LANKA_WILDLIFE_LOCATIONS.filter(
        (loc) => loc.type === 'National Park' || loc.type === 'Sanctuary'
      ).slice(0, 8);
      setModalSuggestions(topParks);
      return;
    }

    const localMatches = SRI_LANKA_WILDLIFE_LOCATIONS.filter(
      (loc) => loc.name.toLowerCase().includes(q) || (loc.region && loc.region.toLowerCase().includes(q))
    ).slice(0, 8).map(loc => ({
      name: loc.name,
      type: loc.type || 'Location',
      region: loc.region || 'Sri Lanka',
      lat: loc.lat,
      lng: loc.lng,
    }));

    setModalSuggestions(localMatches);

    if (q.length >= 2 && typeof fetch !== 'undefined') {
      if (modalDebounceRef.current) clearTimeout(modalDebounceRef.current);
      modalDebounceRef.current = setTimeout(() => {
        searchPlacesLive(q, { limit: 8 })
          .then((data) => {
            if (data && data.length > 0) {
              const geoMatches = data.map((item) => ({
                name: item.title,
                type: item.badge || item.type || 'Location',
                region: item.subtitle || 'Sri Lanka',
                lat: item.lat,
                lng: item.lng,
                getCoords: item.getCoords,
              }));
              setModalSuggestions((prev) => {
                const merged = [...prev];
                geoMatches.forEach((gm) => {
                  if (!merged.some((m) => m.name.toLowerCase() === gm.name.toLowerCase())) {
                    merged.push(gm);
                  }
                });
                return merged.slice(0, 10);
              });
            }
          })
          .catch(() => {});
      }, 300);
    }
  }, [modalSearch]);

  // Sync external value changes
  useEffect(() => {
    if (multi) {
      const parsed = parseLocations(value);
      setSelectedLocations((prev) => {
        if (prev.length === parsed.length && prev.every((item, idx) => item === parsed[idx])) {
          return prev;
        }
        return parsed;
      });
    } else {
      setInputValue(value || '');
    }
  }, [value, multi]);

  // While the map picker is open: freeze the page behind it and close on Esc
  useEffect(() => {
    if (!showMapModal) return undefined;
    const { body, documentElement } = document;
    const prev = {
      bodyOverflow: body.style.overflow,
      bodyPadding: body.style.paddingRight,
      htmlOverflow: documentElement.style.overflow,
    };
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        e.stopPropagation();
        setShowMapModal(false);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      body.style.overflow = prev.bodyOverflow;
      body.style.paddingRight = prev.bodyPadding;
      documentElement.style.overflow = prev.htmlOverflow;
      window.removeEventListener('keydown', onKey, true);
    };
  }, [showMapModal]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dispatch change event to parent
  const emitChange = useCallback(
    (newVal, placeObj = null) => {
      if (!multi) {
        setInputValue(newVal);
      }
      if (typeof onChange === 'function') {
        const syntheticEvent = {
          target: { name, value: newVal },
          currentTarget: { name, value: newVal },
        };
        onChange(syntheticEvent, newVal);
      }
      if (placeObj && typeof onSelectPlace === 'function') {
        onSelectPlace(placeObj);
      }
    },
    [multi, name, onChange, onSelectPlace]
  );

  // Search logic combining curated Sri Lanka wildlife locations + live place search
  const performSearch = useCallback(
    (query) => {
      const q = query.trim().toLowerCase();
      if (!q || q.length < 1) {
        // Default: show top national parks when user focuses empty input
        const defaultParks = SRI_LANKA_WILDLIFE_LOCATIONS.filter(
          (p) => p.type === 'National Park' || p.type === 'Sanctuary'
        )
          .slice(0, 8)
          .map((p) => ({
            title: p.name,
            subtitle: `${p.type} • ${p.region}`,
            full: `${p.name}, Sri Lanka`,
            source: 'wts_database',
            badge: p.type,
            lat: p.lat,
            lng: p.lng,
          }));
        setSuggestions(defaultParks);
        return;
      }

      setLoading(true);

      // Local WTS locations + live OpenStreetMap place search
      fallbackLocalSearch(q);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const fallbackLocalSearch = (q) => {
    const localMatches = SRI_LANKA_WILDLIFE_LOCATIONS.filter(
      (loc) => loc.name.toLowerCase().includes(q) || (loc.region && loc.region.toLowerCase().includes(q))
    ).map((p) => ({
      title: p.name,
      subtitle: `${p.type} • ${p.region}`,
      full: `${p.name}, Sri Lanka`,
      source: 'wts_database',
      badge: p.type,
      lat: p.lat,
      lng: p.lng,
    }));

    if (q.length >= 2 && typeof fetch !== 'undefined') {
      searchPlacesLive(q, { limit: 6 })
        .then((data) => {
          setLoading(false);
          const geocoderMatches = (data || []).map((item) => ({ ...item, source: 'osm' }));

          const combined = [...localMatches];
          geocoderMatches.forEach((gm) => {
            if (gm?.title && !combined.some((c) => (c?.title || '').toLowerCase() === (gm.title || '').toLowerCase())) {
              combined.push(gm);
            }
          });
          const hasExact = combined.some((c) => (c?.title || '').toLowerCase() === q);
          if (!hasExact && q.length > 0) {
            combined.push({
              title: q.charAt(0).toUpperCase() + q.slice(1),
              subtitle: 'Use as location • Auto-resolved on map',
              full: `${q}, Sri Lanka`,
              source: 'custom_entry',
            });
          }
          setSuggestions(combined.slice(0, 8));
        })
        .catch(() => {
          setLoading(false);
          const combined = [...localMatches];
          if (!combined.some((c) => c.title.toLowerCase() === q) && q.length > 0) {
            combined.push({
              title: q.charAt(0).toUpperCase() + q.slice(1),
              subtitle: 'Use as location • Auto-resolved on map',
              full: `${q}, Sri Lanka`,
              source: 'custom_entry',
            });
          }
          setSuggestions(combined.slice(0, 8));
        });
    } else {
      setLoading(false);
      const combined = [...localMatches];
      if (!combined.some((c) => c.title.toLowerCase() === q) && q.length > 0) {
        combined.push({
          title: q.charAt(0).toUpperCase() + q.slice(1),
          subtitle: 'Use as location • Auto-resolved on map',
          full: `${q}, Sri Lanka`,
          source: 'custom_entry',
        });
      }
      setSuggestions(combined.slice(0, 8));
    }
  };

  // Debounced input change
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (!multi) {
      emitChange(val);
    }
    setIsOpen(true);
    setSelectedIndex(-1);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      performSearch(val);
    }, 200);
  };

  const handleFocus = () => {
    setIsOpen(true);
    performSearch(inputValue);
  };

  const handleSelectLocation = (placeName, placeObj = null) => {
    const clean = (placeName || '').trim();
    if (!clean) return;

    // Cache coordinates if available, or resolve in background
    if (placeObj && typeof placeObj.lat === 'number' && typeof placeObj.lng === 'number') {
      cacheLocationCoordinates(clean, { lat: placeObj.lat, lng: placeObj.lng });
    } else {
      resolveLocationCoordinatesAsync(clean);
    }

    if (multi) {
      if (!selectedLocations.some((loc) => loc.toLowerCase() === clean.toLowerCase())) {
        const next = [...selectedLocations, clean];
        setSelectedLocations(next);
        emitChange(next.join(' / '), placeObj);
      }
      setInputValue('');
      setSuggestions([]);
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.focus();
    } else {
      emitChange(clean, placeObj);
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleSelect = async (item) => {
    const placeName = item.title || item.full;
    let place = item;
    if (typeof item.lat !== 'number' && typeof item.getCoords === 'function') {
      const coords = await item.getCoords();
      if (coords) place = { ...item, ...coords };
    }
    if (typeof place.lat === 'number' && typeof place.lng === 'number') {
      cacheLocationCoordinates(placeName, { lat: place.lat, lng: place.lng });
    }
    handleSelectLocation(placeName, place);
  };

  const handleRemoveLocation = (indexToRemove) => {
    if (!multi) return;
    const next = selectedLocations.filter((_, idx) => idx !== indexToRemove);
    setSelectedLocations(next);
    emitChange(next.join(' / '));
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (multi) {
      if (inputValue) {
        setInputValue('');
        setSuggestions([]);
      } else {
        setSelectedLocations([]);
        emitChange('');
        setSuggestions([]);
      }
    } else {
      emitChange('');
      setSuggestions([]);
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelect(suggestions[selectedIndex]);
      } else if (inputValue.trim()) {
        handleSelectLocation(inputValue.trim());
      }
      return;
    }

    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Red "picked location" pin used in the map picker
  const PICK_PIN_HTML = `
    <div style="position: relative; width: 34px; height: 42px; cursor: pointer; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.5));">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 44" width="34" height="42">
        <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z" fill="#dc2626" stroke="#ffffff" stroke-width="2.5"/>
        <circle cx="18" cy="18" r="7" fill="#ffffff"/>
        <circle cx="18" cy="18" r="4" fill="#dc2626"/>
      </svg>
    </div>
  `;

  const placePickPin = (lat, lng, name) => {
    const map = modalMapRef.current;
    if (!map) return;
    const popup = name
      ? {
          badge: 'Selected Location',
          title: name,
          lines: [`${lat.toFixed(4)}, ${lng.toFixed(4)}`],
        }
      : null;
    if (modalMarkerRef.current) {
      modalMarkerRef.current.setPosition([lat, lng]);
    } else {
      modalMarkerRef.current = map.addMarker([lat, lng], { html: PICK_PIN_HTML, height: 42, popup });
    }
    if (popup) modalMarkerRef.current.openPopup(popup);
  };

  // Create the map inside the picker (Google Maps when a key is set, free maps otherwise)
  useEffect(() => {
    if (!showMapModal) return undefined;

    let active = true;
    let created = null;
    const SRI_LANKA_CENTER = [7.8731, 80.7718];
    const activeQuery =
      inputValue.trim() ||
      (multi && selectedLocations.length > 0 ? selectedLocations[selectedLocations.length - 1] : '');

    createMap(modalMapContainerRef.current, { center: SRI_LANKA_CENTER, zoom: 8, gestureHandling: 'greedy' })
      .then((map) => {
        if (!active) { map.destroy(); return; }
        created = map;
        modalMapRef.current = map;
        modalMarkerRef.current = null;

        const showExisting = (coords) => {
          map.setView([coords.lat, coords.lng], 13, { animate: false });
          placePickPin(coords.lat, coords.lng, activeQuery);
          setPendingPickedLocation({ name: activeQuery, lat: coords.lat, lng: coords.lng });
        };
        if (activeQuery) {
          const existingCoords = getLocationCoordinates(activeQuery);
          if (existingCoords) {
            showExisting(existingCoords);
          } else {
            resolveLocationCoordinatesAsync(activeQuery).then((coords) => {
              if (active && coords) showExisting(coords);
            });
          }
        }

        // Click anywhere: drop a pin and look up the place name
        map.onClick(async ({ lat, lng }) => {
          placePickPin(lat, lng, 'Selected location');
          setIsReverseGeocoding(true);
          const tempName = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          setPendingPickedLocation({ name: tempName, lat, lng });

          const geo = await reverseGeocodeCoordinatesAsync(lat, lng);
          if (active) {
            const finalName = (geo && geo.name) || tempName;
            setPendingPickedLocation({ name: finalName, lat, lng, region: geo?.region });
            placePickPin(lat, lng, finalName);
            setIsReverseGeocoding(false);
          }
        });

        setTimeout(() => { if (active) map.resize(); }, 150);
      })
      .catch((err) => {
        console.error('Failed to load the map picker:', err);
      });

    return () => {
      active = false;
      if (created) created.destroy();
      modalMapRef.current = null;
      modalMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMapModal]);

  // Handle suggestion click inside the picker
  const handleModalSuggestionClick = async (loc) => {
    const map = modalMapRef.current;
    if (!map) return;
    let coords = null;
    if (typeof loc.lat === 'number' && typeof loc.lng === 'number') coords = { lat: loc.lat, lng: loc.lng };
    else if (typeof loc.getCoords === 'function') coords = await loc.getCoords();
    if (!coords) coords = await resolveLocationCoordinatesAsync(loc.name);
    if (!coords || !modalMapRef.current) return;
    map.setView([coords.lat, coords.lng], 13);
    setPendingPickedLocation({ name: loc.name, ...coords });
    placePickPin(coords.lat, coords.lng, loc.name);
    setModalSearch('');
  };

  // Retrieve device GPS location (prompts browser/OS to enable Location Services if needed)
  const handleUseCurrentLocation = () => {
    setGpsError('');
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsError('Location services are not supported by this browser.');
      return;
    }

    setIsLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setIsLocatingGps(false);

        const map = modalMapRef.current;
        if (map) {
          map.setView([lat, lng], 14);
        }

        const tempName = `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        placePickPin(lat, lng, 'Current GPS location');
        setPendingPickedLocation({ name: tempName, lat, lng });
        setIsReverseGeocoding(true);

        try {
          const geo = await reverseGeocodeCoordinatesAsync(lat, lng);
          if (modalMapRef.current) {
            const finalName = (geo && geo.name) || tempName;
            setPendingPickedLocation({ name: finalName, lat, lng, region: geo?.region });
            placePickPin(lat, lng, finalName);
          }
        } catch {
          // Keep coordinates if reverse geocoding fails
        } finally {
          setIsReverseGeocoding(false);
        }
      },
      (err) => {
        setIsLocatingGps(false);
        if (err?.code === 1) {
          setGpsError('Location access was denied. Please turn on Location Services and allow permission in your browser settings.');
        } else if (err?.code === 2) {
          setGpsError('Device location is unavailable. Please turn on GPS / Location Services and try again.');
        } else if (err?.code === 3) {
          setGpsError('Location request timed out. Please move to an open area or pick a pin on the map.');
        } else {
          setGpsError('Could not retrieve your current location. You can search or tap the map instead.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  };

  // Base input style fallback
  const baseInputStyle = className
    ? `w-full min-w-0 max-w-full box-border ${className}`
    : 'w-full min-w-0 max-w-full box-border bg-[#f7f7f8] border border-[#e5e7eb] rounded-[10px] pl-10 pr-24 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12';

  const dynamicPlaceholder = multi
    ? selectedLocations.length > 0
      ? 'Search & add another home range location (e.g. Wellawaya)...'
      : placeholder || 'Search & select home range (e.g. Buttala)...'
    : placeholder;

  return (
    <div ref={containerRef} className="relative w-full min-w-0 max-w-full">
      {/* Hidden input to ensure HTML forms submit full joined value */}
      <input type="hidden" name={name} value={multi ? selectedLocations.join(' / ') : inputValue} />

      {/* Multi-Location Selected Chips (e.g. Buttala / Wellawaya / Lunugamwehera) */}
      {multi && selectedLocations.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#fbfcfb] border border-[#e4eae6] rounded-[10px] mb-2 font-sans">
          {selectedLocations.map((loc, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <span className="text-xs text-[#888888] font-bold px-0.5 select-none">/</span>
              )}
              <span className="inline-flex items-center gap-1.5 bg-white border border-[#d1ded7] text-[#0b2518] px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs">
                <MapPin size={11} className="text-accent shrink-0" />
                <span>{loc}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveLocation(idx)}
                  className="w-4 h-4 rounded-full bg-[#f0f0f0] hover:bg-rose-100 hover:text-rose-600 text-[#777777] inline-flex items-center justify-center border-none cursor-pointer p-0 ml-0.5 transition-colors"
                  title={`Remove ${loc}`}
                >
                  <X size={10} />
                </button>
              </span>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Search Input Box */}
      <div className="relative flex items-center w-full min-w-0 max-w-full">
        {/* Left Map Pin Icon */}
        <div className="absolute left-3.5 text-accent pointer-events-none flex items-center justify-center">
          <MapPin size={16} />
        </div>

        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={dynamicPlaceholder}
          required={required && (!multi || selectedLocations.length === 0)}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`${baseInputStyle} pl-10 pr-24 text-ellipsis`}
        />

        {/* Right Action Buttons */}
        <div className="absolute right-2.5 flex items-center gap-1">
          {/* Loading indicator */}
          {loading && (
            <div className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin mr-1" />
          )}

          {/* Clear Button */}
          {(inputValue || (multi && selectedLocations.length > 0)) && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-[#999999] hover:text-[#333333] hover:bg-black/5 transition-colors cursor-pointer border-none bg-transparent"
              title={multi && !inputValue ? 'Clear all locations' : 'Clear search'}
            >
              <X size={14} />
            </button>
          )}

          {/* Map Preview Button */}
          {showMapButton && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMapModal(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[0.72rem] font-bold text-[#0b2518] bg-[#faf5ec] hover:bg-[#f3ebd9] border border-accent/30 transition-all cursor-pointer shadow-xs"
              title="Open the map to search or click any location"
            >
              <Map size={13} className="text-accent" />
              <span>Map</span>
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] bg-white border border-[#e5e7eb] rounded-[12px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.06)] z-[9999] overflow-hidden max-h-[310px] flex flex-col font-sans">
          {/* Header Bar */}
          <div className="px-3.5 py-2 bg-[#fcfcfd] border-b border-[#f0f0f0] flex items-center gap-1.5 text-[0.72rem] font-bold text-[#666666] uppercase tracking-wider">
            <Search size={11} className="text-accent" />
            <span>Search &amp; Select Location</span>
          </div>

          {/* Suggestions List */}
          <div className="overflow-y-auto divide-y divide-[#f5f5f5]">
            {suggestions.length > 0 ? (
              suggestions.map((item, index) => {
                const isSelected = index === selectedIndex;
                const isAlreadySelected = multi
                  ? selectedLocations.some((loc) => loc.toLowerCase() === (item.title || item.full).toLowerCase())
                  : inputValue && item.title.toLowerCase() === inputValue.trim().toLowerCase();

                return (
                  <div
                    key={index}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`px-3.5 py-2.5 flex items-start gap-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#faf5ec]' : 'hover:bg-[#fafaf8]'
                    }`}
                  >
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-[#f4f4f0] text-accent flex items-center justify-center shrink-0">
                      <MapPin size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[0.88rem] text-[#111111] truncate">
                          {item.title}
                        </span>
                        {item.badge && item.badge.toLowerCase() !== 'custom' && (
                          <span className="text-[0.65rem] font-bold px-1.5 py-0.5 rounded bg-[#0b2518] text-[#c69b55] uppercase tracking-wide shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <div className="text-[0.75rem] text-[#777777] truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                    {isAlreadySelected && (
                      <Check size={14} className="text-accent shrink-0 mt-1" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-5 text-center text-[#888888] text-[0.82rem]">
                <Navigation size={18} className="mx-auto mb-1 text-accent opacity-60" />
                <span>No exact matches found for "{inputValue}".</span>
                <span className="block text-xs text-[#aaaaaa] mt-1">
                  You can keep your typed location or select it on the map.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Interactive Modal (rendered over the whole page) */}
      {showMapModal && createPortal(
        <div
          className="fixed inset-0 z-[11000] bg-black/80 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-5 animate-fade-in overscroll-contain overflow-y-auto"
          onClick={(e) => {
            e.stopPropagation();
            setShowMapModal(false);
          }}
        >
          <div
            ref={mapModalRef}
            tabIndex={-1}
            className="bg-[#181c19] text-[#e8ebe9] rounded-[22px] max-w-4xl w-full p-3.5 sm:p-6 shadow-2xl border border-[#2b352f] flex flex-col gap-3 sm:gap-4 font-sans my-auto max-h-[90dvh] overflow-y-auto focus-visible:outline-none"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Select a location on the map"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#2b352f]">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 mr-2">
                <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-[10px] sm:rounded-[12px] bg-[#0b2518] border border-[#c69b55]/40 text-[#c69b55] flex items-center justify-center shadow-md shrink-0 aspect-square">
                  <MapPin size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-sans text-[0.98rem] sm:text-[1.18rem] font-bold text-white m-0 whitespace-nowrap truncate">Pick a Location</h3>
                  <p className="font-sans text-[0.72rem] sm:text-[0.78rem] text-[#9ba8a0] m-0 mt-0.5 whitespace-nowrap truncate">
                    Search a place or click anywhere on the map to drop a pin.
                  </p>
                </div>
              </div>
              <button
                ref={mapCloseBtnRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMapModal(false);
                }}
                className="w-8 h-8 rounded-full border-none bg-[#242b26] hover:bg-[#2f3832] text-[#9ba8a0] hover:text-white cursor-pointer flex items-center justify-center transition-colors p-0 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search + Current GPS Location Button */}
            <div className="relative z-[1200] flex flex-col gap-2">
              <div className="flex items-stretch gap-2">
                <div className="relative flex-1 min-w-0">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c69b55] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search any place, park, sanctuary, or road…"
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    autoComplete="off"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (modalSuggestions.length > 0) {
                          handleModalSuggestionClick(modalSuggestions[0]);
                        } else if (modalSearch.trim()) {
                          handleModalSuggestionClick({ name: modalSearch.trim() });
                        }
                        setModalSearch('');
                      }
                    }}
                    className="w-full pl-10 pr-9 py-2.5 bg-[#202622] border border-[#2e3831] rounded-[12px] text-sm text-white placeholder:text-[#6f7d75] outline-none focus:border-[#c69b55]/60 transition-colors"
                  />
                  {modalSearch && (
                    <button
                      type="button"
                      onClick={() => setModalSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ba8a0] hover:text-white bg-transparent border-none cursor-pointer p-0"
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocatingGps}
                  title="Use device GPS / current location"
                  className="px-3 sm:px-3.5 py-2 rounded-[12px] bg-[#0b2518] hover:bg-[#133824] border border-[#c69b55]/45 text-white font-sans text-xs sm:text-[0.8rem] font-semibold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-60 transition-colors whitespace-nowrap shadow-xs"
                >
                  {isLocatingGps ? (
                    <Loader2 size={14} className="animate-spin text-[#c69b55]" />
                  ) : (
                    <Navigation size={14} className="text-[#c69b55]" />
                  )}
                  <span className="hidden sm:inline">{isLocatingGps ? 'Locating…' : 'Current Location'}</span>
                  <span className="sm:hidden">{isLocatingGps ? 'GPS…' : 'My GPS'}</span>
                </button>
              </div>

              {gpsError && (
                <div className="flex items-start justify-between gap-2 px-3 py-2 rounded-[10px] bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs leading-snug">
                  <span>{gpsError}</span>
                  <button
                    type="button"
                    onClick={() => setGpsError('')}
                    className="text-amber-300 hover:text-white bg-transparent border-none cursor-pointer p-0 shrink-0"
                    aria-label="Dismiss location notice"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}

              {modalSearch.trim() && (
                <div className="absolute left-0 right-0 top-full mt-1.5 max-h-[240px] overflow-y-auto overscroll-contain bg-[#202622]/95 backdrop-blur-md border border-[#2e3831] rounded-[12px] shadow-2xl divide-y divide-[#2b352f]">
                  <div
                    onClick={() => { handleModalSuggestionClick({ name: modalSearch.trim() }); setModalSearch(''); }}
                    className="px-3.5 py-2.5 text-xs font-semibold text-[#c69b55] hover:bg-[#28312b] cursor-pointer flex items-center gap-2"
                  >
                    <Search size={13} className="shrink-0" />
                    <span>Find <strong>"{modalSearch.trim()}"</strong> on the map</span>
                  </div>
                  {modalSuggestions.map((loc, i) => (
                    <div
                      key={i}
                      onClick={() => { handleModalSuggestionClick(loc); setModalSearch(''); }}
                      className="px-3.5 py-2.5 text-xs hover:bg-[#28312b] cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin size={12} className="text-[#6f7d75] shrink-0" />
                        <span className="font-semibold text-white truncate">{loc.name}</span>
                        {loc.region && <span className="text-[#7f8d85] text-[0.72rem] truncate">• {loc.region}</span>}
                      </div>
                      <span className="text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full bg-[#0b2518] text-[#c69b55] border border-[#c69b55]/30 uppercase tracking-wide shrink-0 ml-2">
                        {loc.type || 'Location'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Map */}
            <div className="relative w-full h-[min(40dvh,420px)] sm:h-[min(48vh,420px)] min-h-[180px] sm:min-h-[260px] bg-[#0e1210] rounded-[16px] overflow-hidden border border-[#2b352f] shrink-0">
              <div ref={modalMapContainerRef} className="w-full h-full z-[1]" />

              {isReverseGeocoding && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-[#181c19]/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg border border-[#2b352f]">
                  <Loader2 size={13} className="animate-spin text-[#c69b55]" />
                  <span>Finding place name…</span>
                </div>
              )}
            </div>

            {/* Selected location */}
            <div className="flex items-center gap-3 bg-[#202722] px-3.5 py-2.5 rounded-[12px] border border-[#2b362f] min-h-[52px]">
              {pendingPickedLocation ? (
                <>
                  <MapPin size={18} className="text-[#c69b55] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-white text-[0.88rem] truncate">{pendingPickedLocation.name}</span>
                    {typeof pendingPickedLocation.lat === 'number' && (
                      <span className="text-[0.72rem] text-[#9caea3] font-mono">
                        {isReverseGeocoding
                          ? 'Detecting place name…'
                          : `${pendingPickedLocation.lat.toFixed(4)}° N, ${pendingPickedLocation.lng.toFixed(4)}° E`}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Info size={16} className="text-[#c69b55] shrink-0" />
                  <span className="text-[0.78rem] text-[#9caea3] truncate">
                    {multi && selectedLocations.length > 0
                      ? `Selected: ${selectedLocations.join(' / ')}`
                      : 'Click anywhere on the map to drop a pin.'}
                  </span>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#2b352f]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMapModal(false);
                }}
                className="flex-1 sm:flex-none sm:min-w-[120px] h-10 px-5 rounded-[10px] bg-[#242b26] hover:bg-[#2f3832] text-[#9ba8a0] hover:text-white font-sans text-xs sm:text-sm font-semibold transition-colors border-none cursor-pointer inline-flex items-center justify-center box-border text-center"
              >
                {pendingPickedLocation && !multi ? 'Cancel' : 'Done'}
              </button>
              <button
                type="button"
                disabled={!pendingPickedLocation || isReverseGeocoding}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!pendingPickedLocation) return;
                  cacheLocationCoordinates(pendingPickedLocation.name, pendingPickedLocation);
                  handleSelectLocation(pendingPickedLocation.name, pendingPickedLocation);
                  if (!multi) {
                    setShowMapModal(false);
                  } else {
                    setPendingPickedLocation(null);
                  }
                }}
                className="flex-1 sm:flex-none sm:min-w-[160px] h-10 px-5 rounded-[10px] bg-[#0b2518] hover:bg-[#133824] text-white font-sans text-xs sm:text-sm font-bold transition-all shadow-md border border-[#c69b55]/40 inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed box-border whitespace-nowrap text-center"
              >
                <Check size={15} className="text-[#c69b55] shrink-0" />
                <span>{multi ? 'Add Location' : 'Use This Location'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
