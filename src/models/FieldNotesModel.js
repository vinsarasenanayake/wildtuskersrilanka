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

/**
 * Visitors get approved notes only (RLS); admins get everything,
 * including pending notes and contributor contact details.
 */
export async function getFieldNotes({ admin = false } = {}) {
  const rows = unwrap(
    await supabase.from('field_notes')
      .select(admin ? '*' : PUBLIC_COLUMNS)
      .order('date', { ascending: false })
      .order('id', { ascending: false })
  );
  return rows.map(mapNote);
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
  return { ...entry, images, status };
}

export async function approveFieldNote(id) {
  const saved = unwrap(
    await supabase.from('field_notes')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', id).select().maybeSingle()
  );
  return saved ? mapNote(saved) : null;
}

export async function rejectFieldNote(id) {
  unwrap(await supabase.from('field_notes').delete().eq('id', id));
  return true;
}

export async function deleteFieldNote(id) {
  return rejectFieldNote(id);
}
