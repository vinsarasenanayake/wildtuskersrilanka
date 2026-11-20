import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, X, Map, Check, Navigation } from 'lucide-react';
import { SRI_LANKA_WILDLIFE_LOCATIONS } from '../../utils/sriLankaLocations';
import { loadGoogleMaps } from '../../utils/googleMapsLoader';

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
 * Reusable Google Maps search & select input with live Places autocomplete,
 * Sri Lanka protected areas database, multi-location support, and integrated Google Maps preview modal.
 */
export default function LocationSearchInput({
  name = 'location',
  value = '',
  onChange,
  onSelectPlace,
  placeholder = 'Search & select location (e.g. Yala, Kumana, Wilpattu)...',
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
  const [isGoogleActive, setIsGoogleActive] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalSuggestions, setModalSuggestions] = useState([]);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const modalDebounceRef = useRef(null);

  // Live in-modal search effect supporting all Sri Lankan locations & live geocoder
  useEffect(() => {
    const q = modalSearch.trim().toLowerCase();
    if (!q) {
      setModalSuggestions([]);
      return;
    }

    const localMatches = SRI_LANKA_WILDLIFE_LOCATIONS.filter(
      (loc) => loc.name.toLowerCase().includes(q) || loc.region.toLowerCase().includes(q)
    ).slice(0, 10);

    setModalSuggestions(localMatches);

    if (q.length >= 2 && typeof fetch !== 'undefined') {
      if (modalDebounceRef.current) clearTimeout(modalDebounceRef.current);
      modalDebounceRef.current = setTimeout(() => {
        fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=lk&format=json&limit=6`, {
          headers: { 'Accept-Language': 'en' },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data && data.length > 0) {
              const geoMatches = data.map((item) => {
                const parts = (item.display_name || '').split(',');
                const title = parts[0]?.trim() || item.name;
                const subtitle = parts.slice(1, 3).join(',').trim();
                return {
                  name: title,
                  type: 'Location',
                  region: subtitle || 'Sri Lanka',
                };
              });
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
      }, 200);
    }
  }, [modalSearch]);

  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
  const hasValidKey = Boolean(apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY');

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

  // Initialize Google Maps Places API if key is provided
  useEffect(() => {
    if (!hasValidKey) {
      setIsGoogleActive(false);
      return;
    }

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (maps?.places?.AutocompleteService) {
          autocompleteServiceRef.current = new maps.places.AutocompleteService();
          setIsGoogleActive(true);
        }
      })
      .catch((err) => {
        console.info('Google Maps Places API not active, using Sri Lanka Wildlife geocoder fallback:', err.message);
        setIsGoogleActive(false);
      });
  }, [apiKey, hasValidKey]);

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

  // Search logic combining Google Places + Curated Sri Lanka Wildlife Locations
  const performSearch = useCallback(
    (query) => {
      const q = query.trim().toLowerCase();
      if (!q || q.length < 1) {
        // Default: show top national parks when user focuses empty input
        const defaultParks = SRI_LANKA_WILDLIFE_LOCATIONS.slice(0, 7).map((p) => ({
          title: p.name,
          subtitle: `${p.type} • ${p.region}`,
          full: `${p.name}, Sri Lanka`,
          source: 'wts_database',
          badge: p.type,
        }));
        setSuggestions(defaultParks);
        return;
      }

      setLoading(true);

      // 1. If Google Places is connected, query Google Autocomplete Service
      if (isGoogleActive && autocompleteServiceRef.current && window.google?.maps?.places) {
        try {
          autocompleteServiceRef.current.getPlacePredictions(
            {
              input: query,
              componentRestrictions: { country: 'lk' }, // Bias & restrict to Sri Lanka
            },
            (predictions, status) => {
              setLoading(false);
              if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
                const googleResults = predictions.map((p) => ({
                  title: p.structured_formatting?.main_text || p.description,
                  subtitle: p.structured_formatting?.secondary_text || 'Sri Lanka',
                  full: p.description,
                  source: 'google',
                  placeId: p.place_id,
                }));

                // Merge with local matches for best Sri Lanka wildlife parks context
                const localMatches = SRI_LANKA_WILDLIFE_LOCATIONS.filter(
                  (loc) => loc.name.toLowerCase().includes(q) || loc.region.toLowerCase().includes(q)
                )
                  .slice(0, 3)
                  .map((p) => ({
                    title: p.name,
                    subtitle: `${p.type} • ${p.region}`,
                    full: `${p.name}, Sri Lanka`,
                    source: 'wts_database',
                    badge: p.type,
                  }));

                const merged = [...googleResults];
                localMatches.forEach((loc) => {
                  if (!merged.some((m) => m.title.toLowerCase() === loc.title.toLowerCase())) {
                    merged.unshift(loc);
                  }
                });

                setSuggestions(merged.slice(0, 8));
              } else {
                fallbackLocalSearch(q);
              }
            }
          );
          return;
        } catch (err) {
          console.warn('Google Places prediction error:', err);
        }
      }

      // 2. Fallback search (Local Database + Sri Lanka geocoding)
      fallbackLocalSearch(q);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isGoogleActive]
  );

  const fallbackLocalSearch = (q) => {
    const localMatches = SRI_LANKA_WILDLIFE_LOCATIONS.filter(
      (loc) => loc.name.toLowerCase().includes(q) || loc.region.toLowerCase().includes(q)
    ).map((p) => ({
      title: p.name,
      subtitle: `${p.type} • ${p.region}`,
      full: `${p.name}, Sri Lanka`,
      source: 'wts_database',
      badge: p.type,
    }));

    if (q.length >= 3 && typeof fetch !== 'undefined') {
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=lk&format=json&limit=5`, {
        headers: { 'Accept-Language': 'en' },
      })
        .then((res) => res.json())
        .then((data) => {
          setLoading(false);
          const geocoderMatches = (data || []).map((item) => {
            const parts = (item.display_name || '').split(',');
            const title = parts[0]?.trim() || item.name;
            const subtitle = parts.slice(1, 4).join(',').trim();
            return {
              title,
              subtitle: subtitle || 'Sri Lanka',
              full: item.display_name,
              source: 'osm',
            };
          });

          const combined = [...localMatches];
          geocoderMatches.forEach((gm) => {
            if (!combined.some((c) => c.title.toLowerCase() === gm.title.toLowerCase())) {
              combined.push(gm);
            }
          });
          const hasExact = combined.some((c) => c.title.toLowerCase() === q);
          if (!hasExact && q.length > 0) {
            combined.unshift({
              title: q.charAt(0).toUpperCase() + q.slice(1),
              subtitle: 'Select as location',
              full: `${q}, Sri Lanka`,
              badge: 'Custom',
            });
          }
          setSuggestions(combined.slice(0, 8));
        })
        .catch(() => {
          setLoading(false);
          const combined = [...localMatches];
          if (!combined.some((c) => c.title.toLowerCase() === q) && q.length > 0) {
            combined.unshift({
              title: q.charAt(0).toUpperCase() + q.slice(1),
              subtitle: 'Select as location',
              full: `${q}, Sri Lanka`,
              badge: 'Custom',
            });
          }
          setSuggestions(combined.slice(0, 8));
        });
    } else {
      setLoading(false);
      const combined = [...localMatches];
      if (!combined.some((c) => c.title.toLowerCase() === q) && q.length > 0) {
        combined.unshift({
          title: q.charAt(0).toUpperCase() + q.slice(1),
          subtitle: 'Select as location',
          full: `${q}, Sri Lanka`,
          badge: 'Custom',
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

  const handleSelect = (item) => {
    const placeName = item.title || item.full;
    handleSelectLocation(placeName, item);
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

  // Base input style fallback
  const baseInputStyle =
    className ||
    'w-full bg-[#f7f7f8] border border-[#e5e7eb] rounded-[10px] pl-10 pr-24 py-3 font-sans text-[0.92rem] text-[#111111] outline-none transition-all placeholder:text-[#bbbbbb] focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/12';

  const activeMapQuery =
    modalSearch.trim() ||
    inputValue.trim() ||
    (multi && selectedLocations.length > 0 ? selectedLocations[selectedLocations.length - 1] : '');

  const embedMapUrl = activeMapQuery
    ? `https://maps.google.com/maps?q=${encodeURIComponent(`${activeMapQuery}, Sri Lanka`)}&t=&z=11&ie=UTF8&iwloc=&output=embed`
    : 'https://maps.google.com/maps?q=Sri+Lanka+National+Parks&t=&z=8&ie=UTF8&iwloc=&output=embed';

  const dynamicPlaceholder = multi
    ? selectedLocations.length > 0
      ? 'Search & add another roaming location (e.g. Wellawaya)...'
      : placeholder || 'Search & select roaming area (e.g. Buttala)...'
    : placeholder;

  return (
    <div ref={containerRef} className="relative w-full">
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
      <div className="relative flex items-center">
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
          className={`${baseInputStyle} pl-10 pr-24`}
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
              onClick={() => setShowMapModal(true)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[0.72rem] font-bold text-[#0b2518] bg-[#faf5ec] hover:bg-[#f3ebd9] border border-accent/25 transition-all cursor-pointer shadow-xs"
              title="Preview Map"
            >
              <Map size={12} className="text-accent" />
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
            <span>Search &amp; Select</span>
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
                        {item.badge && (
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
                  You can keep your typed location or select from the map.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Interactive Modal */}
      {showMapModal && (
        <div
          className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowMapModal(false)}
        >
          <div
            className="bg-white rounded-[16px] max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col font-sans border border-[#e5e7eb] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#0b2518] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="font-sans text-[1rem] font-bold text-white m-0">
                    Search &amp; Select Location
                  </h3>
                  <p className="text-xs text-white/70 m-0 mt-0.5">
                    {multi
                      ? selectedLocations.length > 0
                        ? `Selected (${selectedLocations.length}): ${selectedLocations.join(' / ')}`
                        : 'Select or search roaming locations in Sri Lanka'
                      : inputValue
                      ? `Selected: ${inputValue}`
                      : 'Select or search a location in Sri Lanka'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-none cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* In-Modal Search Bar */}
            <div className="p-3 bg-[#f8f9fa] border-b border-[#e5e7eb] flex flex-col gap-2">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-accent pointer-events-none" />
                <input
                  type="text"
                  placeholder="Type to search and select (e.g. Colombo, Kandy, Yala)..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (modalSuggestions.length > 0) {
                        handleSelectLocation(modalSuggestions[0].name);
                        setModalSearch('');
                      } else if (modalSearch.trim()) {
                        handleSelectLocation(modalSearch.trim());
                        setModalSearch('');
                      }
                    }
                  }}
                  className="w-full pl-9 pr-8 py-2 bg-white border border-[#d1d5db] rounded-lg text-sm text-[#111111] outline-none focus:border-accent"
                />
                {modalSearch && (
                  <button
                    type="button"
                    onClick={() => setModalSearch('')}
                    className="absolute right-2.5 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Modal Search Live Results */}
              {modalSearch.trim() && (
                <div className="max-h-[170px] overflow-y-auto bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 shadow-sm mt-1 font-sans">
                  <div
                    onClick={() => {
                      handleSelectLocation(modalSearch.trim());
                      setModalSearch('');
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-accent hover:bg-[#faf5ec] cursor-pointer flex items-center gap-2 bg-[#fcfcf9]"
                  >
                    <MapPin size={13} className="text-accent shrink-0" />
                    <span>Select <strong>"{modalSearch.trim()}"</strong> as location</span>
                  </div>

                  {modalSuggestions.map((loc, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        handleSelectLocation(loc.name);
                        setModalSearch('');
                      }}
                      className="px-3.5 py-2 text-xs text-gray-800 hover:bg-[#faf5ec] cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin size={12} className="text-gray-400 shrink-0" />
                        <span className="font-semibold text-gray-900 truncate">{loc.name}</span>
                        {loc.region && <span className="text-gray-400 text-[0.72rem] truncate">• {loc.region}</span>}
                      </div>
                      <span className="text-[0.65rem] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 uppercase tracking-wide shrink-0 ml-2">
                        {loc.type || 'Location'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Interactive Map Iframe */}
            <div className="relative w-full aspect-[16/10] bg-[#e5e5e5]">
              <iframe
                title="Location Map View"
                src={embedMapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Modal Footer / Actions */}
            <div className="p-3.5 bg-[#fafaf8] flex items-center justify-between gap-3 border-t border-[#eeeeee]">
              <div className="flex items-center gap-2 text-xs text-[#555555]">
                <MapPin size={14} className="text-accent shrink-0" />
                <span className="font-semibold text-[#111111] truncate max-w-[340px]">
                  {multi
                    ? selectedLocations.length > 0
                      ? selectedLocations.join(' / ')
                      : 'No locations selected'
                    : inputValue || 'No location selected'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="px-5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-primary font-bold text-xs transition-colors cursor-pointer border-none shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
