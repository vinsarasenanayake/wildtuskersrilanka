/**
 * @file FieldNotesModel.js
 * @description Data access model for field notes in Supabase PostgreSQL.
 * Enforces column privileges, public view projections, and media file uploads.
 */

import { supabase, fromRow, unwrap } from '../lib/supabaseClient';
import { uploadMediaFile } from '../utils/storageUpload';

/* ==============================================================
   SECTION 1: ROW MAPPING
   Seed data now lives in supabase/seed.sql.
   Visitors can't read `author_contact` (column privilege in the
   migration), so public queries list their columns explicitly.
============================================================== */
const PUBLIC_COLUMNS =
  'id, title, date, time, description, special_note, images, author, status, submitted_at, approved_at';

function mapNote(row) {
  const n = fromRow(row);
  n.images = n.images || [];
  return n;
}

/* ==============================================================
   SECTION 2: IMAGE UPLOADS (Supabase Storage)
============================================================== */
/** Uploads data:/blob: images (R2 via uploadMediaFile); plain http(s) URLs pass through. */
async function uploadImages(images = []) {
  return Promise.all(images.map(img =>
    typeof img !== 'string' || /^https?:\/\//i.test(img) ? img : uploadMediaFile(img, 'fieldnotes')
  ));
}

/* ==============================================================
   SECTION 3: FIELD NOTES CRUD (async, Supabase)
============================================================== */

let fieldNotesCache = null;
let fieldNotesCacheAdmin = false;
let fieldNotesCacheTime = 0;
const FIELD_NOTES_CACHE_TTL_MS = 5 * 60 * 1000;

export function getCachedFieldNotes(admin = false) {
  const now = Date.now();
  if (fieldNotesCache && fieldNotesCacheAdmin === admin && (now - fieldNotesCacheTime < FIELD_NOTES_CACHE_TTL_MS)) {
    return fieldNotesCache;
  }
  try {
    const raw = sessionStorage.getItem(admin ? 'wts_field_notes_admin' : 'wts_field_notes_public');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        fieldNotesCache = parsed;
        fieldNotesCacheAdmin = admin;
        fieldNotesCacheTime = now;
        return parsed;
      }
    }
  } catch {}
  return null;
}

export function invalidateFieldNotesCache() {
  fieldNotesCache = null;
  fieldNotesCacheTime = 0;
  try {
    sessionStorage.removeItem('wts_field_notes_admin');
    sessionStorage.removeItem('wts_field_notes_public');
  } catch {}
}

/**
 * Visitors get approved notes only (RLS); admins get everything,
 * including pending notes and contributor contact details.
 */
export async function getFieldNotes({ admin = false } = {}) {
  const cached = getCachedFieldNotes(admin);
  if (cached) {
    // Background refresh
    supabase.from('field_notes')
      .select(admin ? '*' : PUBLIC_COLUMNS)
      .order('date', { ascending: false })
      .order('id', { ascending: false })
      .then(({ data }) => {
        if (data) {
          const mapped = data.map(mapNote);
          fieldNotesCache = mapped;
          fieldNotesCacheAdmin = admin;
          fieldNotesCacheTime = Date.now();
          try {
            sessionStorage.setItem(admin ? 'wts_field_notes_admin' : 'wts_field_notes_public', JSON.stringify(mapped));
          } catch {}
        }
      })
      .catch(() => {});
    return cached;
  }

  const rows = unwrap(
    await supabase.from('field_notes')
      .select(admin ? '*' : PUBLIC_COLUMNS)
      .order('date', { ascending: false })
      .order('id', { ascending: false })
  );
  const result = rows.map(mapNote);
  fieldNotesCache = result;
  fieldNotesCacheAdmin = admin;
  fieldNotesCacheTime = Date.now();
  try {
    sessionStorage.setItem(admin ? 'wts_field_notes_admin' : 'wts_field_notes_public', JSON.stringify(result));
  } catch {}
  return result;
}

export async function getApprovedFieldNotes() {
  return (await getFieldNotes()).filter(note => note.status === 'approved');
}

export async function getPendingFieldNotes() {
  return (await getFieldNotes({ admin: true })).filter(note => note.status === 'pending');
}

/**
 * Visitors' notes are always inserted as 'pending' (enforced by RLS).
 * Only admins may publish directly as 'approved'.
 */
export async function addFieldNote(entry) {
  const status = entry.status === 'approved' ? 'approved' : 'pending';
  const images = await uploadImages(entry.images);
  const row = {
    title: entry.title,
    date: entry.date,
    time: entry.time || null,
    description: entry.description,
    special_note: entry.specialNote || null,
    images,
    author: entry.author,
    author_contact: entry.authorContact || null,
    status,
    approved_at: status === 'approved' ? new Date().toISOString() : null,
  };
  // No .select() here: visitors aren't allowed to read pending rows back.
  unwrap(await supabase.from('field_notes').insert(row));
  invalidateFieldNotesCache();
  return { ...entry, images, status };
}

export async function approveFieldNote(id) {
  const saved = unwrap(
    await supabase.from('field_notes')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', id).select().maybeSingle()
  );
  invalidateFieldNotesCache();
  return saved ? mapNote(saved) : null;
}

export async function rejectFieldNote(id) {
  unwrap(await supabase.from('field_notes').delete().eq('id', id));
  invalidateFieldNotesCache();
  return true;
}

export async function deleteFieldNote(id) {
  return rejectFieldNote(id);
}
