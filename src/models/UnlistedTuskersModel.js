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
export async function getUnlistedTuskers() {
  const rows = unwrap(
    await supabase.from('unlisted_tuskers').select('*').order('created_at', { ascending: false })
  );
  return rows.map(mapUnlisted);
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
  return mapUnlisted(saved);
}

export async function updateUnlistedTusker(id, updated) {
  const row = toRow(updated, UNLISTED_FIELDS.filter(f => f !== 'id'));
  const saved = unwrap(
    await supabase.from('unlisted_tuskers').update(row).eq('id', id).select().maybeSingle()
  );
  return saved ? mapUnlisted(saved) : null;
}

export async function deleteUnlistedTusker(id) {
  unwrap(await supabase.from('unlisted_tuskers').delete().eq('id', id));
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
