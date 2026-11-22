/**
 * @file parkBoundaries.js
 * @description Official boundary polygon loader and local cache for national parks,
 * nature reserves, and Yala blocks.
 */

import polygonClipping from './vendor/polygonClipping';

const CACHE_KEY = 'wts_parks_v1';
const CACHE_DAYS = 30;

// OSM ids of every boundary we use
const OSM = {
  yalaBlock1: 'R18221780',
  yalaBlock2: 'R18201283',
  yalaBlock3: 'R18201212',
  yalaBlock4: 'R18304575',
  yalaBlock5: 'R18304344',
  yalaStrict: 'R18200168',
  kataragama: 'R18213394',
  katagamuwa: 'R18213411',
  kumana: 'R18136442',
  kudumbigala: 'R18145225',
  lunugamvehera: 'R3419730',
  wilpattu: 'R15434166',
  udawalawe: 'R10550498',
  galOya: 'R18422607',
  lahugala: 'R18024825',
  wasgamuwa: 'R6315786',
  floodPlains: 'R8104388',
  somawathiya: 'R10608778',
  minneriya: 'R5683596',
  kaudulla: 'R9134268',
  bundala: 'R5407631',
  maduruOya: 'R8041112',
  buddhangala: 'R7333617',
  ritigala: 'W368463273',
  navalHeadworks: 'W437300824',
  mahakanadarawaForest: 'W1570406841',
};

const YALA_BLOCKS = ['yalaBlock1', 'yalaBlock2', 'yalaBlock3', 'yalaBlock4', 'yalaBlock5', 'yalaStrict'];

/* Place names (lower case) → the boundaries that make up that place.
   'yalaBlock6' is built from the eastern part of Lunugamvehera NP,
   where Yala Block 6 lies. */
const PLACE_PARTS = {
  'yala': YALA_BLOCKS,
  'yala national park': YALA_BLOCKS,
  'ruhuna national park': YALA_BLOCKS,
  'yala block 1': ['yalaBlock1'],
  'yala block 2': ['yalaBlock2'],
  'yala block 3': ['yalaBlock3'],
  'yala block 4': ['yalaBlock4'],
  'yala block 5': ['yalaBlock5'],
  'yala block 6': ['yalaBlock6'],
  'yala strict nature reserve': ['yalaStrict'],
  'situlpawwa': ['yalaBlock1'],
  'kataragama sanctuary': ['kataragama'],
  'katagamuwa': ['katagamuwa'],
  'katagamuwa sanctuary': ['katagamuwa'],
  'kumana': ['kumana'],
  'kumana national park': ['kumana'],
  'yala east': ['kumana'],
  'kudumbigala': ['kudumbigala'],
  'kudumbigala sanctuary': ['kudumbigala'],
  'lunugamvehera': ['lunugamvehera'],
  'lunugamvehera national park': ['lunugamvehera'],
  'wilpattu': ['wilpattu'],
  'wilpattu national park': ['wilpattu'],
  'udawalawe': ['udawalawe'],
  'udawalawe national park': ['udawalawe'],
  'gal oya': ['galOya'],
  'gal oya national park': ['galOya'],
  'lahugala': ['lahugala'],
  'lahugala kitulana national park': ['lahugala'],
  'wasgamuwa': ['wasgamuwa'],
  'wasgamuwa national park': ['wasgamuwa'],
  'flood plains national park': ['floodPlains'],
  'somawathiya': ['somawathiya'],
  'somawathiya national park': ['somawathiya'],
  'minneriya': ['minneriya'],
  'minneriya national park': ['minneriya'],
  'kaudulla': ['kaudulla'],
  'kaudulla national park': ['kaudulla'],
  'bundala': ['bundala'],
  'bundala national park': ['bundala'],
  'maduru oya': ['maduruOya'],
  'maduru oya national park': ['maduruOya'],
  'buddhangala': ['buddhangala'],
  'buddhangala sanctuary': ['buddhangala'],
  'ritigala': ['ritigala'],
  'naval headworks sanctuary': ['navalHeadworks'],
  'mahakanadarawa': ['mahakanadarawaForest'],
};

const norm = (name) => String(name || '').toLowerCase().replace(/\s+/g, ' ').trim();

/** True when this place has a real boundary (so it is never drawn as a circle). */
export function hasParkBoundary(name) {
  return Object.prototype.hasOwnProperty.call(PLACE_PARTS, norm(name));
}

/* ── Loading the boundaries ──────────────────────────────────────── */
let memory = null;      // { key: [[ring...]...] polygons } once loaded
let loading = null;

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw);
    if (Date.now() - t > CACHE_DAYS * 86400000) return null;
    return v;
  } catch { return null; }
}

function writeCache(v) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), v })); } catch { /* storage full */ }
}

const toPolys = (g) => (g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates]);
const round = (polys) => polys.map((p) => p.map((r) => r.map(([x, y]) => [Number(x.toFixed(4)), Number(y.toFixed(4))])));

/** Loads every boundary once (cached for 30 days). Resolves to the boundary map, or null if offline. */
export function loadParkBoundaries() {
  if (memory) return Promise.resolve(memory);
  const cached = readCache();
  if (cached) { memory = cached; return Promise.resolve(memory); }
  if (loading) return loading;

  const ids = Object.values(OSM).join(',');
  loading = fetch(`https://nominatim.openstreetmap.org/lookup?format=jsonv2&polygon_geojson=1&polygon_threshold=0.001&osm_ids=${ids}`, {
    headers: { 'Accept-Language': 'en' },
  })
    .then((res) => (res.ok ? res.json() : []))
    .then((rows) => {
      const byId = {};
      (rows || []).forEach((r) => {
        if (r.geojson && /Polygon/.test(r.geojson.type)) byId[`${r.osm_type[0].toUpperCase()}${r.osm_id}`] = round(toPolys(r.geojson));
      });
      const out = {};
      Object.entries(OSM).forEach(([key, id]) => { if (byId[id]) out[key] = byId[id]; });
      // Yala Block 6: the part of Lunugamvehera NP east of 81.19°E
      if (out.lunugamvehera) {
        try {
          const eastBox = [[[81.19, 6.30], [81.40, 6.30], [81.40, 6.70], [81.19, 6.70], [81.19, 6.30]]];
          const b6 = polygonClipping.intersection(out.lunugamvehera, eastBox);
          if (b6.length) out.yalaBlock6 = round(b6);
        } catch { /* skip block 6 */ }
      }
      if (Object.keys(out).length) { memory = out; writeCache(out); }
      return Object.keys(out).length ? out : null;
    })
    .catch(() => null)
    .finally(() => { loading = null; });
  return loading;
}

/** Boundary polygons for a place name (already loaded), or null. */
export function parkBoundaryFor(name, boundaries = memory) {
  const parts = PLACE_PARTS[norm(name)];
  if (!parts || !boundaries) return null;
  const polys = parts.flatMap((k) => boundaries[k] || []);
  if (!polys.length) return null;
  try {
    return polys.length > 1 ? polygonClipping.union(...polys.map((p) => [p])) : polys;
  } catch {
    return polys;
  }
}
