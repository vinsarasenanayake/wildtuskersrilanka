/**
 * @file UnlistedTuskersModel.js
 * @description Data access model for unlisted tusker monitoring records in Supabase PostgreSQL.
 */

import { supabase, fromRow, toRow, unwrap } from '../lib/supabaseClient';

/* ==============================================================
   SECTION 1: ROW MAPPING
   Seed data now lives in supabase/seed.sql. This table is
   admin-only (enforced by Row Level Security).
============================================================== */
const UNLISTED_FIELDS = [
  'id', 'location', 'listedDate', 'recordedBy', 'description',
  'specialMarks', 'specialWounds', 'photos', 'earPhotos',
  'photographicComparison', 'earComparison',
];

function mapUnlisted(row) {
  const t = fromRow(row);
  t.photos = t.photos || [];
  t.earPhotos = t.earPhotos || [];
  if (!t.photographicComparison) delete t.photographicComparison;
  if (!t.earComparison) delete t.earComparison;
  return t;
}

/* ==============================================================
   SECTION 2: UNLISTED TUSKERS CRUD (async, Supabase)
============================================================== */

let unlistedCache = null;
let unlistedCacheTime = 0;
const UNLISTED_CACHE_TTL_MS = 5 * 60 * 1000;

export function getCachedUnlistedTuskers() {
  const now = Date.now();
  if (unlistedCache && (now - unlistedCacheTime < UNLISTED_CACHE_TTL_MS)) {
    return unlistedCache;
  }
  try {
    const raw = sessionStorage.getItem('wts_unlisted_tuskers');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        unlistedCache = parsed;
        unlistedCacheTime = now;
        return parsed;
      }
    }
  } catch {}
  return null;
}

export function invalidateUnlistedCache() {
  unlistedCache = null;
  unlistedCacheTime = 0;
  try {
    sessionStorage.removeItem('wts_unlisted_tuskers');
  } catch {}
}

export async function getUnlistedTuskers() {
  const cached = getCachedUnlistedTuskers();
  if (cached) {
    // Background refresh
    supabase.from('unlisted_tuskers').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          const mapped = data.map(mapUnlisted);
          unlistedCache = mapped;
          unlistedCacheTime = Date.now();
          try {
            sessionStorage.setItem('wts_unlisted_tuskers', JSON.stringify(mapped));
          } catch {}
        }
      })
      .catch(() => {});
    return cached;
  }

  const rows = unwrap(
    await supabase.from('unlisted_tuskers').select('*').order('created_at', { ascending: false })
  );
  const result = rows.map(mapUnlisted);
  unlistedCache = result;
  unlistedCacheTime = Date.now();
  try {
    sessionStorage.setItem('wts_unlisted_tuskers', JSON.stringify(result));
  } catch {}
  return result;
}

/** Next free "UNLISTED 0NN" id, based on the highest existing number. */
async function nextUnlistedId() {
  const rows = unwrap(await supabase.from('unlisted_tuskers').select('id'));
  const max = rows.reduce((m, { id }) => {
    const n = parseInt(String(id).replace(/\D+/g, ''), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `UNLISTED ${String(max + 1).padStart(3, '0')}`;
}

export async function addUnlistedTusker(entry) {
  const id = entry.id?.trim() || await nextUnlistedId();
  const row = toRow({ ...entry, id }, UNLISTED_FIELDS);
  const saved = unwrap(await supabase.from('unlisted_tuskers').insert(row).select().single());
  invalidateUnlistedCache();
  return mapUnlisted(saved);
}

export async function updateUnlistedTusker(id, updated) {
  const row = toRow(updated, UNLISTED_FIELDS.filter(f => f !== 'id'));
  const saved = unwrap(
    await supabase.from('unlisted_tuskers').update(row).eq('id', id).select().maybeSingle()
  );
  invalidateUnlistedCache();
  return saved ? mapUnlisted(saved) : null;
}

export async function deleteUnlistedTusker(id) {
  unwrap(await supabase.from('unlisted_tuskers').delete().eq('id', id));
  invalidateUnlistedCache();
  return true;
}

/** Accepts URL forms like "unlisted-001" as well as "UNLISTED 001". */
export async function getUnlistedTuskerById(id) {
  if (!id) return null;
  const clean = decodeURIComponent(id).trim().replace(/[-_]+/g, ' ')
    .replace(/[%\\]/g, '\\$&'); // escape LIKE wildcards
  const row = unwrap(
    await supabase.from('unlisted_tuskers').select('*').ilike('id', clean).maybeSingle()
  );
  return row ? mapUnlisted(row) : null;
}
