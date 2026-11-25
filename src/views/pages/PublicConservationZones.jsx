/**
 * @file PublicConservationZones.jsx
 * @description Public interactive explorer for the 4 WTS Strategic Regional Landscapes & Conservation Zones.
 * Renders the 4 official zone boundaries on an interactive Leaflet canvas with zone details, covered districts,
 * and a registered wild tusker directory.
 *
 * CRITICAL SECURITY GUARANTEE:
 * To safeguard endangered wild tuskers from poaching and harassment, this public view strictly OMITS all
 * last-seen location pins, precise GPS coordinates, and specific sighting spot names.
 */

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import {
  Search,
  Layers,
  X,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { getTuskers, LIVING_STATUSES } from '../../models/TuskerModel';
import { createMap } from '../../utils/mapEngine';
import WTS_CONSERVATION_ZONES from '../../data/wtsConservationZones.json';

const SRI_LANKA_CENTER = [7.8731, 80.7718];
const STATUS_COLORS = {
  Alive: '#16a34a',
  'No Recent Record': '#d97706',
  'No Recent Records': '#d97706',
  Deceased: '#dc2626',
};
const statusColor = (s) => STATUS_COLORS[s] || '#16a34a';

export default function PublicConservationZones({ isActive = true }) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [tuskers, setTuskers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [selectedZone, setSelectedZone] = useState(null); // 'Zone 1' | 'Zone 2' | 'Zone 3' | 'Zone 4' | null
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [mobileTab, setMobileTab] = useState('map'); // 'map' | 'directory'

  const hostRef = useRef(null);
  const mapRef = useRef(null);
  const containerBoxRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // Smoothly scrolls to the map container so it is in full view
  const scrollToMapContainer = useCallback((smooth = true) => {
    const doScroll = () => {
      if (!containerBoxRef.current) return;
      const rect = containerBoxRef.current.getBoundingClientRect();
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      const containerTop = currentScrollY + rect.top;
      const navbarOffset = window.innerWidth >= 640 ? 84 : 70;

      // Position the top of the map container 8px below the fixed navbar
      const targetY = Math.max(0, containerTop - navbarOffset - 8);

      window.scrollTo({
        top: Math.round(targetY),
        behavior: smooth ? 'smooth' : 'instant',
      });
    };

    // Stagger slightly to ensure layout and map canvas dimensions are rendered
    setTimeout(doScroll, 80);
    setTimeout(doScroll, 220);
  }, []);

  // Check URL query param for initial zone selection (e.g. from Tusker Profile)
  useEffect(() => {
    const zoneParam = searchParams.get('zone');
    if (zoneParam) {
      const m = zoneParam.match(/Zone\s*([1-4])/i);
      const normalizedZone = m ? `Zone ${m[1]}` : zoneParam;
      if (WTS_CONSERVATION_ZONES[normalizedZone]) {
        setSelectedZone(normalizedZone);
      }
    }
  }, [searchParams]);

  // Auto-scroll so map container is in full view when arriving via link or zone selection
  useEffect(() => {
    const shouldScroll = Boolean(
      searchParams.get('zone') ||
      location.hash?.includes('zones-map') ||
      location.state?.scrollToMap
    );

    if (shouldScroll && isActive) {
      scrollToMapContainer(true);
    }
  }, [searchParams, location.hash, location.state, isActive, scrollToMapContainer]);

  useEffect(() => {
    getTuskers()
      .then(setTuskers)
      .catch((err) => setLoadError(err.message || 'Could not load tuskers'))
      .finally(() => setLoading(false));
  }, []);

  // Resize map when switching tabs on mobile or when parent tab becomes active
  useEffect(() => {
    if (mapRef.current && (isActive || mobileTab === 'map')) {
      const timer = setTimeout(() => {
        try {
          mapRef.current?.resize();
          if (selectedZone && WTS_CONSERVATION_ZONES[selectedZone]?.bbox) {
            mapRef.current.fitBounds(WTS_CONSERVATION_ZONES[selectedZone].bbox, { padding: 45 });
          } else {
            mapRef.current.setView(SRI_LANKA_CENTER, 7);
          }
        } catch {
          // ignore
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isActive, mobileTab, selectedZone]);

  // Count tuskers per zone
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

  // Filter tuskers for public directory (strictly omitting last seen coordinates & areas)
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
      // Query match (only search public name, id, district, province, or zone)
      if (q) {
        const hay = `${t.id} ${t.name || ''} ${t.sinhala || ''} ${t.district || ''} ${t.province || ''} ${t.zone || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));
  }, [tuskers, selectedZone, statusFilter, query]);

  // Initialize Map
  useEffect(() => {
    let active = true;
    let created = null;
    createMap(hostRef.current, {
      center: SRI_LANKA_CENTER,
      zoom: 7,
      gestureHandling: 'greedy',
      mapTypeId: 'hybrid',
    })
      .then((map) => {
        if (!active) { map.destroy(); return; }
        created = map;
        mapRef.current = map;
        setMapReady(true);
      })
      .catch((err) => console.error('Public conservation zones map failed to load:', err));

    return () => {
      active = false;
      if (created) created.destroy();
      mapRef.current = null;
    };
  }, []);

  const handleSelectZone = useCallback((zoneKey) => {
    setSelectedZone((prev) => {
      if (prev === zoneKey) {
        if (mapRef.current) {
          mapRef.current.setView(SRI_LANKA_CENTER, 7);
        }
        return null;
      } else {
        setMobileTab('map');
        const zObj = WTS_CONSERVATION_ZONES[zoneKey];
        if (zObj && zObj.bbox && mapRef.current) {
          mapRef.current.fitBounds(zObj.bbox, { padding: 45 });
        }
        return zoneKey;
      }
    });
  }, []);

  // Draw the 4 Conservation Zones on the map (SECURITY: Absolutely NO markers/pins)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    map.clearAreas();
    map.clearMarkers(); // Strict security: zero pins drawn

    // When a zone is selected, zoom in and highlight it
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
            fillOpacity: isZoneActive ? 0.38 : 0.20,
            stroke: zoneObj.strokeColor,
            strokeWeight: isZoneActive ? 3.5 : 2.0,
            onClick: () => {
              handleSelectZone(zoneObj.shortName);
            },
          }
        );
      } catch (err) {
        console.warn('[public map] could not add zone:', zoneObj.shortName, err);
      }
    });

    // If a zone is selected, fit bounds to that zone; otherwise center all Sri Lanka
    if (selectedZone && WTS_CONSERVATION_ZONES[selectedZone]?.bbox) {
      map.fitBounds(WTS_CONSERVATION_ZONES[selectedZone].bbox, { padding: 45 });
    } else {
      map.setView(SRI_LANKA_CENTER, 7);
    }
  }, [mapReady, selectedZone, handleSelectZone]);

  const handleResetView = () => {
    setSelectedZone(null);
    setQuery('');
    setStatusFilter('');
    if (mapRef.current) {
      mapRef.current.setView(SRI_LANKA_CENTER, 7);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 animate-fade-in font-sans mb-3 sm:mb-6">
      
      {/* ── Main Map + Directory Container ── */}
      <div
        id="zones-map-container"
        ref={containerBoxRef}
        className="w-full h-[540px] sm:h-[560px] md:h-[580px] lg:h-[600px] max-h-[calc(100vh-96px)] min-h-[440px] rounded-2xl overflow-hidden border border-[#e5e7eb] shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col bg-white scroll-mt-24"
      >
        
        {/* Mobile View Switcher */}
        <div className="portrait:flex landscape:hidden flex items-center justify-center p-2.5 bg-[#0b2518] border-b border-white/10 shrink-0">
          <div className="flex rounded-xl bg-white/10 p-1 border border-white/15 w-full max-w-sm text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMobileTab('map')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none ${
                mobileTab === 'map'
                  ? 'bg-accent text-primary font-bold shadow-xs'
                  : 'bg-transparent text-gray-300 hover:text-white'
              }`}
            >
              <MapPin size={14} /> Map Canvas
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('directory')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none ${
                mobileTab === 'directory'
                  ? 'bg-accent text-primary font-bold shadow-xs'
                  : 'bg-transparent text-gray-300 hover:text-white'
              }`}
            >
              <Layers size={14} /> Tuskers Directory ({filteredTuskers.length})
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col md:flex-row">
          
          {/* ── Side Directory Panel ── */}
          <aside className={`w-full md:w-[380px] lg:w-[420px] shrink-0 bg-white border-r border-[#e8ece9] flex flex-col min-h-0 ${
            mobileTab === 'directory' ? 'portrait:flex portrait:flex-1' : 'portrait:hidden'
          } landscape:flex`}>
            
            {/* Header section with zone pills */}
            <div className="p-4 border-b border-[#edf2ef] flex flex-col gap-3 shrink-0 bg-gradient-to-b from-[#fafcfb] to-white">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center text-primary">
                    <Layers size={15} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0b2518] m-0 leading-tight">
                      Conservation Landscapes
                    </h3>
                    <p className="text-[11px] text-[#718079] m-0">
                      {loading ? 'Loading records…' : `${tuskers.length} Documented Wild Tuskers`}
                    </p>
                  </div>
                </div>

                {selectedZone && (
                  <button
                    type="button"
                    onClick={handleResetView}
                    className="text-[11px] font-bold text-accent hover:text-accent-hover bg-[#faf5ec] hover:bg-[#f3ebd9] px-2.5 py-1 rounded-lg border border-accent/40 cursor-pointer transition-all"
                  >
                    All 4 Zones
                  </button>
                )}
              </div>

              {/* The 4 Strategic Conservation Zones Pills */}
              <div className="grid grid-cols-2 gap-2">
                {Object.values(WTS_CONSERVATION_ZONES).map((zObj) => {
                  const isSelected = selectedZone === zObj.shortName;
                  const count = zoneStats[zObj.shortName] || 0;

                  return (
                    <button
                      key={zObj.shortName}
                      type="button"
                      onClick={() => handleSelectZone(zObj.shortName)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-2 shadow-sm'
                          : 'border-[#e5e7eb] bg-white hover:bg-gray-50/80 hover:border-gray-300'
                      }`}
                      style={{
                        borderColor: isSelected ? zObj.color : undefined,
                        backgroundColor: isSelected ? `${zObj.color}12` : undefined,
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
                          className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md shrink-0"
                          style={{
                            backgroundColor: `${zObj.color}22`,
                            color: zObj.color,
                          }}
                        >
                          {count}
                        </span>
                      </div>
                      <div className="text-[10.5px] text-gray-500 line-clamp-1">
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
                  placeholder={selectedZone ? `Search within ${selectedZone}…` : 'Search tusker name, ID, or district…'}
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
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setStatusFilter('')}
                  className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold border cursor-pointer transition-all whitespace-nowrap ${
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
                    className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold border cursor-pointer transition-all whitespace-nowrap ${
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

            {/* ── Scrollable Tusker List with Modern Slim Scrollbar ── */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#edf1ee] overscroll-contain wts-slim-scrollbar">
              <div className="px-4 py-2 bg-[#f8faf9] text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between sticky top-0 z-10 border-b border-[#edf1ee]">
                <span>
                  {selectedZone ? `${selectedZone} Registered Tuskers` : 'All Registered Tuskers'}
                </span>
                <span className="font-mono text-gray-600">{filteredTuskers.length}</span>
              </div>

              {loadError && (
                <div className="p-4 text-xs text-red-600 bg-red-50">{loadError}</div>
              )}

              {filteredTuskers.length === 0 && !loading && (
                <div className="p-8 text-center text-xs text-gray-500">
                  No registered tuskers match the current filters.
                </div>
              )}

              <div className="pb-4">
                {filteredTuskers.map((t) => {
                  const zKey = t.zone?.match(/Zone\s*([1-4])/i) ? `Zone ${t.zone.match(/Zone\s*([1-4])/i)[1]}` : t.zone;
                  const zColor = WTS_CONSERVATION_ZONES[zKey]?.color || '#9ca3af';

                  return (
                    <Link
                      key={t.id}
                      to={`/tuskers/${t.id.toLowerCase()}`}
                      state={{ from: '/tusker-insights?tab=zones' }}
                      className="flex items-center gap-3 px-4 py-2.5 no-underline hover:bg-[#f4f8f5] transition-colors group border-b border-[#f1f4f2] last:border-b-0"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ background: statusColor(t.livingStatus) }}
                        title={t.livingStatus || 'Alive'}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-bold text-accent">{t.id}</span>
                          <span className="text-xs font-bold text-[#0b2518] truncate group-hover:text-emerald-800">
                            {t.name}
                          </span>
                          {t.sinhala && (
                            <span className="text-[11px] text-[#7a8a81] truncate">({t.sinhala})</span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#6a7c73] truncate mt-0.5">
                          <span>{t.district || t.province || (zKey ? `${zKey} Landscape` : 'Sri Lanka')}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        {zKey && (
                          <span
                            className="text-[9.5px] font-bold px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: `${zColor}15`,
                              color: zColor,
                            }}
                          >
                            {zKey}
                          </span>
                        )}
                        <ChevronRight size={13} className="text-gray-300 group-hover:text-emerald-600 transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ── Fixed Sidebar Footer ── */}
            <div className="px-4 py-2.5 bg-[#f8faf9] border-t border-[#edf2ef] flex items-center justify-between text-[11px] text-gray-500 shrink-0 font-medium">
              <span>{filteredTuskers.length} of {tuskers.length} Tuskers Listed</span>
              {selectedZone ? (
                <span className="text-accent font-semibold">{selectedZone}</span>
              ) : (
                <span className="text-gray-400">All Landscapes</span>
              )}
            </div>
          </aside>

          {/* ── Map Viewport ── */}
          <div className={`relative flex-1 min-w-0 bg-[#0e1210] ${
            mobileTab === 'map' ? 'portrait:flex portrait:flex-col' : 'portrait:hidden'
          } landscape:flex landscape:flex-col`}>
            <div ref={hostRef} className="absolute inset-0" />

            {/* Floating Selected Zone Overlay Card on Map */}
            {selectedZone && (
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-[5] w-[calc(100%-1.5rem)] sm:w-[320px] max-w-[320px] bg-[#0b2518]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-500/30 text-white p-4 animate-in fade-in">
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
                    className="bg-white/10 hover:bg-white/20 rounded-full w-6 h-6 flex items-center justify-center border-none cursor-pointer text-gray-300 hover:text-white transition-colors"
                    aria-label="Close"
                  >
                    <X size={13} />
                  </button>
                </div>

                <div className="text-xs text-gray-300 leading-relaxed mb-3">
                  <strong className="text-white">Covered Districts:</strong> {WTS_CONSERVATION_ZONES[selectedZone]?.districts}
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
                    <span>View All Zones</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
