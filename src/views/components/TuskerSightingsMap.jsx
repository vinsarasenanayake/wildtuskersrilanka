/**
 * @file TuskerSightingsMap.jsx
 * @description Interactive geospatial sightings map rendered within individual tusker profiles.
 * Visualizes verified chronological encounters, dynamic home range polygon clipping,
 * and the specific WTS Conservation Zone boundary assigned to the individual tusker.
 */

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
  Edit,
} from 'lucide-react';
import { parseSightingDetails } from '../../models/TuskerModel';
import { getLocationCoordinates, resolveLocationCoordinatesAsync } from '../../utils/sriLankaLocations';
import { createMap } from '../../utils/mapEngine';
import { escapeHtml } from '../../utils/escapeHtml';
import { isDistrictTown, habitatFor, townCentrePolygons, ELEPHANT_RANGE_COORDS } from '../../utils/habitat';
import { loadParkBoundaries, parkBoundaryFor, hasParkBoundary } from '../../utils/parkBoundaries';
import polygonClipping from '../../utils/vendor/polygonClipping';
import SRI_LANKA_LAND from '../../data/sriLankaLand.json';
import WTS_CONSERVATION_ZONES from '../../data/wtsConservationZones.json';
import SRI_LANKA_DISTRICTS_DATA from '../../data/sriLankaDistrictsData.json';
import { getLocationDistricts } from '../../utils/locationDistricts';

const SRI_LANKA_CENTER = [7.8731, 80.7718];

/** Resolves district definition(s) from tusker.district or roaming areas */
function getTuskerDistrictData(tusker) {
  if (!tusker) return [];
  const foundNames = new Set();

  if (tusker.district) {
    String(tusker.district).split(/[,/]/).forEach((d) => {
      const clean = d.trim();
      if (SRI_LANKA_DISTRICTS_DATA[clean]) foundNames.add(clean);
    });
  }

  if (foundNames.size === 0 && tusker.lastSeenArea) {
    const fromArea = getLocationDistricts(tusker.lastSeenArea);
    fromArea.forEach((d) => {
      if (SRI_LANKA_DISTRICTS_DATA[d]) foundNames.add(d);
    });
  }

  if (foundNames.size === 0 && tusker.location) {
    const fromLoc = getLocationDistricts(tusker.location);
    fromLoc.forEach((d) => {
      if (SRI_LANKA_DISTRICTS_DATA[d]) foundNames.add(d);
    });
  }

  return Array.from(foundNames).map((name) => SRI_LANKA_DISTRICTS_DATA[name]).filter(Boolean);
}

/** Resolves zone definition from tusker.zone */
function getZoneData(zoneKey) {
  if (!zoneKey) return null;
  const clean = String(zoneKey).trim();
  if (WTS_CONSERVATION_ZONES[clean]) return WTS_CONSERVATION_ZONES[clean];
  const m = clean.match(/Zone\s*([1-4])/i);
  if (m) {
    const k = `Zone ${m[1]}`;
    return WTS_CONSERVATION_ZONES[k] || null;
  }
  return null;
}

/** A circle polygon ([[ring]]) of `km` around a point. */
function circlePolygon(pt, km) {
  const dLat = km / 111;
  const dLng = dLat / Math.cos((pt.lat * Math.PI) / 180);
  const ring = [];
  for (let i = 0; i < 48; i++) {
    const t = (i * 2 * Math.PI) / 48;
    ring.push([pt.lng + Math.cos(t) * dLng, pt.lat + Math.sin(t) * dLat]);
  }
  ring.push(ring[0]);
  return [ring];
}

/**
 * Builds a tusker's home range from real places, not circles:
 *  • Parks, sanctuaries and Yala blocks use their real boundaries.
 *  • Other places (villages, tanks, corridors) cover the elephant land
 *    around them (≈6 km), cut to where wild elephants actually roam.
 *  • Everything is cut to the coastline, and busy town centres are removed.
 */
function buildHomeRange(parkPolygons = [], placeCoords = [], placeKm = 6) {
  if (!parkPolygons.length && !placeCoords.length) return null;
  let pieces = [];
  try {
    const towns = townCentrePolygons();
    const parts = [];
    if (parkPolygons.length) {
      const parks = polygonClipping.intersection(polygonClipping.union(...parkPolygons), SRI_LANKA_LAND.coordinates);
      if (parks.length) parts.push(parks);
    }
    if (placeCoords.length) {
      const blobs = polygonClipping.union(...placeCoords.map((pt) => circlePolygon(pt, placeKm)));
      const onLand = polygonClipping.intersection(blobs, SRI_LANKA_LAND.coordinates);
      const inRange = onLand.length ? polygonClipping.intersection(onLand, ELEPHANT_RANGE_COORDS) : [];
      const base = inRange.length ? inRange : onLand;
      if (base.length) parts.push(base);
    }
    if (parts.length) {
      const all = parts.length > 1 ? polygonClipping.union(...parts) : parts[0];
      pieces = polygonClipping.difference(all, ...towns);
    }
  } catch (err) {
    console.warn('[TuskerSightingsMap] could not shape the home range', err);
  }
  if (!pieces.length) return null;
  const round = (poly) => poly.map((r) => r.map(([lng, lat]) => [Number(lng.toFixed(5)), Number(lat.toFixed(5))]));
  return {
    kind: 'polygon',
    geojson: pieces.length === 1
      ? { type: 'Polygon', coordinates: round(pieces[0]) }
      : { type: 'MultiPolygon', coordinates: pieces.map(round) },
  };
}

/** Ray-casting test: is a {lat, lng} point inside polygon coordinates? */
function pointInPolygons(pt, polygons) {
  const inRing = (ring) => {
    let c = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (((yi > pt.lat) !== (yj > pt.lat)) && (pt.lng < ((xj - xi) * (pt.lat - yi)) / (yj - yi) + xi)) c = !c;
    }
    return c;
  };
  return polygons.some((poly) => inRing(poly[0]) && !poly.slice(1).some(inRing));
}

/** Every outer-edge point of a Polygon or MultiPolygon, as [lng, lat]. */
function shapeOutlinePoints(geojson) {
  if (!geojson?.coordinates) return [];
  const polys = geojson.type === 'MultiPolygon' ? geojson.coordinates : [geojson.coordinates];
  return polys.flatMap((poly) => poly[0] || []);
}

// Helper to clean location tokens without stripping block numbers
function cleanToken(s) {
  return String(s || '').replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
}

/** Splits a LOCATION field into its places. "Yala Block 3,5" becomes
 *  "Yala Block 3" and "Yala Block 5" so both blocks are on the map. */
function splitLocationParts(raw) {
  return String(raw || '')
    .split(/\s*[/]\s*/)
    .map(cleanToken)
    .filter(Boolean)
    .flatMap((part) => {
      const m = part.match(/^(.*?\bblock)\s*(\d+(?:\s*,\s*\d+)+)$/i);
      return m ? m[2].split(/\s*,\s*/).map((n) => `${m[1]} ${n}`) : [part];
    });
}

/** Distance in km between two {lat, lng} points. */
function distanceKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// A last-seen place or field sighting this close to the registered roaming
// area is treated as part of the home range, so its pin sits inside the
// shaded area. Anything further away (e.g. a translocation) keeps its pin
// but does not stretch the home range across the country.
const NEARBY_RANGE_KM = 50;

/**
 * Returns visual theme for the home range polygon & badges according to tusker living status:
 * - Red for Deceased
 * - Green for Alive
 * - Yellow for No Recent Records
 */
function getStatusTheme(status) {
  const norm = String(status || '').trim().toLowerCase();
  if (norm === 'deceased') {
    return {
      fill: 'rgba(239, 68, 68, 0.18)',
      stroke: '#ef4444',
      pinFill: '#e11d48',
      pinInner: '#be123c',
      badgeBg: 'rgba(55, 10, 14, 0.96)',
      pillBg: 'bg-rose-50 border-rose-200 text-rose-900',
      dotBg: 'bg-rose-500',
      cardActive: 'bg-[#fff1f2] text-[#881337] border-[#f43f5e] ring-2 ring-[#f43f5e]/25',
      cardInactive: 'bg-white text-gray-700 border-gray-200 hover:border-rose-300',
      subtextColor: 'text-rose-700/80',
      checkColor: 'text-rose-600',
      label: 'Historical Area',
      disclaimerText: 'historical habitat area',
    };
  }
  if (norm === 'no recent record' || norm === 'no recent records' || norm === 'unknown' || norm === 'missing') {
    return {
      fill: 'rgba(234, 179, 8, 0.18)',
      stroke: '#eab308',
      pinFill: '#d97706',
      pinInner: '#b45309',
      badgeBg: 'rgba(50, 30, 8, 0.96)',
      pillBg: 'bg-amber-50 border-amber-200 text-amber-900',
      dotBg: 'bg-amber-500',
      cardActive: 'bg-[#fefce8] text-[#713f12] border-[#eab308] ring-2 ring-[#eab308]/25',
      cardInactive: 'bg-white text-gray-700 border-gray-200 hover:border-amber-300',
      subtextColor: 'text-amber-700/80',
      checkColor: 'text-amber-600',
      label: 'Roaming Area',
      disclaimerText: 'recorded roaming area (no recent records)',
    };
  }
  // Default: Alive
  return {
    fill: 'rgba(34, 197, 94, 0.18)',
    stroke: '#22c55e',
    pinFill: '#059669',
    pinInner: '#047857',
    badgeBg: 'rgba(11, 37, 24, 0.96)',
    pillBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    dotBg: 'bg-emerald-500',
    cardActive: 'bg-[#f0fdf4] text-[#14532d] border-[#22c55e] ring-2 ring-[#22c55e]/25',
    cardInactive: 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300',
    subtextColor: 'text-emerald-700/80',
    checkColor: 'text-emerald-600',
    label: 'Roaming Area',
    disclaimerText: 'registered roaming area',
  };
}

/**
 * TuskerSightingsMap
 * Displays the tusker's Home Range as a whole (slightly transparent red polygon / habitat shape
 * encompassing the full LOCATION corridor), plus chronological field sightings (Row 2+).
 */
export default function TuskerSightingsMap({
  tusker,
  onPreviewPhoto,
  onEditSighting,
  onEditTusker,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [resolvedCoordsMap, setResolvedCoordsMap] = useState({});
  // Real park / sanctuary / Yala block boundaries (loaded once, cached)
  const [parkBoundaries, setParkBoundaries] = useState(null);
  const [parksFailed, setParksFailed] = useState(false);

  const isDeceased = tusker?.livingStatus === 'Deceased';
  const statusTheme = useMemo(() => getStatusTheme(tusker?.livingStatus), [tusker?.livingStatus]);
  const tuskerZoneName = useMemo(() => {
    const raw = tusker?.zone ? String(tusker.zone).trim() : '';
    const m = raw.match(/Zone\s*([1-4])/i);
    return m ? `Zone ${m[1]}` : raw;
  }, [tusker?.zone]);

  // Asynchronously resolve coordinates for LOCATION corridor areas and sightings
  useEffect(() => {
    let isMounted = true;

    // 1. Resolve LOCATION field corridor areas
    if (tusker?.location) {
      const parts = splitLocationParts(tusker.location);
      parts.forEach((part, idx) => {
        const key = `loc-${idx}-${part.toLowerCase()}`;
        const syncCoords = getLocationCoordinates(part);
        if (!syncCoords && !resolvedCoordsMap[key]) {
          resolveLocationCoordinatesAsync(part).then((coords) => {
            if (isMounted && coords) setResolvedCoordsMap((prev) => ({ ...prev, [key]: coords }));
          });
        }
      });
    }

    // 2. Resolve field sightings coordinates (Row 2 onwards)
    (tusker?.sightings || []).forEach((sighting, idx) => {
      const details = parseSightingDetails(sighting);
      const loc = details.location;
      if (!loc) return;
      const key = sighting.id || `sighting-${idx}`;
      const syncCoords = details.coords || getLocationCoordinates(loc);
      if (!syncCoords && !resolvedCoordsMap[key]) {
        resolveLocationCoordinatesAsync(loc).then((coords) => {
          if (isMounted && coords) setResolvedCoordsMap((prev) => ({ ...prev, [key]: coords }));
        });
      }
    });

    // 3. Resolve explicit Last Seen area coordinate if needed
    if (tusker?.lastSeenArea) {
      const loc = cleanToken(tusker.lastSeenArea);
      const syncCoords = getLocationCoordinates(loc);
      if (!syncCoords && !resolvedCoordsMap['last-seen']) {
        resolveLocationCoordinatesAsync(loc).then((coords) => {
          if (isMounted && coords) setResolvedCoordsMap((prev) => ({ ...prev, 'last-seen': coords }));
        });
      }
    }

    return () => {
      isMounted = false;
    };
  }, [tusker?.location, tusker?.sightings, tusker?.lastSeenArea, resolvedCoordsMap]);

  // Load the real park and Yala block boundaries once
  useEffect(() => {
    let isMounted = true;
    loadParkBoundaries().then((b) => {
      if (!isMounted) return;
      if (b) setParkBoundaries(b); else setParksFailed(true);
    });
    return () => { isMounted = false; };
  }, []);

  // Resolve tusker administrative district(s) data
  const tuskerDistricts = useMemo(() => {
    return getTuskerDistrictData(tusker);
  }, [tusker?.district, tusker?.lastSeenArea, tusker?.location]);

  // Assemble habitat anchors (from LOCATION field), Last Seen pin, and field sightings (Row 2+)
  const { anchorCoords, sightingPoints, homeRangeShape, lastSeenPoint } = useMemo(() => {
    if (!tusker) return { anchorCoords: [], sightingPoints: [], homeRangeShape: null, lastSeenPoint: null };

    // ── 1. Resolve LOCATION field corridor anchors into unified coordinates ──
    const rawLoc = String(tusker.location || '').trim();
    const anchors = [];
    if (rawLoc) {
      const parts = splitLocationParts(rawLoc);
      // District towns (Anuradhapura, Ampara…) are not elephant habitat: leave
      // them out when real wildlife areas are listed, otherwise use the
      // wildlife area next to the town.
      const hasWildArea = parts.some((p) => !isDistrictTown(p));
      parts.forEach((part, idx) => {
        if (isDistrictTown(part)) {
          if (hasWildArea) return;
          const habitat = getLocationCoordinates(habitatFor(part));
          if (habitat) anchors.push(habitat);
          return;
        }
        const key = `loc-${idx}-${part.toLowerCase()}`;
        const coords = getLocationCoordinates(part) || resolvedCoordsMap[key] || null;
        if (coords) anchors.push(coords);
      });
    }

    // ── 2. Process Chronological Field Sightings (Row 2 onwards) ──
    const sightings = [];
    const rawSightings = Array.isArray(tusker.sightings) ? tusker.sightings : [];
    const sortedSightings = [...rawSightings].sort((a, b) =>
      String(a.captureDate || '').localeCompare(String(b.captureDate || '')) || (a.id || 0) - (a.id || 0)
    );

    sortedSightings.forEach((sighting, idx) => {
      const details = parseSightingDetails(sighting);
      const rowNum = idx + 2;
      const sightingNum = idx + 1;
      const key = sighting.id || `sighting-${idx}`;
      const coords = details.coords || getLocationCoordinates(details.location) || resolvedCoordsMap[key] || null;

      sightings.push({
        id: key,
        rawSighting: sighting,
        type: 'sighting',
        rowNum,
        sightingNum,
        title: `${tusker.name} (${tusker.id}) - Field Sighting #${sightingNum}`,
        location: details.location || 'Location unrecorded',
        date: sighting.captureDate || '—',
        author: sighting.author || 'WTS Field Contributor',
        health: details.healthCondition || '—',
        threat: details.threatLevel || '—',
        photo: (details.images && details.images[0]) || (sighting.imageUrl ? (typeof sighting.imageUrl === 'string' ? sighting.imageUrl.split(',')[0].trim() : sighting.imageUrl) : null),
        notes: details.note || (!sighting.note?.trim().startsWith('{') ? sighting.note : '') || details.remarks || '—',
        coords,
        badge: `Row ${rowNum} • Sighting #${sightingNum}`,
      });
    });


    // ── 4. Determine Last Seen Pin in this range (exact name + coordinates) ──
    const rawParts = rawLoc ? rawLoc.split(/\s*[/]\s*/).map(cleanToken).filter(Boolean) : [];
    let lastSeenAreaName = '';
    if (tusker.lastSeenArea && tusker.lastSeenArea.trim()) {
      lastSeenAreaName = cleanToken(tusker.lastSeenArea);
    } else if (sortedSightings.length > 0) {
      const last = sortedSightings[sortedSightings.length - 1];
      const parsed = parseSightingDetails(last);
      lastSeenAreaName = cleanToken(parsed.location || '');
    } else if (rawParts.length > 0) {
      const matched = rawParts.find((p) => tusker.name && tusker.name.toLowerCase().includes(p.toLowerCase()));
      lastSeenAreaName = matched || rawParts[0];
    }

    let lastSeenCoords = null;
    if (lastSeenAreaName) {
      if (isDistrictTown(lastSeenAreaName)) {
        // "Last seen: Trincomalee" means the Trincomalee area, not the town
        // centre: pin the tusker's nearest wildlife place, or the wildlife
        // area next to the town.
        const town = getLocationCoordinates(lastSeenAreaName);
        const nearest = town && anchors.length
          ? anchors.reduce((best, a) => (distanceKm(a, town) < distanceKm(best, town) ? a : best), anchors[0])
          : null;
        lastSeenCoords = nearest || getLocationCoordinates(habitatFor(lastSeenAreaName));
      } else {
        lastSeenCoords = getLocationCoordinates(lastSeenAreaName) || resolvedCoordsMap['last-seen'] || null;
      }
      if (!lastSeenCoords && anchors.length > 0) {
        lastSeenCoords = anchors[0];
      }
    }

    // ── 3. Build the home range from WTS Conservation Zones (Zones 1-4) ──
    const zoneData = getZoneData(tusker?.zone);
    let shape = null;

    if (zoneData) {
      shape = {
        kind: 'polygon',
        zoneData,
        geojson: {
          type: 'MultiPolygon',
          coordinates: zoneData.coordinates,
        },
      };
    } else {
      // Fallback: build home range from listed wildlife places & parks
      const parkPolygons = [];
      const placeCoords = [];
      let locParts = splitLocationParts(rawLoc);
      if (locParts.some((p) => /^yala\s+block\s*\d/i.test(p))) {
        locParts = locParts.filter((p) => !/^(yala|yala national park|ruhuna national park)$/i.test(p.trim()));
      }
      const listsWildArea = locParts.some((p) => !isDistrictTown(p));
      const waitingForParks = !parkBoundaries && !parksFailed && locParts.some((p) => hasParkBoundary(habitatFor(p)));
      locParts.forEach((part) => {
        if (listsWildArea && isDistrictTown(part)) return;
        const place = habitatFor(part);
        if (hasParkBoundary(place)) {
          const polys = parkBoundaryFor(place, parkBoundaries);
          if (polys) { polys.forEach((poly) => parkPolygons.push(poly)); return; }
        }
        const c = getLocationCoordinates(place);
        if (c) placeCoords.push({ lat: Number(c.lat), lng: Number(c.lng) });
      });
      const addIfNearby = (raw) => {
        const pt = raw ? { lat: Number(raw.lat), lng: Number(raw.lng) } : null;
        if (!pt || !Number.isFinite(pt.lat) || !Number.isFinite(pt.lng)) return;
        if (parkPolygons.length && pointInPolygons(pt, parkPolygons)) return;
        if (!anchors.length || anchors.some((a) => distanceKm(a, pt) <= NEARBY_RANGE_KM)) placeCoords.push(pt);
      };
      const lastSeenPark = lastSeenAreaName && hasParkBoundary(habitatFor(lastSeenAreaName))
        ? parkBoundaryFor(habitatFor(lastSeenAreaName), parkBoundaries)
        : null;
      if (lastSeenPark && lastSeenCoords && (!anchors.length || anchors.some((a) => distanceKm(a, lastSeenCoords) <= NEARBY_RANGE_KM))) {
        lastSeenPark.forEach((poly) => parkPolygons.push(poly));
      } else {
        addIfNearby(lastSeenCoords);
      }
      sightings.forEach((sp) => addIfNearby(sp.coords));
      shape = waitingForParks ? null : buildHomeRange(parkPolygons, placeCoords);
    }

    const lastSeen = (lastSeenAreaName && lastSeenCoords)
      ? {
          id: 'last-seen-pin',
          type: 'lastSeen',
          name: lastSeenAreaName,
          title: `${tusker.name} - ${isDeceased ? 'Last Known Location' : 'Last Seen Location'}: ${lastSeenAreaName}`,
          location: lastSeenAreaName,
          coords: lastSeenCoords,
          date: tusker.lastSeen || (sortedSightings.length > 0 ? sortedSightings[sortedSightings.length - 1].captureDate : 'Registered baseline'),
          badge: isDeceased ? 'Last Known Location' : 'Last Seen Location',
        }
      : null;

    return {
      anchorCoords: anchors,
      sightingPoints: sightings,
      homeRangeShape: shape,
      lastSeenPoint: lastSeen,
    };
  }, [tusker, resolvedCoordsMap, isDeceased, parkBoundaries, parksFailed]);

  // Points that have coordinates resolved
  const activeSightings = useMemo(() => {
    return sightingPoints.filter((rec) => Boolean(rec.coords));
  }, [sightingPoints]);

  // Points displayed on map (filtered if a single sighting is isolated)
  const displayedSightings = useMemo(() => {
    if (selectedPoint) {
      const single = activeSightings.find((p) => p.id === selectedPoint.id);
      return single ? [single] : activeSightings;
    }
    return activeSightings;
  }, [selectedPoint, activeSightings]);

  // View full home range handler: restores map to full home range polygon
  const handleViewHomeRange = useCallback(() => {
    setSelectedPoint(null);
    const map = mapRef.current;
    if (!map) return;
    map.closePopup?.();

    if (homeRangeShape?.zoneData?.bbox) {
      map.fitBounds(homeRangeShape.zoneData.bbox, { padding: 40 });
      return;
    }

    const allPts = [];
    // Ensure the entire polygon perimeter is included so the full home range is always visible
    if (shapeOutlinePoints(homeRangeShape?.geojson).length) {
      shapeOutlinePoints(homeRangeShape.geojson).forEach(([lng, lat]) => {
        allPts.push([lat, lng]);
      });
    } else {
      anchorCoords.forEach((c) => allPts.push([c.lat, c.lng]));
    }
    activeSightings.forEach((p) => {
      if (p.coords) allPts.push([p.coords.lat, p.coords.lng]);
    });
    if (lastSeenPoint?.coords) {
      allPts.push([lastSeenPoint.coords.lat, lastSeenPoint.coords.lng]);
    }

    const uniquePts = [];
    const seenSet = new Set();
    allPts.forEach(([lat, lng]) => {
      const k = `${lat.toFixed(4)},${lng.toFixed(4)}`;
      if (!seenSet.has(k)) {
        seenSet.add(k);
        uniquePts.push([lat, lng]);
      }
    });

    if (uniquePts.length === 1) {
      map.setView(uniquePts[0], 10, { animate: true });
    } else if (uniquePts.length > 1) {
      map.fitBounds(uniquePts, { padding: 45, maxZoom: 11 });
    }
  }, [homeRangeShape, anchorCoords, activeSightings, lastSeenPoint]);

  // Select / isolate a specific sighting or last seen point
  const handleSelectPoint = useCallback((point) => {
    if (!point.coords) return;
    if (selectedPoint?.id === point.id) {
      handleViewHomeRange();
    } else {
      setSelectedPoint(point);
    }
  }, [selectedPoint?.id, handleViewHomeRange]);

  // Initialize the map
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

  // Update map shape (slightly transparent red polygon) and sighting markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    map.clearMarkers();
    map.clearAreas();

    const allPts = [];
    if (!selectedPoint && shapeOutlinePoints(homeRangeShape?.geojson).length) {
      // Include the entire home range polygon perimeter so the full habitat area is visible
      shapeOutlinePoints(homeRangeShape.geojson).forEach(([lng, lat]) => {
        allPts.push([lat, lng]);
      });
    } else {
      anchorCoords.forEach((c) => allPts.push([c.lat, c.lng]));
    }
    displayedSightings.forEach((p) => {
      if (p.coords) allPts.push([p.coords.lat, p.coords.lng]);
    });

    if (allPts.length === 0) {
      map.setView(SRI_LANKA_CENTER, 8);
      return;
    }

    // Deduplicate coordinate points to prevent Leaflet fitBounds 0-size bounds glitch
    const uniquePts = [];
    const seenSet = new Set();
    allPts.forEach(([lat, lng]) => {
      const k = `${lat.toFixed(4)},${lng.toFixed(4)}`;
      if (!seenSet.has(k)) {
        seenSet.add(k);
        uniquePts.push([lat, lng]);
      }
    });

    // ── 0. Render Administrative District Boundary Shape(s) ──
    tuskerDistricts.forEach((dObj) => {
      try {
        map.addArea(
          {
            kind: 'polygon',
            geojson: {
              type: dObj.type || 'Polygon',
              coordinates: dObj.coordinates,
            },
          },
          {
            fill: dObj.color,
            fillOpacity: selectedPoint && selectedPoint.id !== 'last-seen-pin' ? 0.05 : 0.14,
            stroke: dObj.strokeColor,
            strokeWeight: 1.8,
          }
        );
      } catch (err) {
        console.warn('[map] could not add district area:', dObj.name, err);
      }
    });

    // ── 1. Render Unified Home Range / Conservation Zone Shape ──
    if (homeRangeShape) {
      try {
        const zData = homeRangeShape.zoneData;
        const fillColor = zData ? zData.fillColor : statusTheme.fill;
        const strokeColor = zData ? zData.strokeColor : statusTheme.stroke;

        map.addArea(homeRangeShape, {
          fill: fillColor,
          fillOpacity: selectedPoint && selectedPoint.id !== 'last-seen-pin' ? 0.08 : 0.20,
          stroke: strokeColor,
          strokeWeight: selectedPoint && selectedPoint.id !== 'last-seen-pin' ? 1.5 : 2.5,
        });
      } catch (err) {
        console.warn('[map] could not add home range area:', err);
      }
    }

    const latLngs = [];
    let lastPin = null;

    // ── 2. Render Field Sightings (Row 2+) if any exist ──
    displayedSightings.forEach((point) => {
      if (!point.coords) return;
      const pos = [point.coords.lat, point.coords.lng];
      latLngs.push(pos);

      const markerHtml = `
        <div title="Sighting #${escapeHtml(point.sightingNum)}: ${escapeHtml(point.location)}" style="width: 14px; height: 14px; border-radius: 50%; background: #059669; border: 2.5px solid #ffffff; box-shadow: 0 0 0 1.5px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.6); cursor: pointer; transition: transform 0.15s ease;"></div>
      `;

      const m = map.addMarker(pos, {
        html: markerHtml,
        height: 14,
        centered: true,
        popup: {
          badge: `Sighting #${point.sightingNum}`,
          date: point.date,
          title: point.location,
          lines: [
            point.author ? `Recorder: ${point.author}` : '',
            point.notes && point.notes !== '—' ? point.notes : '',
          ].filter(Boolean),
        },
        onClick: () => handleSelectPoint(point),
      });

      if (selectedPoint?.id === point.id) {
        lastPin = m;
      }
    });

    // ── 4. Map Viewport Fitting ──
    if (selectedPoint && lastPin) {
      map.setView([selectedPoint.coords.lat, selectedPoint.coords.lng], 12, { animate: true });
      lastPin.openPopup();
    } else if (homeRangeShape?.zoneData?.bbox) {
      map.fitBounds(homeRangeShape.zoneData.bbox, { padding: 40 });
    } else if (uniquePts.length === 1) {
      map.setView(uniquePts[0], 10, { animate: true });
    } else if (uniquePts.length > 1) {
      map.fitBounds(uniquePts, { padding: 45, maxZoom: selectedPoint ? 12 : 11 });
    }
  }, [displayedSightings, isMapLoaded, selectedPoint, homeRangeShape, statusTheme, anchorCoords, isDeceased, handleSelectPoint, handleViewHomeRange, tusker?.location, tusker?.livingStatus, tusker?.zone, tuskerZoneName, tuskerDistricts]);

  return (
    <div className="mt-8 bg-white border border-[#e2e8e0] rounded-[16px] overflow-hidden shadow-xs font-sans">
      {/* ── Top Bar ── */}
      <div className="p-4 sm:p-5 bg-[#fafaf8] border-b border-[#e8ece9] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3 sm:mb-3.5 flex-wrap">
            {/* WTS Conservation Zone Pill */}
            {homeRangeShape?.zoneData && (
              <span
                className="inline-flex items-center gap-1.5 text-[0.72rem] font-bold border px-2.5 py-0.5 rounded-full shadow-2xs"
                style={{
                  backgroundColor: `${homeRangeShape.zoneData.color}15`,
                  borderColor: `${homeRangeShape.zoneData.color}50`,
                  color: homeRangeShape.zoneData.strokeColor,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: homeRangeShape.zoneData.color }}
                />
                <span>{homeRangeShape.zoneData.name}</span>
              </span>
            )}

            {/* Administrative District Pill(s) */}
            {tuskerDistricts.map((dObj) => (
              <span
                key={dObj.name}
                className="inline-flex items-center gap-1.5 text-[0.72rem] font-bold border px-2.5 py-0.5 rounded-full shadow-2xs"
                style={{
                  backgroundColor: `${dObj.color}15`,
                  borderColor: `${dObj.color}50`,
                  color: dObj.strokeColor,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: dObj.color }}
                />
                <span>District: {dObj.name}</span>
              </span>
            ))}

            {/* Home Range Pill */}
            {tusker?.location && (
              <span className={`inline-flex items-center gap-1.5 text-[0.72rem] font-bold border px-2.5 py-0.5 rounded-full shadow-2xs ${statusTheme.pillBg}`}>
                <span className={`w-2 h-2 rounded-full ${statusTheme.dotBg} animate-pulse`} />
                <span>Home range: {tusker.location}</span>
              </span>
            )}

            {/* Last Seen / Final Spotted Location Pill */}
            {lastSeenPoint && (
              <span className={`inline-flex items-center gap-1.5 text-[0.72rem] font-bold border px-2.5 py-0.5 rounded-full shadow-2xs ${statusTheme.pillBg}`}>
                <span className={`w-2 h-2 rounded-full ${statusTheme.dotBg}`} />
                <span>{isDeceased ? 'Final Spotted' : 'Last Seen'}: {lastSeenPoint.name}</span>
              </span>
            )}

            {/* Field Sightings Pill */}
            {sightingPoints.length > 0 && (
              <span className="text-[0.72rem] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300/60 px-2.5 py-0.5 rounded-full">
                {sightingPoints.length} Field Sighting{sightingPoints.length === 1 ? '' : 's'} (Row 2+)
              </span>
            )}

            <span className="text-xs font-semibold text-[#777777]">
              {selectedPoint
                ? `1 of ${activeSightings.length} Field Sighting Focused`
                : homeRangeShape?.zoneData
                  ? 'WTS Conservation Zone Mapped'
                  : (isDeceased ? 'Historical Habitat Mapped' : 'Home Range Mapped')}
            </span>
          </div>

          <h3 className="font-sans text-[1.12rem] sm:text-[1.2rem] font-bold text-[#111111] m-0 mb-2 sm:mb-2.5 flex items-start sm:items-center gap-2.5 leading-snug">
            <Compass size={19} className="text-accent shrink-0 mt-0.5 sm:mt-0" />
            <span>
              {homeRangeShape?.zoneData
                ? `${tusker?.name || 'Tusker'}'s Conservation Landscape: ${homeRangeShape.zoneData.title}`
                : (isDeceased ? `${tusker?.name || 'Tusker'}'s Historical Habitat Map` : `${tusker?.name || 'Tusker'}'s Home Range & Habitat Map`)}
            </span>
          </h3>
          <p className="font-sans text-xs sm:text-[0.82rem] text-[#666666] m-0 mt-2 leading-[1.65]">
            {homeRangeShape?.zoneData
              ? `(The shaded boundary represents ${tusker?.name}'s assigned WTS Conservation Landscape: ${homeRangeShape.zoneData.name}, encompassing ${homeRangeShape.zoneData.districts}. Home range: ${tusker?.location || '—'}.)`
              : (isDeceased
                  ? `(Disclaimer: The shaded polygon outlines ${tusker?.name}'s ${statusTheme.disclaimerText} across ${tusker?.location || 'registered area'}.)`
                  : `(Disclaimer: The shaded polygon outlines ${tusker?.name}'s ${statusTheme.disclaimerText} across ${tusker?.location || 'registered area'}. ${sightingPoints.length > 0 ? 'Individual field sightings are plotted within.' : ''})`)}
          </p>
        </div>

        {/* ── View Full Range Button ── */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleViewHomeRange}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              !selectedPoint
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-xs cursor-default'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50/50 hover:text-emerald-900 shadow-2xs'
            }`}
            title="Display full conservation landscape on map"
          >
            <Eye size={14} className="text-emerald-600" />
            <span>{homeRangeShape?.zoneData ? 'View Full Zone' : 'View Home Range'}</span>
          </button>
        </div>
      </div>

      {/* ── Interactive Map View Container ── */}
      <div className="relative w-full h-[340px] sm:h-[480px] bg-[#0e1210] overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Active Sighting Detail Card Overlay */}
        {selectedPoint && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs bg-white/95 rounded-xl p-3.5 shadow-xl border border-black/10 z-[1000] animate-in fade-in">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[0.68rem] font-bold bg-[#e8f5ec] text-[#1f7a3d]">
                  {selectedPoint.badge}
                </span>
                <h4 className="font-sans text-sm font-bold text-[#111111] m-0 mt-1">
                  {selectedPoint.location}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {(onEditSighting || onEditTusker) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedPoint.type === 'sighting' && typeof onEditSighting === 'function') {
                        const mergedSighting = {
                          ...(selectedPoint.rawSighting || {}),
                          id: selectedPoint.rawSighting?.id || selectedPoint.id,
                          captureDate: selectedPoint.rawSighting?.captureDate || selectedPoint.date,
                          date: selectedPoint.date || selectedPoint.rawSighting?.captureDate,
                          author: selectedPoint.rawSighting?.author || selectedPoint.author,
                          location: selectedPoint.location || selectedPoint.rawSighting?.location,
                          imageUrl: selectedPoint.photo || selectedPoint.rawSighting?.imageUrl,
                          images: (selectedPoint.rawSighting?.images?.length
                            ? selectedPoint.rawSighting.images
                            : (selectedPoint.photo ? [selectedPoint.photo] : [])),
                          photo: selectedPoint.photo,
                          // keep the original stored note so every field is read back correctly
                          note: selectedPoint.rawSighting?.note || '',
                          notes: selectedPoint.notes && selectedPoint.notes !== '—' ? selectedPoint.notes : '',
                          healthCondition: selectedPoint.health !== '—' ? selectedPoint.health : (selectedPoint.rawSighting?.healthCondition || ''),
                          threatLevel: selectedPoint.threat !== '—' ? selectedPoint.threat : (selectedPoint.rawSighting?.threatLevel || ''),
                          coords: selectedPoint.coords || selectedPoint.rawSighting?.coords,
                        };
                        onEditSighting({
                          sighting: mergedSighting,
                          sightingNum: selectedPoint.sightingNum,
                          rowNum: selectedPoint.rowNum,
                        });
                      } else if (typeof onEditTusker === 'function') {
                        onEditTusker();
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-950 border border-emerald-300/80 rounded-lg transition-colors cursor-pointer shadow-2xs"
                    title={selectedPoint.type === 'sighting' ? 'Edit Sighting' : 'Edit Profile'}
                  >
                    <Edit size={12} className="text-emerald-600" />
                    <span>Edit</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleViewHomeRange}
                  className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-1 rounded-md hover:bg-black/5 transition-colors"
                  title="Close and view full overview"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="text-xs text-[#555555] flex flex-col gap-1 mb-2.5">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-accent" />
                <span>Date: {selectedPoint.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <UserCheck size={12} className="text-accent" />
                <span>Recorder: {selectedPoint.author}</span>
              </div>
              {selectedPoint.coords && (
                <div className="flex items-center gap-1.5 font-mono text-[0.72rem] text-[#888888]">
                  <MapPin size={11} className="text-accent" />
                  <span>{selectedPoint.coords.lat.toFixed(4)}, {selectedPoint.coords.lng.toFixed(4)}</span>
                </div>
              )}
            </div>

            {selectedPoint.notes && selectedPoint.notes !== '—' && (
              <p className="text-xs text-[#666666] m-0 mb-2 italic">
                {selectedPoint.notes}
              </p>
            )}

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
                      note: selectedPoint.notes && selectedPoint.notes !== '—' ? selectedPoint.notes : '',
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

      {/* ── Points Registry Strip below Map ── */}
      <div className="p-4 bg-[#fafaf8] border-t border-[#e8ece9]">
        <div className="text-xs font-bold text-[#666666] uppercase tracking-wider mb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="leading-snug">{homeRangeShape?.zoneData ? 'Conservation Landscape & Sightings Registry' : 'Home Range & Sightings Registry'}</span>
          {sightingPoints.length > 0 && (
            <span className="font-normal lowercase text-[#888888] text-[0.72rem] sm:text-xs">
              click any sighting to isolate &amp; focus
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {/* Main Conservation Zone / Range Pill */}
          {homeRangeShape?.zoneData ? (
            <div
              onClick={handleViewHomeRange}
              className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs cursor-pointer transition-all select-none shadow-xs"
              style={{
                backgroundColor: !selectedPoint ? `${homeRangeShape.zoneData.color}15` : '#ffffff',
                borderColor: !selectedPoint ? homeRangeShape.zoneData.color : '#e5e7eb',
                color: !selectedPoint ? homeRangeShape.zoneData.strokeColor : '#374151',
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-2xs"
                style={{ backgroundColor: homeRangeShape.zoneData.color }}
              >
                ●
              </div>
              <div>
                <div className="font-bold flex items-center gap-1">
                  <span>{homeRangeShape.zoneData.name}</span>
                </div>
                <div className="text-[11px] truncate max-w-[260px] opacity-80">
                  {homeRangeShape.zoneData.districts}
                </div>
              </div>
              <Check
                size={12}
                className={!selectedPoint ? 'text-current' : 'text-gray-400'}
              />
            </div>
          ) : tusker?.location ? (
            <div
              onClick={handleViewHomeRange}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                !selectedPoint
                  ? `${statusTheme.cardActive} shadow-xs`
                  : `${statusTheme.cardInactive} shadow-2xs`
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${statusTheme.dotBg} text-white shadow-2xs`}>
                ●
              </div>
              <div>
                <div className="font-bold flex items-center gap-1">
                  <span>{statusTheme.label}</span>
                </div>
                <div className={`text-[11px] truncate max-w-[240px] ${!selectedPoint ? statusTheme.subtextColor : 'text-[#666666]'}`}>
                  {tusker.location}
                </div>
              </div>
              <Check size={12} className={!selectedPoint ? statusTheme.checkColor : 'text-gray-400'} />
            </div>
          ) : null}

          {/* Sighting Points (Row 2+) */}
          {sightingPoints.map((point) => {
            const isSelected = selectedPoint?.id === point.id;
            const hasCoords = Boolean(point.coords);

            return (
              <div
                key={point.id}
                onClick={() => handleSelectPoint(point)}
                className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-400 ring-2 ring-emerald-300/40 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300 shadow-2xs'
                }`}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-emerald-600 text-white shadow-2xs">
                  S{point.sightingNum}
                </div>
                <div>
                  <div className="font-bold flex items-center gap-1">
                    <span>Sighting #{point.sightingNum}</span>
                  </div>
                  <div className={`text-[11px] truncate max-w-[140px] ${isSelected ? 'text-emerald-800 font-medium' : 'text-[#666666]'}`}>
                    {point.location} · {point.date}
                  </div>
                </div>
                {hasCoords ? (
                  <Check size={12} className={isSelected ? 'text-emerald-600' : 'text-gray-400'} />
                ) : (
                  <AlertCircle size={12} className="text-amber-500" title="Location coordinates pending" />
                )}
              </div>
            );
          })}

          {!tusker?.location && sightingPoints.length === 0 && (
            <div className="text-xs text-[#888888] italic px-2 py-1">
              No geographical location or sightings recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
