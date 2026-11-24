/**
 * @file DistrictMap.jsx
 * @description Sri Lanka 25 Administrative Districts Geospatial Interactive Map.
 * Renders all 25 districts with regional tusker distribution, searchable district dropdown,
 * searchable tusker search, and categorized wild tusker directories.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Search, Layers, X, MapPin, ChevronDown, Compass, ExternalLink
} from 'lucide-react';
import { getTuskers, LIVING_STATUSES, DISTRICTS } from '../../models/TuskerModel';
import { createMap } from '../../utils/mapEngine';
import { cleanAreaName } from '../../utils/areaShapes';
import { tuskerIsInDistrict } from '../../controllers/useTusker';
import SRI_LANKA_DISTRICTS_DATA from '../../data/sriLankaDistrictsData.json';

const SRI_LANKA_CENTER = [7.8731, 80.7718];
const STATUS_COLORS = { Alive: '#16a34a', 'No Recent Record': '#d97706', Deceased: '#6b7280' };

function tuskerAreaInfo(t) {
  const isDeceased = t.livingStatus === 'Deceased';
  const area = cleanAreaName(t.lastSeenArea);
  if (area) {
    return {
      name: area,
      label: isDeceased ? 'Final spotted location' : 'Last seen area',
      date: isDeceased ? (t.deathYear ? String(t.deathYear) : t.lastSeen) : t.lastSeen,
    };
  }
  if (t.location && typeof t.location === 'string') {
    return {
      name: (t.location.split('/')[0] || '').trim(),
      label: 'Roaming corridor',
      date: t.listedDate,
    };
  }
  return null;
}

export default function DistrictMap() {
  const [tuskers, setTuskers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [districtQuery, setDistrictQuery] = useState('');
  const [showDistrictDrop, setShowDistrictDrop] = useState(false);

  const [tuskerQuery, setTuskerQuery] = useState('');
  const [showTuskerDrop, setShowTuskerDrop] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [mobileTab, setMobileTab] = useState('map'); // 'map' | 'directory'

  const hostRef = useRef(null);
  const mapRef = useRef(null);
  const districtRef = useRef(null);
  const tuskerSearchRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | District Map';
    getTuskers()
      .then(setTuskers)
      .catch((err) => setLoadError(err.message || 'Could not load tuskers'))
      .finally(() => setLoading(false));
  }, []);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleOutside = (e) => {
      if (districtRef.current && !districtRef.current.contains(e.target)) {
        setShowDistrictDrop(false);
      }
      if (tuskerSearchRef.current && !tuskerSearchRef.current.contains(e.target)) {
        setShowTuskerDrop(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Count per district
  const districtCounts = useMemo(() => {
    const counts = new Map();
    DISTRICTS.forEach((d) => {
      let count = 0;
      for (const t of tuskers) {
        if (tuskerIsInDistrict(t, d)) count++;
      }
      counts.set(d, count);
    });
    return counts;
  }, [tuskers]);

  // District suggestions for searchable dropdown
  const districtSuggestions = useMemo(() => {
    const q = districtQuery.trim().toLowerCase();
    if (!q) return DISTRICTS;
    return DISTRICTS.filter((d) => d.toLowerCase().includes(q));
  }, [districtQuery]);

  // Filter tuskers for sidebar list
  const filteredTuskers = useMemo(() => {
    const q = tuskerQuery.trim().toLowerCase();
    return tuskers.filter((t) => {
      if (selectedDistrict && !tuskerIsInDistrict(t, selectedDistrict)) {
        return false;
      }
      if (statusFilter && (t.livingStatus || 'Alive') !== statusFilter) {
        return false;
      }
      if (q) {
        const hay = `${t.id} ${t.name || ''} ${t.sinhala || ''} ${t.lastSeenArea || ''} ${t.location || ''} ${t.district || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));
  }, [tuskers, selectedDistrict, statusFilter, tuskerQuery]);

  // Instant search suggestions for tuskers dropdown
  const tuskerSuggestions = useMemo(() => {
    const q = tuskerQuery.trim().toLowerCase();
    if (!q) return [];
    return tuskers
      .filter((t) => t.name?.toLowerCase().includes(q) || t.id?.toLowerCase().includes(q))
      .slice(0, 6);
  }, [tuskerQuery, tuskers]);

  // Initialize Map with Hybrid basemap (consistent with Zone Map)
  useEffect(() => {
    let active = true;
    let created = null;

    createMap(hostRef.current, {
      center: SRI_LANKA_CENTER,
      zoom: 8,
      gestureHandling: 'greedy',
      mapTypeId: 'hybrid',
    })
      .then((map) => {
        if (!active) { map.destroy(); return; }
        created = map;
        mapRef.current = map;
        setMapReady(true);
      })
      .catch((err) => console.error('District map failed to load:', err));

    return () => {
      active = false;
      if (created) created.destroy();
      mapRef.current = null;
    };
  }, []);

  const handleSelectDistrict = useCallback((distName) => {
    if (!distName || selectedDistrict === distName) {
      setSelectedDistrict(null);
      setDistrictQuery('');
      if (mapRef.current) {
        mapRef.current.fitBounds([[5.92, 79.6], [9.85, 81.9]], { padding: 30, maxZoom: 9 });
      }
    } else {
      setSelectedDistrict(distName);
      setDistrictQuery(distName);
      setShowDistrictDrop(false);
      setMobileTab('map');

      const distObj = SRI_LANKA_DISTRICTS_DATA[distName];
      if (distObj && distObj.bbox && mapRef.current) {
        mapRef.current.fitBounds(distObj.bbox, { padding: 45 });
      }
    }
  }, [selectedDistrict]);

  // Draw 25 Administrative Districts on Map as Boundary Polygons (Glassy styling like Zone Map)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    map.clearMarkers();
    map.clearAreas();

    // When a district is selected, isolate it and hide the other 24 districts
    const districtKeys = selectedDistrict
      ? [selectedDistrict]
      : Object.keys(SRI_LANKA_DISTRICTS_DATA);

    districtKeys.forEach((distName) => {
      const distObj = SRI_LANKA_DISTRICTS_DATA[distName];
      if (!distObj) return;
      const isSelected = selectedDistrict === distName;

      try {
        map.addArea(
          {
            kind: 'polygon',
            geojson: {
              type: distObj.type || 'Polygon',
              coordinates: distObj.coordinates,
            },
          },
          {
            fill: distObj.color,
            fillOpacity: isSelected ? 0.36 : 0.22,
            stroke: distObj.strokeColor,
            strokeWeight: isSelected ? 3.2 : 1.6,
            onClick: () => handleSelectDistrict(distName),
          }
        );
      } catch (err) {
        console.warn('[map] could not add district boundary polygon:', distName, err);
      }
    });

    if (selectedDistrict) {
      const distObj = SRI_LANKA_DISTRICTS_DATA[selectedDistrict];
      if (distObj && distObj.bbox) {
        try {
          map.fitBounds(distObj.bbox, { padding: 45 });
        } catch {}
      }
    } else {
      try {
        map.fitBounds([[5.92, 79.6], [9.85, 81.9]], { padding: 30, maxZoom: 9 });
      } catch {}
    }
  }, [mapReady, selectedDistrict, handleSelectDistrict]);

  const handleReset = () => {
    setSelectedDistrict(null);
    setDistrictQuery('');
    setTuskerQuery('');
    setStatusFilter('');
    if (mapRef.current) {
      mapRef.current.fitBounds([[5.92, 79.6], [9.85, 81.9]], { padding: 30, maxZoom: 9 });
    }
  };

  return (
    <div className="pt-[64px] sm:pt-[70px] h-screen flex flex-col bg-[#0b2518] font-sans">
      {/* Mobile & Tablet Portrait View Switcher */}
      <div className="portrait:flex landscape:hidden flex items-center justify-center p-2 bg-[#081b11] border-b border-white/10 shrink-0">
        <div className="flex rounded-lg bg-[#0f2d1e] p-1 border border-white/10 w-full max-w-sm text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none ${
              mobileTab === 'map'
                ? 'bg-accent text-primary font-bold shadow-xs'
                : 'bg-transparent text-gray-300 hover:text-white'
            }`}
          >
            <MapPin size={14} /> Map View
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('directory')}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none ${
              mobileTab === 'directory'
                ? 'bg-accent text-primary font-bold shadow-xs'
                : 'bg-transparent text-gray-300 hover:text-white'
            }`}
          >
            <Layers size={14} /> Districts & Tuskers ({filteredTuskers.length})
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row">
        {/* ── Side panel ── */}
        <aside className={`w-full md:w-[380px] lg:w-[410px] shrink-0 bg-white border-r border-[#e2e8e4] flex flex-col min-h-0 overflow-y-auto overscroll-contain ${
          mobileTab === 'directory' ? 'portrait:flex portrait:flex-1' : 'portrait:hidden'
        } landscape:flex`}>
          <div className="p-3.5 sm:p-4 border-b border-[#edf2ef]">
            {/* Top Navigation Row */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6a7c73] hover:text-accent no-underline">
                <ArrowLeft size={14} /> Admin Portal
              </Link>
              <Link
                to="/admin/zone-map"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:text-accent-hover bg-[#faf5ec] hover:bg-[#f3ebd9] px-2 py-1 rounded-md border border-accent/40 no-underline cursor-pointer transition-all"
              >
                <Compass size={12} />
                <span>Switch to Zone Map →</span>
              </Link>
            </div>

            {/* Header Title */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <h1 className="text-lg font-bold text-[#0b2518] m-0 flex items-center gap-2">
                <Compass size={18} className="text-accent" />
                <span>District Map</span>
              </h1>
              {(selectedDistrict || tuskerQuery || statusFilter) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            <p className="text-xs text-[#6a7c73] m-0 mt-0.5">
              {loading
                ? 'Loading tuskers…'
                : `25 Administrative Districts · ${tuskers.length} Registered Tuskers`}
            </p>

            {/* Searchable District Dropdown */}
            <div className="mt-3 mb-2.5" ref={districtRef}>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Select Administrative District (25)
              </label>
              <div className="relative">
                <div className="flex items-center gap-2 bg-[#f4f7f5] border border-[#dce3df] rounded-lg px-3 py-2 transition-all focus-within:border-accent focus-within:bg-white">
                  <Compass size={14} className="text-accent shrink-0" />
                  <input
                    type="text"
                    className="border-none bg-transparent outline-none font-sans text-xs text-[#111111] w-full placeholder:text-[#9aa8a0]"
                    placeholder={selectedDistrict ? `District: ${selectedDistrict}` : 'Filter by district name…'}
                    value={districtQuery}
                    onChange={(e) => {
                      setDistrictQuery(e.target.value);
                      setShowDistrictDrop(true);
                    }}
                    onFocus={() => setShowDistrictDrop(true)}
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    {selectedDistrict && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDistrict(null);
                          setDistrictQuery('');
                        }}
                        className="bg-transparent border-none text-gray-400 hover:text-gray-600 p-0 cursor-pointer"
                        title="Clear district selection"
                      >
                        <X size={12} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowDistrictDrop(prev => !prev)}
                      className="bg-transparent border-none text-gray-400 hover:text-gray-600 p-0 cursor-pointer"
                    >
                      <ChevronDown size={14} className={`transition-transform ${showDistrictDrop ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {showDistrictDrop && districtSuggestions.length > 0 && (
                  <ul className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-[#e5e7eb] rounded-lg shadow-lg z-50 list-none m-0 p-1 max-h-[220px] overflow-y-auto">
                    <li
                      onClick={() => handleSelectDistrict(null)}
                      className={`px-3 py-2 text-xs font-semibold rounded-md cursor-pointer flex items-center justify-between ${
                        !selectedDistrict ? 'bg-[#faf5ec] text-accent' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>All 25 Districts</span>
                      <span className="text-[10px] text-gray-400">{tuskers.length} tuskers</span>
                    </li>
                    {districtSuggestions.map((dist) => {
                      const count = districtCounts.get(dist) || 0;
                      const isSel = selectedDistrict === dist;
                      return (
                        <li
                          key={dist}
                          onClick={() => handleSelectDistrict(dist)}
                          className={`px-3 py-2 text-xs rounded-md cursor-pointer flex items-center justify-between transition-colors ${
                            isSel ? 'bg-[#faf5ec] text-accent font-bold' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{dist}</span>
                          <span className="text-[10px] font-semibold text-gray-400">
                            {count} {count === 1 ? 'tusker' : 'tuskers'}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* Tusker Search Input & Dropdown */}
            <div className="relative mt-2" ref={tuskerSearchRef}>
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa8a0]" />
              <input
                type="text"
                value={tuskerQuery}
                onChange={(e) => {
                  setTuskerQuery(e.target.value);
                  setShowTuskerDrop(true);
                }}
                onFocus={() => tuskerQuery && setShowTuskerDrop(true)}
                placeholder={selectedDistrict ? `Search tuskers in ${selectedDistrict}…` : 'Search registered tuskers…'}
                className="w-full pl-8 pr-8 py-2 text-xs bg-[#f4f7f5] border border-[#dce3df] rounded-lg text-[#0b2518] placeholder:text-[#9aa8a0] focus:outline-none focus:border-accent focus:bg-white"
              />
              {tuskerQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setTuskerQuery('');
                    setShowTuskerDrop(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9aa8a0] hover:text-[#0b2518] bg-transparent border-none p-0 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}

              {showTuskerDrop && tuskerSuggestions.length > 0 && (
                <ul className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-[#e5e7eb] rounded-lg shadow-lg z-50 list-none m-0 p-1 overflow-hidden">
                  {tuskerSuggestions.map((t) => (
                    <li
                      key={t.id}
                      onClick={() => {
                        setTuskerQuery(t.name);
                        setShowTuskerDrop(false);
                      }}
                      className="px-3 py-2 text-xs text-gray-800 hover:bg-[#faf5ec] cursor-pointer rounded-md flex items-center gap-2"
                    >
                      <span className="font-bold text-accent min-w-[38px]">{t.id}</span>
                      <span className="font-semibold flex-1 truncate">{t.name}</span>
                      <span className="text-[10px] text-gray-400 truncate">{t.location || t.district}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-0.5 scrollbar-thin">
              <button
                type="button"
                onClick={() => setStatusFilter('')}
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold border cursor-pointer transition-all ${
                  statusFilter === ''
                    ? 'bg-[#0b2518] text-white border-[#0b2518]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                All Statuses
              </button>
              {LIVING_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
                  className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold border cursor-pointer transition-all whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-[#0b2518] text-white border-[#0b2518]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* ── Scrollable Tusker List ── */}
          <div className="divide-y divide-[#f0f3f1] flex-1 overflow-y-auto">
            <div className="px-3.5 py-2 bg-[#f8faf9] text-[10.5px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
              <span>
                {selectedDistrict ? `${selectedDistrict} Tuskers` : 'All Registered Tuskers'}
              </span>
              <span className="font-mono text-gray-600">{filteredTuskers.length}</span>
            </div>

            {loadError && (
              <div className="p-4 text-xs text-red-600 bg-red-50">{loadError}</div>
            )}

            {filteredTuskers.length === 0 && !loading && (
              <div className="p-6 text-center text-xs text-gray-500">
                No tuskers match the current filters.
              </div>
            )}

            {filteredTuskers.map((t) => {
              const area = tuskerAreaInfo(t);
              const dotColor = STATUS_COLORS[t.livingStatus] || '#6b7280';

              return (
                <div
                  key={t.id}
                  className="p-3 transition-colors flex items-start gap-2.5 hover:bg-[#fafbfa]"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: dotColor }}
                    title={`Status: ${t.livingStatus || 'Alive'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-accent">{t.id}</span>
                      <span className="font-bold text-xs text-gray-900 truncate">{t.name}</span>
                      {t.sinhala && (
                        <span className="text-[11px] text-gray-500 truncate">({t.sinhala})</span>
                      )}
                    </div>
                    {area && (
                      <p className="text-[11px] text-gray-500 m-0 mt-0.5 truncate">
                        {area.label}: <strong className="text-gray-700">{area.name}</strong>
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/tuskers/${t.id.toLowerCase()}`}
                    state={{ from: '/admin/district-map' }}
                    className="p-1 text-gray-400 hover:text-accent rounded transition-colors"
                    title="View Tusker Profile"
                  >
                    <ExternalLink size={13} />
                  </Link>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── Main Map Canvas ── */}
        <main className={`flex-1 relative h-full bg-[#0e1210] ${
          mobileTab === 'directory' ? 'portrait:hidden' : 'portrait:flex'
        } landscape:flex`}>
          <div ref={hostRef} className="w-full h-full" />

          {/* Floating Selected District Overlay Card on Map */}
          {selectedDistrict && SRI_LANKA_DISTRICTS_DATA[selectedDistrict] && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-[5] w-[calc(100%-1.5rem)] sm:w-[320px] max-w-[320px] bg-[#0d1612]/95 backdrop-blur-md rounded-xl shadow-2xl border border-accent/40 text-white p-3.5 sm:p-4 animate-in fade-in">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: SRI_LANKA_DISTRICTS_DATA[selectedDistrict].color }}
                  />
                  <div className="text-sm font-bold text-white truncate">
                    {selectedDistrict} District
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-transparent border-none cursor-pointer text-[#9ca3af] hover:text-white p-0.5"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="text-xs text-gray-300 leading-relaxed mb-3">
                <strong className="text-white">Province:</strong> {SRI_LANKA_DISTRICTS_DATA[selectedDistrict].province} Province
              </div>

              <div className="flex items-center justify-between text-xs pt-2.5 border-t border-white/10">
                <span className="text-emerald-400 font-bold">
                  {districtCounts.get(selectedDistrict) || 0} Registered Tuskers
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-accent hover:text-accent-hover bg-accent/15 hover:bg-accent/25 px-2.5 py-1 rounded-md border border-accent/40 cursor-pointer transition-all"
                  title="Restore full Sri Lanka view and show all 25 districts"
                >
                  <ArrowLeft size={11} />
                  <span>View Full Map</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
