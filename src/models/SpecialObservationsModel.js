/**
 * @file SpecialObservationsModel.js
 * @description Data access model for annual special observations in Supabase PostgreSQL.
 * Provides transparent metadata serialization for observation time and instant caching.
 */

import { supabase, fromRow, toRow, unwrap } from '../lib/supabaseClient';
import { uploadMediaFile } from '../utils/storageUpload';

/* ==============================================================
   SECTION 1: TIME METADATA PARSER & SERIALIZER
============================================================== */
export function parseObservationMeta(rawDescription) {
  if (!rawDescription) return { description: '', time: '', hideDate: false };
  const metaMatch = String(rawDescription).match(/<!--WTS_OBS_META:([\s\S]*?)-->/);
  if (metaMatch) {
    try {
      const meta = JSON.parse(metaMatch[1]);
      const cleanDesc = rawDescription.replace(metaMatch[0], '').trim();
      return {
        description: cleanDesc,
        time: meta.time || '',
        hideDate: Boolean(meta.hideDate),
      };
    } catch (e) {
      console.warn('[SpecialObservationsModel] Failed to parse meta:', e);
    }
  }
  return { description: rawDescription, time: '', hideDate: false };
}

export function serializeObservationDescription(description, time, hideDate = false) {
  const cleanDesc = (description || '').trim();
  const meta = {};
  if (time && time.trim()) meta.time = time.trim();
  if (hideDate) meta.hideDate = true;
  if (Object.keys(meta).length > 0) {
    return `<!--WTS_OBS_META:${JSON.stringify(meta)}-->\n${cleanDesc}`;
  }
  return cleanDesc;
}

/* ==============================================================
   SECTION 2: INSTANT CACHING (0ms Page Loads)
============================================================== */
let observationsCache = null;
let observationsCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export function getCachedSpecialObservations() {
  const now = Date.now();
  if (observationsCache && Array.isArray(observationsCache) && observationsCache.length > 0 && (now - observationsCacheTime < CACHE_TTL_MS)) {
    return observationsCache;
  }
  try {
    const saved = sessionStorage.getItem('wts_observations_cache');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        observationsCache = parsed;
        observationsCacheTime = now;
        return observationsCache;
      }
    }
  } catch { /* ignore */ }
  return null;
}

export function invalidateObservationsCache() {
  observationsCache = null;
  observationsCacheTime = 0;
  try { sessionStorage.removeItem('wts_observations_cache'); } catch { /* ignore */ }
}

/* ==============================================================
   SECTION 3: ROW MAPPING
============================================================== */
const OBSERVATION_FIELDS = [
  'date', 'tuskerName', 'location', 'title', 'description', 'images', 'author',
];

function mapObservation(row) {
  const o = fromRow(row);
  o.images = o.images || [];
  const meta = parseObservationMeta(o.description);
  o.description = meta.description;
  o.time = meta.time || o.time || '';
  o.hideDate = Boolean(meta.hideDate || o.hideDate);
  return o;
}

/** Uploads data:/blob: images (R2 via uploadMediaFile); plain http(s) URLs pass through. */
async function uploadImages(images = []) {
  if (!images || images.length === 0) return [];
  const urls = await Promise.all(
    images.map(async (img) => {
      if (typeof img !== 'string' || /^https?:\/\//i.test(img)) return img;
      try {
        return await uploadMediaFile(img, 'observations');
      } catch (err) {
        console.error('[SpecialObservationsModel] Upload error:', err);
        return null;
      }
    })
  );
  return urls.filter(Boolean);
}

/* ==============================================================
   SECTION 4: SPECIAL OBSERVATIONS CRUD (async, Supabase)
============================================================== */
export async function getSpecialObservations(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = getCachedSpecialObservations();
    if (cached && cached.length > 0) return cached;
  }

  const rows = unwrap(
    await supabase.from('special_observations').select('*')
      .order('date', { ascending: false })
      .order('id', { ascending: false })
  );
  const result = rows.map(mapObservation);
  observationsCache = result;
  observationsCacheTime = Date.now();
  try {
    sessionStorage.setItem('wts_observations_cache', JSON.stringify(result));
  } catch { /* ignore */ }

  return result;
}

export async function getSpecialObservationById(id) {
  const row = unwrap(
    await supabase.from('special_observations').select('*').eq('id', Number(id)).maybeSingle()
  );
  return row ? mapObservation(row) : null;
}

export async function addSpecialObservation(entry) {
  const images = await uploadImages(entry.images || []);
  const finalDescription = serializeObservationDescription(entry.description, entry.time, entry.hideDate);
  const payload = { ...entry, description: finalDescription, images };
  const saved = unwrap(
    await supabase.from('special_observations')
      .insert(toRow(payload, OBSERVATION_FIELDS)).select().single()
  );
  invalidateObservationsCache();
  return mapObservation(saved);
}

export async function updateSpecialObservation(id, updated) {
  let images = updated.images;
  if (Array.isArray(images)) {
    images = await uploadImages(images);
  }
  const finalDescription = serializeObservationDescription(updated.description, updated.time, updated.hideDate);
  const payload = {
    ...updated,
    description: finalDescription,
    ...(images !== undefined && { images }),
  };
  const saved = unwrap(
    await supabase.from('special_observations')
      .update(toRow(payload, OBSERVATION_FIELDS)).eq('id', Number(id)).select().maybeSingle()
  );
  invalidateObservationsCache();
  return saved ? mapObservation(saved) : null;
}

export async function deleteSpecialObservation(id) {
  unwrap(await supabase.from('special_observations').delete().eq('id', Number(id)));
  invalidateObservationsCache();
  return true;
}
