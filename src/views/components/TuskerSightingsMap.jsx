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

const SRI_LANKA_CENTER = [7.8731, 80.7718];

/**
 * High-precision Sri Lanka coastline boundary coordinates (clockwise loop).
 * Used to clamp all tusker roaming areas to the land's edge so no habitat polygon
 * ever protrudes into the Indian Ocean or open sea.
 */
const SRI_LANKA_COASTLINE = [
  [5.924, 80.588], // Dondra Head
  [5.940, 80.620], // Gandara
  [5.960, 80.690], // Dikwella
  [6.024, 80.795], // Tangalle
  [6.050, 80.850], // Rekawa
  [6.090, 80.940], // Kalametiya
  [6.125, 81.121], // Hambantota
  [6.180, 81.250], // Bundala
  [6.216, 81.336], // Kirinda
  [6.262, 81.418], // Palatupana (Yala Block 1 beach)
  [6.335, 81.495], // Patanangala (Yala coast)
  [6.388, 81.545], // Menik Ganga mouth
  [6.425, 81.570], // Buthawa
  [6.495, 81.685], // Kumbukkan Oya mouth (Yala / Kumana border)
  [6.525, 81.715], // Kumana Villu beach
  [6.628, 81.785], // Okanda beach
  [6.755, 81.818], // Panama beach
  [6.845, 81.838], // Arugam Bay
  [6.875, 81.842], // Pottuvil
  [7.000, 81.870], // Komari
  [7.115, 81.850], // Thirukkovil
  [7.218, 81.850], // Akkaraipattu
  [7.350, 81.845], // Karaitivu
  [7.410, 81.830], // Kalmunai
  [7.530, 81.790], // Kaluvanchikudy
  [7.680, 81.730], // Kattankudy
  [7.715, 81.710], // Batticaloa
  [7.770, 81.610], // Eravur
  [7.890, 81.575], // Valachchenai
  [7.925, 81.565], // Pasikuda
  [8.010, 81.500], // Mankerni
  [8.130, 81.435], // Vakarai
  [8.255, 81.370], // Verugal
  [8.400, 81.350], // Ilankanthai
  [8.525, 81.315], // Foul Point
  [8.570, 81.245], // Trincomalee
  [8.600, 81.230], // Uppuveli
  [8.685, 81.195], // Nilaveli
  [8.815, 81.095], // Kuchchaveli
  [8.945, 80.995], // Pulmoddai
  [9.000, 80.930], // Kokkilai
  [9.110, 80.875], // Nayaru
  [9.180, 80.850], // Alampil
  [9.270, 80.815], // Mullaitivu
  [9.420, 80.680], // Chalai
  [9.500, 80.590], // Chundikkulam
  [9.650, 80.450], // Vadamarachchi
  [9.835, 80.240], // Point Pedro
  [9.825, 80.170], // Valvettithurai
  [9.815, 80.035], // Kankesanthurai
  [9.805, 79.980], // Keerimalai
  [9.740, 79.870], // Karainagar
  [9.680, 79.910], // Kayts
  [9.500, 80.200], // Pooneryn
  [9.240, 80.040], // Devil's Point
  [9.120, 80.030], // Illuppaikadavai
  [8.990, 80.000], // Vidattaltivu
  [8.980, 79.910], // Mannar causeway
  [8.810, 79.900], // Arippu
  [8.780, 79.900], // Silavathurai
  [8.580, 79.920], // Marichchukkaddi
  [8.530, 79.870], // Kudiramalai Point (Wilpattu)
  [8.320, 79.790], // Dutch Bay
  [8.240, 79.760], // Kalpitiya
  [8.160, 79.710], // Kandakuliya
  [7.980, 79.820], // Palavi
  [7.800, 79.810], // Mundel
  [7.575, 79.790], // Chilaw
  [7.410, 79.820], // Marawila
  [7.210, 79.840], // Negombo
  [6.927, 79.840], // Colombo
  [6.835, 79.860], // Mount Lavinia
  [6.715, 79.900], // Panadura
  [6.585, 79.960], // Kalutara
  [6.475, 79.980], // Beruwala
  [6.425, 79.995], // Bentota
  [6.275, 80.035], // Balapitiya
  [6.235, 80.050], // Ambalangoda
  [6.140, 80.100], // Hikkaduwa
  [6.027, 80.217], // Galle Fort
  [5.970, 80.425], // Weligama
  [5.945, 80.455], // Mirissa
  [5.945, 80.550], // Matara
  [5.924, 80.588], // Dondra Head
];

/**
 * Ray-casting point-in-polygon test against the Sri Lanka mainland landmass.
 * Returns true if point is on land, false if in the ocean / sea.
 */
function isPointOnLand(pt, polygon = SRI_LANKA_COASTLINE) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1];
    const yi = polygon[i][0];
    const xj = polygon[j][1];
    const yj = polygon[j][0];
    const intersect = ((yi > pt.lat) !== (yj > pt.lat))
        && (pt.lng < (xj - xi) * (pt.lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Finds intersection point between line segments p1-p2 and p3-p4.
 */
function segmentIntersection(p1, p2, p3, p4) {
  const d = (p4.lat - p3.lat) * (p2.lng - p1.lng) - (p4.lng - p3.lng) * (p2.lat - p1.lat);
  if (Math.abs(d) < 1e-9) return null;
  const ua = ((p4.lng - p3.lng) * (p1.lat - p3.lat) - (p4.lat - p3.lat) * (p1.lng - p3.lng)) / d;
  const ub = ((p2.lng - p1.lng) * (p1.lat - p3.lat) - (p2.lat - p1.lat) * (p1.lng - p3.lng)) / d;
  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    return {
      lat: p1.lat + ua * (p2.lat - p1.lat),
      lng: p1.lng + ua * (p2.lng - p1.lng),
    };
  }
  return null;
}

/**
 * Clamps a candidate coordinate to the Sri Lanka coastline if it points out to sea.
 * If the point is on land, it is returned untouched. If in the sea, it is restricted
 * to the exact beach/land edge with a tiny 0.5% buffer inland towards the anchor.
 */
function clampToCoast(anchor, pt) {
  if (isPointOnLand(pt, SRI_LANKA_COASTLINE)) return pt;
  for (let i = 0, j = SRI_LANKA_COASTLINE.length - 1; i < SRI_LANKA_COASTLINE.length; j = i++) {
    const c1 = { lat: SRI_LANKA_COASTLINE[j][0], lng: SRI_LANKA_COASTLINE[j][1] };
    const c2 = { lat: SRI_LANKA_COASTLINE[i][0], lng: SRI_LANKA_COASTLINE[i][1] };
    const hit = segmentIntersection(anchor, pt, c1, c2);
    if (hit) {
      return {
        lat: hit.lat + (anchor.lat - hit.lat) * 0.005,
        lng: hit.lng + (anchor.lng - hit.lng) * 0.005,
      };
    }
  }
  return anchor;
}

/**
 * 2D Cross product of OA and OB vectors (O = origin).
 * Returns > 0 for counter-clockwise turn, < 0 for clockwise, = 0 for collinear.
 */
function cross(o, a, b) {
  return (a.lng - o.lng) * (b.lat - o.lat) - (a.lat - o.lat) * (b.lng - o.lng);
}

/**
 * Computes 2D Convex Hull of an array of {lat, lng} points using Monotone Chain.
 * Returns points in counter-clockwise order.
 */
function computeConvexHull(points) {
  if (!points || points.length <= 2) return points || [];
  const sorted = [...points].sort((a, b) => a.lng - b.lng || a.lat - b.lat);
  const lower = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

/**
 * Generates a unified home range shape strictly restricted to land.
 * Samples radial buffer points around each anchor location and clamps any
 * ocean-bound points to the Sri Lanka coastline so the polygon edge hugs the beach
 * and never extends into the sea.
 * Buffer radius defaults to 10 km (~0.090° latitude).
 */
function createBufferedShape(anchorCoords, bufferKm = 10) {
  if (!anchorCoords || anchorCoords.length === 0) return null;

  const radialPoints = [];
  const numSamples = 24;
  const LAT_DEG_PER_KM = 1 / 111.0;

  anchorCoords.forEach((pt) => {
    // If the anchor is slightly offshore due to generalized coordinate input, clamp anchor to land
    const baseAnchor = isPointOnLand(pt, SRI_LANKA_COASTLINE)
      ? pt
      : clampToCoast({ lat: SRI_LANKA_CENTER[0], lng: SRI_LANKA_CENTER[1] }, pt);

    const LNG_DEG_PER_KM = 1 / (111.0 * Math.cos((baseAnchor.lat * Math.PI) / 180));

    for (let i = 0; i < numSamples; i++) {
      const theta = (i * 2 * Math.PI) / numSamples;
      const raw = {
        lat: baseAnchor.lat + Math.sin(theta) * bufferKm * LAT_DEG_PER_KM,
        lng: baseAnchor.lng + Math.cos(theta) * bufferKm * LNG_DEG_PER_KM,
      };
      // Strictly clamp any point heading into the sea to the coastline
      radialPoints.push(clampToCoast(baseAnchor, raw));
    }
  });

  const hull = computeConvexHull(radialPoints);
  const ring = hull.map((p) => [Number(p.lng.toFixed(5)), Number(p.lat.toFixed(5))]);
  if (ring.length > 0) ring.push([ring[0][0], ring[0][1]]); // Close polygon loop

  return {
    kind: 'polygon',
    geojson: {
      type: 'Polygon',
      coordinates: [ring],
    },
  };
}

// Helper to clean location tokens without stripping block numbers
function cleanToken(s) {
  return String(s || '').replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
}

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

  const isDeceased = tusker?.livingStatus === 'Deceased';
  const statusTheme = useMemo(() => getStatusTheme(tusker?.livingStatus), [tusker?.livingStatus]);

  // Asynchronously resolve coordinates for LOCATION corridor areas and sightings
  useEffect(() => {
    let isMounted = true;

    // 1. Resolve LOCATION field corridor areas
    if (tusker?.location) {
      const parts = String(tusker.location).split(/\s*[/]\s*/).map(cleanToken).filter(Boolean);
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

  // Assemble habitat anchors (from LOCATION field), Last Seen pin, and field sightings (Row 2+)
  const { anchorCoords, sightingPoints, homeRangeShape, lastSeenPoint } = useMemo(() => {
    if (!tusker) return { anchorCoords: [], sightingPoints: [], homeRangeShape: null, lastSeenPoint: null };

    // ── 1. Resolve LOCATION field corridor anchors into unified coordinates ──
    const rawLoc = String(tusker.location || '').trim();
    const anchors = [];
    if (rawLoc) {
      const parts = rawLoc.split(/\s*[/]\s*/).map(cleanToken).filter(Boolean);
      parts.forEach((part, idx) => {
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

    // ── 3. Build Unified Home Range Shape over LOCATION anchors ──
    const shape = createBufferedShape(anchors, 10);

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
      lastSeenCoords = getLocationCoordinates(lastSeenAreaName) || resolvedCoordsMap['last-seen'] || null;
      if (!lastSeenCoords && anchors.length > 0) {
        lastSeenCoords = anchors[0];
      }
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
  }, [tusker, resolvedCoordsMap, isDeceased]);

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

    const allPts = [];
    // Ensure the entire polygon perimeter is included so the full home range is always visible
    if (homeRangeShape?.geojson?.coordinates?.[0]?.length) {
      homeRangeShape.geojson.coordinates[0].forEach(([lng, lat]) => {
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
    if (!selectedPoint && homeRangeShape?.geojson?.coordinates?.[0]?.length) {
      // Include the entire home range polygon perimeter so the full habitat area is visible
      homeRangeShape.geojson.coordinates[0].forEach(([lng, lat]) => {
        allPts.push([lat, lng]);
      });
    } else {
      anchorCoords.forEach((c) => allPts.push([c.lat, c.lng]));
    }
    displayedSightings.forEach((p) => {
      if (p.coords) allPts.push([p.coords.lat, p.coords.lng]);
    });
    if (lastSeenPoint?.coords && (!selectedPoint || selectedPoint.id === 'last-seen-pin')) {
      allPts.push([lastSeenPoint.coords.lat, lastSeenPoint.coords.lng]);
    }

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

    // ── 1. Render Unified Home Range Shape (Red for Deceased, Green for Alive, Yellow for No Recent Records) ──
    if (homeRangeShape) {
      map.addArea(homeRangeShape, {
        fill: statusTheme.fill,
        fillOpacity: selectedPoint && selectedPoint.id !== 'last-seen-pin' ? 0.10 : 0.20,
        stroke: statusTheme.stroke,
        strokeWeight: selectedPoint && selectedPoint.id !== 'last-seen-pin' ? 1.5 : 2.2,
      });
    }

    const latLngs = [];
    let lastPin = null;

    // ── 2. Render Last Seen Location Pin (Exact Name marked) ──
    if (lastSeenPoint && (!selectedPoint || selectedPoint.id === 'last-seen-pin')) {
      const pos = [lastSeenPoint.coords.lat, lastSeenPoint.coords.lng];
      latLngs.push(pos);

      const markerHtml = `
        <div title="${escapeHtml(lastSeenPoint.name)}" style="width: 14px; height: 14px; border-radius: 50%; background: ${statusTheme.pinFill}; border: 2.5px solid #ffffff; box-shadow: 0 0 0 1.5px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.6); cursor: pointer; transition: transform 0.15s ease;"></div>
      `;

      const m = map.addMarker(pos, {
        html: markerHtml,
        height: 14,
        centered: true,
        popup: {
          badge: isDeceased ? 'Last Known Location' : 'Last Seen Location',
          date: lastSeenPoint.date || 'Registered baseline',
          title: lastSeenPoint.name,
          lines: [
            tusker?.location ? `Roaming Range: ${tusker.location}` : '',
            tusker?.livingStatus ? `Living Status: ${tusker.livingStatus}` : '',
          ].filter(Boolean),
        },
        onClick: () => handleSelectPoint(lastSeenPoint),
      });

      if (selectedPoint?.id === 'last-seen-pin') {
        lastPin = m;
      }
    }

    // ── 3. Render Field Sightings (Row 2+) if any exist ──
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
    } else if (uniquePts.length === 1) {
      map.setView(uniquePts[0], 10, { animate: true });
    } else if (uniquePts.length > 1) {
      map.fitBounds(uniquePts, { padding: 45, maxZoom: selectedPoint ? 12 : 11 });
    }
  }, [displayedSightings, isMapLoaded, selectedPoint, homeRangeShape, statusTheme, anchorCoords, lastSeenPoint, isDeceased, handleSelectPoint, tusker?.location, tusker?.livingStatus]);

  return (
    <div className="mt-8 bg-white border border-[#e2e8e0] rounded-[16px] overflow-hidden shadow-xs font-sans">
      {/* ── Top Bar ── */}
      <div className="p-4 sm:p-5 bg-[#fafaf8] border-b border-[#e8ece9] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {/* Roaming Area / Home Range Pill */}
            {tusker?.location && (
              <span className={`inline-flex items-center gap-1.5 text-[0.72rem] font-bold border px-2.5 py-0.5 rounded-full shadow-2xs ${statusTheme.pillBg}`}>
                <span className={`w-2 h-2 rounded-full ${statusTheme.dotBg} animate-pulse`} />
                <span>{statusTheme.label}: {tusker.location}</span>
              </span>
            )}

            {/* Last Seen / Last Known Location Pill */}
            {lastSeenPoint && (
              <span className={`inline-flex items-center gap-1.5 text-[0.72rem] font-bold border px-2.5 py-0.5 rounded-full shadow-2xs ${statusTheme.pillBg}`}>
                <span className={`w-2 h-2 rounded-full ${statusTheme.dotBg}`} />
                <span>{isDeceased ? 'Last Known' : 'Last Seen'}: {lastSeenPoint.name}</span>
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
                : (isDeceased ? 'Historical Habitat Mapped' : 'Home Range Mapped')}
            </span>
          </div>

          <h3 className="font-sans text-[1.15rem] font-bold text-[#111111] m-0 flex items-center gap-2">
            <Compass size={18} className="text-accent" />
            <span>{isDeceased ? `${tusker?.name || 'Tusker'}'s Historical Habitat Map` : `${tusker?.name || 'Tusker'}'s Home Range & Habitat Map`}</span>
          </h3>
          <p className="font-sans text-xs text-[#666666] m-0 mt-0.5">
            {isDeceased
              ? `(Disclaimer: The shaded polygon outlines ${tusker?.name}'s ${statusTheme.disclaimerText} across ${tusker?.location || 'registered area'}.)`
              : `(Disclaimer: The shaded polygon outlines ${tusker?.name}'s ${statusTheme.disclaimerText} across ${tusker?.location || 'registered area'}. ${sightingPoints.length > 0 ? 'Individual field sightings are plotted within.' : ''})`}
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
            title="Display full home range on map"
          >
            <Eye size={14} className="text-emerald-600" />
            <span>View Home Range</span>
          </button>
        </div>
      </div>

      {/* ── Interactive Map View Container ── */}
      <div className="relative w-full h-[400px] sm:h-[480px] bg-[#0e1210] overflow-hidden">
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
        <div className="text-xs font-bold text-[#666666] uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span>Home Range &amp; Sightings Registry</span>
          {sightingPoints.length > 0 && (
            <span className="font-normal lowercase text-[#888888]">
              click any sighting to isolate &amp; focus
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {/* Main Home Range Pill (As a Whole) */}
          {tusker?.location && (
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
          )}

          {/* Last Seen / Last Known Location Pin Card */}
          {lastSeenPoint && (
            <div
              onClick={() => handleSelectPoint(lastSeenPoint)}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                selectedPoint?.id === 'last-seen-pin'
                  ? `${statusTheme.cardActive} shadow-xs`
                  : `${statusTheme.cardInactive} shadow-2xs`
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${statusTheme.dotBg} text-white shadow-2xs`}>
                ●
              </div>
              <div>
                <div className="font-bold flex items-center gap-1">
                  <span>{isDeceased ? 'Last Known Location' : 'Last Seen Location'}</span>
                </div>
                <div className={`text-[11px] truncate max-w-[180px] ${selectedPoint?.id === 'last-seen-pin' ? statusTheme.subtextColor : 'text-[#666666]'}`}>
                  {lastSeenPoint.name}
                </div>
              </div>
              {selectedPoint?.id === 'last-seen-pin' ? (
                <Check size={12} className={statusTheme.checkColor} />
              ) : (
                <MapPin size={12} className="text-gray-400" />
              )}
            </div>
          )}

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
