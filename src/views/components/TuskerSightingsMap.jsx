import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  MapPin,
  Compass,
  Calendar,
  UserCheck,
  Eye,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { parseSightingDetails } from '../../models/TuskerModel';
import { getLocationCoordinates, resolveLocationCoordinatesAsync } from '../../utils/sriLankaLocations';
import { createMap } from '../../utils/mapEngine';
import { escapeHtml } from '../../utils/escapeHtml';

const SRI_LANKA_CENTER = [7.8731, 80.7718];

/**
 * TuskerSightingsMap
 * Administrative interactive Geographical Map plotting verified field sighting points for a specific tusker.
 * - Sighting points start from Row 2 (Sighting #1) onwards.
 * - By default, all sighting pins are visible on the map.
 * - Selecting one sighting filters the map to only display that specific pin and zooms into it.
 * - Clicking "View all sightings" restores all pins on the map.
 */
export default function TuskerSightingsMap({
  tusker,
  onPreviewPhoto,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [resolvedCoordsMap, setResolvedCoordsMap] = useState({});

  // Asynchronously resolve coordinates for any location not matched synchronously
  useEffect(() => {
    if (!tusker?.sightings || !Array.isArray(tusker.sightings)) return;
    let isMounted = true;

    tusker.sightings.forEach((sighting, idx) => {
      const details = parseSightingDetails(sighting);
      const loc = details.location;
      if (!loc) return;
      const key = sighting.id || `sighting-${idx}`;
      const syncCoords = details.coords || getLocationCoordinates(loc);

      if (!syncCoords && !resolvedCoordsMap[key]) {
        resolveLocationCoordinatesAsync(loc).then((coords) => {
          if (isMounted && coords) {
            setResolvedCoordsMap((prev) => ({ ...prev, [key]: coords }));
          }
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [tusker?.sightings, resolvedCoordsMap]);

  // Subsequent sighting records (Row 2, Row 3...)
  const sightingRecords = useMemo(() => {
    if (!tusker?.sightings || !Array.isArray(tusker.sightings)) return [];
    return tusker.sightings.map((sighting, idx) => {
      const details = parseSightingDetails(sighting);
      const rowNum = idx + 2;
      const sightingNum = idx + 1;
      const key = sighting.id || `sighting-${idx}`;
      const resolvedCoords = details.coords || getLocationCoordinates(details.location) || resolvedCoordsMap[key] || null;

      return {
        id: key,
        rowNum,
        sightingNum,
        isBaseline: false,
        title: `${tusker.name} (${tusker.id}) - Sighting #${sightingNum}`,
        location: details.location || 'Location unrecorded',
        date: sighting.captureDate || '—',
        author: sighting.author || 'WTS Field Contributor',
        health: details.healthCondition || '—',
        threat: details.threatLevel || '—',
        photo: (details.images && details.images[0]) || (sighting.imageUrl ? (typeof sighting.imageUrl === 'string' ? sighting.imageUrl.split(',')[0].trim() : sighting.imageUrl) : null),
        notes: details.note || (!sighting.note?.trim().startsWith('{') ? sighting.note : '') || details.remarks || '—',
        coords: resolvedCoords,
        rawSighting: sighting,
      };
    });
  }, [tusker, resolvedCoordsMap]);

  // All active plotted points (verified field sightings with coordinates)
  const activePoints = useMemo(() => {
    return sightingRecords.filter((rec) => Boolean(rec.coords));
  }, [sightingRecords]);

  // Points currently visible on the map:
  // If one sighting is selected, ONLY that specific pin is visible; otherwise ALL are visible
  const displayedPoints = useMemo(() => {
    if (selectedPoint) {
      const single = activePoints.find((p) => p.id === selectedPoint.id);
      return single ? [single] : activePoints;
    }
    return activePoints;
  }, [selectedPoint, activePoints]);

  // View all sightings handler: restores all pins and refits map bounds
  const handleViewAll = useCallback(() => {
    setSelectedPoint(null);
    const map = mapRef.current;
    if (map && activePoints.length > 0) {
      if (activePoints.length === 1 && activePoints[0].coords) {
        map.setView([activePoints[0].coords.lat, activePoints[0].coords.lng], 12);
      } else {
        map.fitBounds(activePoints.map((p) => [p.coords.lat, p.coords.lng]), { padding: 50, maxZoom: 13 });
      }
    }
  }, [activePoints]);

  // Select / isolate a specific point
  const handleSelectPoint = useCallback((point) => {
    if (!point.coords) return;
    if (selectedPoint?.id === point.id) {
      handleViewAll();
    } else {
      setSelectedPoint(point);
    }
  }, [selectedPoint?.id, handleViewAll]);

  // Initialize the map (Google Maps when a key is set, free maps otherwise)
  useEffect(() => {
    let active = true;
    let created = null;
    if (!mapContainerRef.current) return undefined;

    createMap(mapContainerRef.current, { center: SRI_LANKA_CENTER, zoom: 8, gestureHandling: 'cooperative' })
      .then((map) => {
        if (!active) { map.destroy(); return; }
        created = map;
        mapRef.current = map;
        setIsMapLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to initialize sightings map:', err);
      });

    return () => {
      active = false;
      if (created) created.destroy();
      mapRef.current = null;
    };
  }, []);

  // Update markers whenever displayedPoints or isMapLoaded changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    map.clearMarkers();

    if (displayedPoints.length === 0) {
      map.setView(SRI_LANKA_CENTER, 8);
      return;
    }

    const latLngs = [];
    let lastPin = null;

    displayedPoints.forEach((point) => {
      if (!point.coords) return;
      const pos = [point.coords.lat, point.coords.lng];
      latLngs.push(pos);

      const pinLabel = `S${point.sightingNum}`;
      const markerHtml = `
        <div style="position: relative; width: 36px; height: 44px; cursor: pointer; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.45));">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 44" width="36" height="44">
            <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z" fill="#0b2518" stroke="#c69b55" stroke-width="2.5"/>
            <circle cx="18" cy="18" r="11" fill="#16402b"/>
            <text x="18" y="22" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif">${escapeHtml(pinLabel)}</text>
          </svg>
        </div>
      `;

      lastPin = map.addMarker(pos, {
        html: markerHtml,
        height: 44,
        popup: {
          badge: `Row ${point.rowNum} • Sighting #${point.sightingNum}`,
          date: point.date,
          title: point.location,
          lines: [point.author ? `Observer: ${point.author}` : ''],
        },
        onClick: () => setSelectedPoint(point),
      });
    });

    if (latLngs.length === 1) {
      map.setView(latLngs[0], 12, { animate: true });
      if (selectedPoint && lastPin) lastPin.openPopup();
    } else if (latLngs.length > 1) {
      map.fitBounds(latLngs, { padding: 50, maxZoom: 13 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedPoints, isMapLoaded]);

  return (
    <div className="mt-8 bg-white border border-[#e2e8e0] rounded-[16px] overflow-hidden shadow-xs font-sans">
      {/* ── Top Bar ── */}
      <div className="p-4 sm:p-5 bg-[#fafaf8] border-b border-[#e8ece9] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#666666]">
              {selectedPoint
                ? `1 of ${activePoints.length} Sighting Point Visible`
                : `${activePoints.length} Sighting Point${activePoints.length === 1 ? '' : 's'} Mapped`}
            </span>
            {selectedPoint && (
              <span className="text-[0.72rem] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                Sighting #{selectedPoint.sightingNum} Isolated
              </span>
            )}
          </div>
          <h3 className="font-sans text-[1.15rem] font-bold text-[#111111] m-0 flex items-center gap-2">
            <Compass size={18} className="text-accent" />
            <span>Field Sightings Geographical Map</span>
          </h3>
          <p className="font-sans text-xs text-[#666666] m-0 mt-0.5">
            Geographical plot of verified sightings for {tusker?.name} ({tusker?.id}). Observations are plotted from Row 2 onwards.
          </p>
        </div>

        {/* ── View All Sightings Button ── */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleViewAll}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              !selectedPoint
                ? 'bg-[#0b2518] text-white border-[#0b2518] shadow-xs cursor-default'
                : 'bg-[#faf5ec] text-[#0b2518] border-accent/50 hover:bg-accent hover:text-white shadow-sm'
            }`}
            title="Display all sighting pins on the map"
          >
            <Eye size={14} className={!selectedPoint ? 'text-accent' : 'text-accent'} />
            <span>View all sightings</span>
          </button>
        </div>
      </div>

      {/* ── Interactive Map View Container ── */}
      <div className="relative w-full h-[400px] sm:h-[480px] bg-[#e5e5e5] overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Active Point Detail Card Overlay */}
        {selectedPoint && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-md rounded-xl p-3.5 shadow-xl border border-black/10 z-[1000] animate-in fade-in">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[0.68rem] font-bold bg-[#e8f5ec] text-[#1f7a3d]">
                  Row {selectedPoint.rowNum} • Sighting #{selectedPoint.sightingNum}
                </span>
                <h4 className="font-sans text-sm font-bold text-[#111111] m-0 mt-1">
                  {selectedPoint.location}
                </h4>
              </div>
              <button
                type="button"
                onClick={handleViewAll}
                className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0"
                title="Close and view all sightings"
              >
                <X size={14} />
              </button>
            </div>

            <div className="text-xs text-[#555555] flex flex-col gap-1 mb-2.5">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-accent" />
                <span>Date: {selectedPoint.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <UserCheck size={12} className="text-accent" />
                <span>Recorded By: {selectedPoint.author}</span>
              </div>
              {selectedPoint.coords && (
                <div className="flex items-center gap-1.5 font-mono text-[0.72rem] text-[#888888]">
                  <MapPin size={11} className="text-accent" />
                  <span>{selectedPoint.coords.lat.toFixed(4)}, {selectedPoint.coords.lng.toFixed(4)}</span>
                </div>
              )}
            </div>

            {selectedPoint.photo && (
              <div
                className="relative h-24 rounded-lg overflow-hidden bg-black/5 cursor-pointer group"
                onClick={() => {
                  if (typeof onPreviewPhoto === 'function') {
                    onPreviewPhoto({
                      url: selectedPoint.photo,
                      title: selectedPoint.title,
                      date: selectedPoint.date,
                      author: selectedPoint.author,
                      location: selectedPoint.location,
                      healthCondition: selectedPoint.health,
                      threatLevel: selectedPoint.threat,
                      note: selectedPoint.notes,
                    });
                  }
                }}
              >
                <img src={selectedPoint.photo} alt="Point photo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs gap-1 font-semibold">
                  <Eye size={12} />
                  <span>View Photo</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Sightings Points Registry Strip below Map ── */}
      <div className="p-4 bg-[#fafaf8] border-t border-[#e8ece9]">
        <div className="text-xs font-bold text-[#666666] uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span>Sighting Points Plotted on Map</span>
          <span className="font-normal lowercase text-[#888888]">
            click any point to isolate &amp; focus
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {/* Subsequent Sightings Chips (Row 2, Row 3...) */}
          {sightingRecords.map((point) => {
            const isSelected = selectedPoint?.id === point.id;
            const hasCoords = Boolean(point.coords);

            return (
              <div
                key={point.id}
                onClick={() => handleSelectPoint(point)}
                className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                  isSelected
                    ? 'bg-[#0b2518] text-white border-[#0b2518] shadow-xs'
                    : 'bg-white text-[#111111] border-[#dce3de] hover:border-accent'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isSelected ? 'bg-accent text-[#0b2518]' : 'bg-[#e8f5ec] text-[#16402b]'
                }`}>
                  S{point.sightingNum}
                </div>
                <div>
                  <div className="font-bold">
                    Row {point.rowNum} • Sighting #{point.sightingNum}
                  </div>
                  <div className={`text-[11px] truncate max-w-[150px] ${isSelected ? 'text-white/80' : 'text-[#666666]'}`}>
                    {point.location}
                  </div>
                </div>
                {hasCoords ? (
                  <Check size={12} className={isSelected ? 'text-white' : 'text-accent'} />
                ) : (
                  <AlertCircle size={12} className="text-amber-500" title="Location coordinates pending" />
                )}
              </div>
            );
          })}

          {sightingRecords.length === 0 && (
            <div className="text-xs text-[#888888] italic px-2 py-1">
              No subsequent field sightings logged yet. Sighting points will populate automatically when records are added.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
