/* ── Area outlines for the Tusker Map ─────────────────────────────────
   Turns an area name ("Yala", "Kala Wewa", "Habarana") into a shape:
     • a real boundary polygon (national park, sanctuary, forest, tank)
       from OpenStreetMap (Nominatim), or
     • a ~4 km circle around the place when no boundary exists.
   Results are cached in the browser for 30 days, and lookups are spaced
   1.1 s apart to respect Nominatim's free-use policy. */
import { getLocationCoordinates } from './sriLankaLocations';
import polygonClipping from './vendor/polygonClipping';
import SRI_LANKA_LAND from '../data/sriLankaLand.json';
import { townCentrePolygons, habitatFor, ELEPHANT_RANGE_COORDS } from './habitat';
import { hasParkBoundary, loadParkBoundaries, parkBoundaryFor } from './parkBoundaries';

const CACHE_PREFIX = 'wts_area_v9_';
const CACHE_DAYS = 30;
const CIRCLE_RADIUS_M = 4000;

/** A ~4 km circle around a place, cut to Sri Lanka's coastline so it never
 *  covers the sea or coastal lagoons (inland tanks and rivers stay inside),
 *  with busy town centres cut out. */
function landCircle(key, name, center, extra = {}) {
  const ring = [];
  const lat = Number(center.lat), lng = Number(center.lng);
  const dLat = CIRCLE_RADIUS_M / 111000;
  const dLng = dLat / Math.cos((lat * Math.PI) / 180);
  for (let i = 0; i < 48; i++) {
    const t = (i * 2 * Math.PI) / 48;
    ring.push([lng + Math.cos(t) * dLng, lat + Math.sin(t) * dLat]);
  }
  ring.push(ring[0]);
  let pieces = [];
  try {
    const onLand = polygonClipping.intersection([ring], SRI_LANKA_LAND.coordinates);
    const inRange = onLand.length ? polygonClipping.intersection(onLand, ELEPHANT_RANGE_COORDS) : [];
    const base = inRange.length ? inRange : onLand;
    pieces = base.length ? polygonClipping.difference(base, ...townCentrePolygons()) : [];
  } catch { /* keep the plain circle */ }
  if (!pieces.length) {
    return { kind: 'circle', id: `circle:${key}`, name, center, radius: CIRCLE_RADIUS_M, label: center, ...extra };
  }
  return {
    kind: 'polygon',
    id: `circle:${key}`,
    name,
    geojson: pieces.length === 1 ? { type: 'Polygon', coordinates: pieces[0] } : { type: 'MultiPolygon', coordinates: pieces },
    label: center,
    ...extra,
  };
}

export function cleanAreaName(raw) {
  return String(raw || '')
    .split(/\s*[/]\s*/)[0]
    .replace(/\(.*?\)/g, '')
    .replace(/\s*[-–]\s*block\s*\d+.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function areaKey(name) {
  const k = cleanAreaName(name).toLowerCase()
    .replace(/\b(national park|nature reserve|sanctuary|np)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (k === 'kakirawa') return 'kekirawa';
  return k;
}

function readCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return undefined;
    const { t, v } = JSON.parse(raw);
    if (Date.now() - t > CACHE_DAYS * 86400000) return undefined;
    return v;
  } catch {
    return undefined;
  }
}

function writeCache(key, value) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ t: Date.now(), v: value }));
  } catch { /* storage full: ignore */ }
}

// Higher = better match for a wildlife area
function score(r) {
  const cat = `${r.category}/${r.type}`;
  const n = (r.name || '').toLowerCase();
  if (cat === 'boundary/national_park') return 100;
  if (cat === 'boundary/protected_area' || cat === 'leisure/nature_reserve') return 90;
  if ((cat === 'natural/wood' || cat === 'landuse/forest') && /park|sanctuary|reserve|forest/.test(n)) return 80;
  if (cat === 'water/reservoir' || cat === 'natural/water' || cat === 'water/lake') return 70;
  return 0;
}

let queue = Promise.resolve();
function nominatim(query) {
  // Serialise requests: at most one per 1.1 s
  const run = queue.then(async () => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${query}, Sri Lanka`)}` +
      '&countrycodes=lk&format=jsonv2&polygon_geojson=1&polygon_threshold=0.003&limit=6';
    try {
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      return res.ok ? await res.json() : [];
    } catch {
      return [];
    } finally {
      await new Promise((r) => setTimeout(r, 1100));
    }
  });
  queue = run.catch(() => {});
  return run;
}

function pickPolygon(results, base) {
  const first = base.toLowerCase().split(' ')[0];
  const ok = (results || [])
    .filter((r) => r.geojson && /Polygon/.test(r.geojson.type) && score(r) > 0)
    .filter((r) => (r.name || '').toLowerCase().includes(first))
    .sort((a, b) => score(b) - score(a));
  if (!ok.length) return null;
  const best = ok[0];
  return {
    kind: 'polygon',
    id: `${best.osm_type}:${best.osm_id}`,
    name: best.name,
    geojson: best.geojson,
    label: { lat: Number(best.lat), lng: Number(best.lon) },
  };
}

function pickPoint(results) {
  const p = (results || []).find((r) => r.lat && r.lon);
  return p ? { lat: Number(p.lat), lng: Number(p.lon) } : null;
}

/** Resolves an area name to a shape. Never throws; returns null if nothing is found. */
export async function resolveAreaShape(rawName) {
  // District towns (e.g. Trincomalee) are drawn as the wildlife area next to them
  const base = habitatFor(cleanAreaName(rawName));
  if (!base) return null;
  const key = areaKey(base);
  const cached = readCache(key);
  if (cached !== undefined) return cached;

  // Trusted local database first (instant and verified in Sri Lanka)
  const knownCenter = getLocationCoordinates(base) || (key === 'kekirawa' ? getLocationCoordinates('Kekirawa') : null);

  // Parks, sanctuaries and Yala blocks: their real boundaries
  if (hasParkBoundary(base)) {
    const boundaries = await loadParkBoundaries();
    const polys = boundaries ? parkBoundaryFor(base, boundaries) : null;
    if (polys) {
      let pieces = [];
      try {
        const onLand = polygonClipping.intersection(polys, SRI_LANKA_LAND.coordinates);
        pieces = onLand.length ? polygonClipping.difference(onLand, ...townCentrePolygons()) : [];
      } catch { /* fall through */ }
      if (pieces.length) {
        const shape = {
          kind: 'polygon',
          id: `park:${key}`,
          name: base,
          geojson: pieces.length === 1 ? { type: 'Polygon', coordinates: pieces[0] } : { type: 'MultiPolygon', coordinates: pieces },
          label: knownCenter || { lat: pieces[0][0][0][1], lng: pieces[0][0][0][0] },
        };
        writeCache(key, shape);
        return shape;
      }
    }
  }

  // If we already have a trusted Sri Lankan coordinate from our database, use it directly!
  if (knownCenter) {
    const shape = landCircle(key, base, knownCenter);
    writeCache(key, shape);
    return shape;
  }

  const hasType = /national park|sanctuary|reserve|wewa|tank|forest/i.test(base);
  const queries = hasType ? [base] : [`${base} National Park`, base, `${base} Sanctuary`];

  let point = null;
  for (const q of queries) {
    const results = await nominatim(q);
    const poly = pickPolygon(results, base);
    if (poly) { writeCache(key, poly); return poly; }
    if (!point) point = pickPoint(results);
  }

  const center = knownCenter || point;
  const shape = center ? landCircle(key, base, center) : null;
  writeCache(key, shape);
  return shape;
}

/** Quick shape from the built-in location list (no network). */
export function instantAreaShape(rawName) {
  // District towns (e.g. Trincomalee) are drawn as the wildlife area next to them
  const base = habitatFor(cleanAreaName(rawName));
  if (!base) return null;
  const key = areaKey(base);
  const cached = readCache(key);
  if (cached) return cached;
  const center = getLocationCoordinates(base) || (key === 'kekirawa' ? getLocationCoordinates('Kekirawa') : null);
  return center ? landCircle(key, base, center, { provisional: true }) : null;
}

/** [[lat, lng], …] covering a shape, for fitting the map view. */
export function shapeBoundsPoints(shape) {
  if (!shape) return [];
  if (shape.kind === 'circle') {
    const d = shape.radius / 111000;
    return [[shape.center.lat - d, shape.center.lng - d], [shape.center.lat + d, shape.center.lng + d]];
  }
  const pts = [];
  const walk = (c) => {
    if (typeof c[0] === 'number') pts.push([c[1], c[0]]);
    else c.forEach(walk);
  };
  walk(shape.geojson.coordinates);
  return pts;
}
