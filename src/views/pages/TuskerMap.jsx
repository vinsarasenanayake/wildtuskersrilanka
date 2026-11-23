/**
 * @file TuskerMap.jsx
 * @description WTS Conservation Landscapes & Strategic Regional Zones Interactive Map (Zone Map).
 * Renders the 4 official WTS Conservation Zones (Zone 1, Zone 2, Zone 3, Zone 4) on an interactive
 * canvas with zone details, covered districts, and categorized wild tusker directories.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Search, Layers, X, MapPin, Compass
} from 'lucide-react';
import { getTuskers, LIVING_STATUSES } from '../../models/TuskerModel';
import { createMap } from '../../utils/mapEngine';
import { cleanAreaName } from '../../utils/areaShapes';
import WTS_CONSERVATION_ZONES from '../../data/wtsConservationZones.json';

/* WTS Conservation Landscapes & Zones Map:
   - Visualizes all 4 WTS Conservation Landscapes (Zone 1, Zone 2, Zone 3, Zone 4)
   - Clean map display focused solely on the 4 strategic regional boundaries
   - Interactive zone selection with district breakdowns and registered tuskers list */

const SRI_LANKA_CENTER = [7.8731, 80.7718];
const STATUS_COLORS = { Alive: '#16a34a', 'No Recent Record': '#d97706', Deceased: '#6b7280' };
const statusColor = (s) => STATUS_COLORS[s] || '#0b2518';

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
  if (t.location) {
    return {
      name: t.location.split('/')[0].trim(),
      label: 'Roaming corridor',
      date: t.listedDate,
    };
  }
  return null;
}

export default function TuskerMap() {
  const [tuskers, setTuskers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [selectedZone, setSelectedZone] = useState(null); // 'Zone 1' | 'Zone 2' | 'Zone 3' | 'Zone 4' | null
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [mobileTab, setMobileTab] = useState('map'); // 'map' | 'directory'

  const hostRef = useRef(null);
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (mobileTab === 'map' && mapRef.current) {
      setTimeout(() => {
        try {
          mapRef.current?.resize();
        } catch {
          // ignore
        }
      }, 100);
    }
  }, [mobileTab]);

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | WTS Conservation Zones';
    getTuskers()
      .then(setTuskers)
      .catch((err) => setLoadError(err.message || 'Could not load tuskers'))
      .finally(() => setLoading(false));
  }, []);

  const zoneStats = useMemo(() => {
    const counts = { 'Zone 1': 0, 'Zone 2': 0, 'Zone 3': 0, 'Zone 4': 0 };
    tuskers.forEach((t) => {
      const raw = t.zone ? String(t.zone).trim() : '';
      const m = raw.match(/Zone\s*([1-4])/i);
      const k = m ? `Zone ${m[1]}` : raw;
      if (counts[k] !== undefined) counts[k]++;
    });
    return counts;
  }, [tuskers]);

  // Filter tuskers for sidebar list
  const filteredTuskers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tuskers.filter((t) => {
      // Zone match
      if (selectedZone) {
        const raw = t.zone ? String(t.zone).trim() : '';
        const m = raw.match(/Zone\s*([1-4])/i);
        const k = m ? `Zone ${m[1]}` : raw;
        if (k !== selectedZone) return false;
      }
      // Status match
      if (statusFilter && (t.livingStatus || 'Alive') !== statusFilter) {
        return false;
      }
      // Query match
      if (q) {
        const hay = `${t.id} ${t.name || ''} ${t.sinhala || ''} ${t.lastSeenArea || ''} ${t.location || ''} ${t.district || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));
  }, [tuskers, selectedZone, statusFilter, query]);

  // Initialize Map
  useEffect(() => {
    let active = true;
    let created = null;
    createMap(hostRef.current, { center: SRI_LANKA_CENTER, zoom: 8, gestureHandling: 'greedy', mapTypeId: 'hybrid' })
      .then((map) => {
        if (!active) { map.destroy(); return; }
        created = map;
        mapRef.current = map;
        setMapReady(true);
      })
      .catch((err) => console.error('Tusker map failed to load:', err));
    return () => {
      active = false;
      if (created) created.destroy();
      mapRef.current = null;
    };
  }, []);

  // Draw ONLY the 4 Conservation Zones on the map (no last seen pins, no overlap pins)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    map.clearAreas();
    map.clearMarkers();

    // When a zone is selected, zoom in and hide the other 3 zones until "View Full Map" is clicked
    const zonesToDraw = selectedZone
      ? Object.values(WTS_CONSERVATION_ZONES).filter((z) => z.shortName === selectedZone)
      : Object.values(WTS_CONSERVATION_ZONES);

    zonesToDraw.forEach((zoneObj) => {
      const isZoneActive = selectedZone === zoneObj.shortName;
      try {
        map.addArea(
          {
            kind: 'polygon',
            geojson: {
              type: zoneObj.type || 'MultiPolygon',
              coordinates: zoneObj.coordinates,
            },
          },
          {
            fill: zoneObj.color,
            fillOpacity: isZoneActive ? 0.32 : 0.18,
            stroke: zoneObj.strokeColor,
            strokeWeight: isZoneActive ? 3.5 : 2.0,
            onClick: () => {
              setSelectedZone((prev) => (prev === zoneObj.shortName ? null : zoneObj.shortName));
              if (zoneObj.bbox) {
                map.fitBounds(zoneObj.bbox, { padding: 45 });
              }
            },
          }
        );
      } catch (err) {
        console.warn('[map] could not add conservation zone:', zoneObj.shortName, err);
      }
    });

    // If no zone selected, fit full Sri Lanka bounds
    if (!selectedZone) {
      try {
        map.fitBounds([[5.95, 79.6], [9.85, 81.9]], { padding: 30, maxZoom: 9 });
      } catch (err) {
        console.error('[map] initial fit failed', err);
      }
    }
  }, [mapReady, selectedZone]);

  const handleSelectZone = (zoneKey) => {
    if (selectedZone === zoneKey) {
      setSelectedZone(null);
      if (mapRef.current) {
        mapRef.current.fitBounds([[5.95, 79.6], [9.85, 81.9]], { padding: 30, maxZoom: 9 });
      }
    } else {
      setSelectedZone(zoneKey);
      setMobileTab('map');
      const zObj = WTS_CONSERVATION_ZONES[zoneKey];
      if (zObj && zObj.bbox && mapRef.current) {
        mapRef.current.fitBounds(zObj.bbox, { padding: 45 });
      }
    }
  };

  const handleResetView = () => {
    setSelectedZone(null);
    setQuery('');
    setStatusFilter('');
    if (mapRef.current) {
      mapRef.current.fitBounds([[5.95, 79.6], [9.85, 81.9]], { padding: 30, maxZoom: 9 });
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
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none ${mobileTab === 'map'
              ? 'bg-accent text-primary font-bold shadow-xs'
              : 'bg-transparent text-gray-300 hover:text-white'
              }`}
          >
            <MapPin size={14} /> Map View
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('directory')}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none ${mobileTab === 'directory'
              ? 'bg-accent text-primary font-bold shadow-xs'
              : 'bg-transparent text-gray-300 hover:text-white'
              }`}
          >
            <Layers size={14} /> Conservation Zones ({filteredTuskers.length})
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row">
        {/* ── Side panel ── */}
        <aside className={`w-full md:w-[380px] lg:w-[410px] shrink-0 bg-white border-r border-[#e2e8e4] flex flex-col min-h-0 overflow-y-auto overscroll-contain ${mobileTab === 'directory' ? 'portrait:flex portrait:flex-1' : 'portrait:hidden'
          } landscape:flex`}>
          <div className="p-3.5 sm:p-4 border-b border-[#edf2ef]">
            {/* Top Navigation Row */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6a7c73] hover:text-accent no-underline">
                <ArrowLeft size={14} /> Admin Portal
              </Link>
              <Link
                to="/admin/district-map"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:text-accent-hover bg-[#faf5ec] hover:bg-[#f3ebd9] px-2 py-1 rounded-md border border-accent/40 no-underline cursor-pointer transition-all"
              >
                <Compass size={12} />
                <span>Switch to District Map →</span>
              </Link>
            </div>

            <div className="flex items-center justify-between gap-2 mb-1">
              <h1 className="text-lg font-bold text-[#0b2518] m-0 flex items-center gap-2">
                <Layers size={18} className="text-accent" /> WTS Conservation Zones
              </h1>
              {selectedZone && (
                <button
                  type="button"
                  onClick={handleResetView}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 cursor-pointer"
                >
                  All 4 Zones
                </button>
              )}
            </div>
            <p className="text-xs text-[#6a7c73] m-0 mt-0.5">
              {loading ? 'Loading tuskers…' : `4 Strategic Elephant Landscapes across Sri Lanka · ${tuskers.length} Registered Tuskers`}
            </p>

            {/* The 4 Strategic Conservation Zones Cards */}
            <div className="grid grid-cols-2 gap-2 mt-3 mb-3">
              {Object.values(WTS_CONSERVATION_ZONES).map((zObj) => {
                const isSelected = selectedZone === zObj.shortName;
                const count = zoneStats[zObj.shortName] || 0;

                return (
                  <button
                    key={zObj.shortName}
                    type="button"
                    onClick={() => handleSelectZone(zObj.shortName)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${isSelected
                      ? 'border-2 shadow-sm'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    style={{
                      borderColor: isSelected ? zObj.color : undefined,
                      backgroundColor: isSelected ? `${zObj.color}10` : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: zObj.color }}
                        />
                        <span className="font-bold text-xs text-gray-900 truncate">
                          {zObj.shortName}
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0"
                        style={{
                          backgroundColor: `${zObj.color}20`,
                          color: zObj.color,
                        }}
                      >
                        {count}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-600 line-clamp-1">
                      {zObj.title}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa8a0]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={selectedZone ? `Search in ${selectedZone}…` : 'Search registered tuskers…'}
                className="w-full pl-8 pr-8 py-2 text-xs bg-[#f4f7f5] border border-[#dce3df] rounded-lg text-[#0b2518] placeholder:text-[#9aa8a0] focus:outline-none focus:border-accent focus:bg-white"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9aa8a0] hover:text-[#0b2518] bg-transparent border-none p-0 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-0.5 scrollbar-thin">
              <button
                type="button"
                onClick={() => setStatusFilter('')}
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold border cursor-pointer transition-all ${statusFilter === ''
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
                  className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold border cursor-pointer transition-all whitespace-nowrap ${statusFilter === status
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
                {selectedZone ? `${selectedZone} Tuskers` : 'All Registered Tuskers'}
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
              const areaInfo = tuskerAreaInfo(t);
              const zKey = t.zone?.match(/Zone\s*([1-4])/i) ? `Zone ${t.zone.match(/Zone\s*([1-4])/i)[1]}` : t.zone;
              const zColor = WTS_CONSERVATION_ZONES[zKey]?.color || '#9ca3af';

              return (
                <Link
                  key={t.id}
                  to={`/tuskers/${t.id.toLowerCase()}`}
                  state={{ from: '/admin/zone-map' }}
                  className="flex items-center gap-3 px-4 py-3 no-underline hover:bg-[#f6f9f7] transition-colors group"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: statusColor(t.livingStatus) }}
                    title={t.livingStatus || 'Alive'}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-accent">{t.id}</span>
                      <span className="text-xs font-bold text-[#0b2518] truncate group-hover:text-emerald-800">
                        {t.name}
                      </span>
                      {t.sinhala && (
                        <span className="text-[11px] text-[#7a8a81] truncate">({t.sinhala})</span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#6a7c73] truncate mt-0.5 flex items-center gap-1">
                      {areaInfo ? (
                        <span>{areaInfo.label}: {areaInfo.name}</span>
                      ) : (
                        <span>{t.district || t.province || 'Sri Lanka'}</span>
                      )}
                    </div>
                  </div>
                  {zKey && (
                    <span
                      className="text-[9.5px] font-bold px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap"
                      style={{
                        backgroundColor: `${zColor}18`,
                        color: zColor,
                      }}
                    >
                      {zKey}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </aside>

        {/* ── Map Viewport ── */}
        <div className={`relative flex-1 min-w-0 bg-[#0e1210] ${mobileTab === 'map' ? 'portrait:flex portrait:flex-col' : 'portrait:hidden'
          } landscape:flex landscape:flex-col`}>
          <div ref={hostRef} className="absolute inset-0" />

          {/* Floating Selected Zone Overlay Card on Map */}
          {selectedZone && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-[5] w-[calc(100%-1.5rem)] sm:w-[320px] max-w-[320px] bg-[#0d1612]/95 backdrop-blur-md rounded-xl shadow-2xl border border-emerald-500/40 text-white p-3.5 sm:p-4 animate-in fade-in">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: WTS_CONSERVATION_ZONES[selectedZone]?.color }}
                  />
                  <div className="text-sm font-bold text-white truncate">
                    {WTS_CONSERVATION_ZONES[selectedZone]?.name}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetView}
                  className="bg-transparent border-none cursor-pointer text-[#9ca3af] hover:text-white p-0.5"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="text-xs text-gray-300 leading-relaxed mb-3">
                <strong className="text-white">Districts:</strong> {WTS_CONSERVATION_ZONES[selectedZone]?.districts}
              </div>

              <div className="flex items-center justify-between text-xs pt-2.5 border-t border-white/10">
                <span className="text-emerald-400 font-bold">
                  {zoneStats[selectedZone] || 0} Registered Tuskers
                </span>
                <button
                  type="button"
                  onClick={handleResetView}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-accent hover:text-accent-hover bg-accent/15 hover:bg-accent/25 px-2.5 py-1 rounded-md border border-accent/40 cursor-pointer transition-all"
                  title="Restore full Sri Lanka view and show all 4 zones"
                >
                  <ArrowLeft size={11} />
                  <span>View Full Map</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
