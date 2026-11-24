/**
 * @file GalleryModel.js
 * @description Data access model for community and archival gallery photos in Supabase PostgreSQL.
 */

import { supabase, fromRow, toRow } from '../lib/supabaseClient';
import { uploadMediaFile } from '../utils/storageUpload';
import { todayLocalISO } from '../utils/localDate';

/* ==============================================================
   SECTION 1: STARTER SEED PHOTOS (Fallback if table is empty)
============================================================== */
export const DEFAULT_GALLERY = [];

/* ==============================================================
   SECTION 2: IMAGE UPLOAD HELPER (Supabase Storage)
============================================================== */
async function uploadGalleryImage(img) {
  if (!img) return null;
  if (typeof img === 'string' && /^https?:\/\//i.test(img)) return img;
  try {
    return await uploadMediaFile(img, 'gallery');
  } catch (err) {
    console.error('[GalleryModel] Failed to upload image:', err);
    return null; // never store raw image data in the database
  }
}

/* ==============================================================
   SECTION 3: GALLERY CRUD OPERATIONS
============================================================== */
// Visitors may not read photographer contact details.
const PUBLIC_GALLERY_COLUMNS = 'id, image_url, title, tusker_name, location, date, photographer, status, submitted_at, approved_at';

let galleryCache = null;
let galleryCacheAdmin = false;
let galleryCacheTime = 0;
const GALLERY_CACHE_TTL_MS = 5 * 60 * 1000; // 5-minute memory cache

export function getCachedGalleryPhotos(admin = false) {
  const now = Date.now();
  if (galleryCache && (now - galleryCacheTime < GALLERY_CACHE_TTL_MS)) {
    if (!admin && galleryCacheAdmin) {
      return galleryCache.filter((p) => p.status === 'approved');
    }
    return galleryCache;
  }
  try {
    const key = `wts_gallery_photos_${admin ? 'admin' : 'pub'}`;
    const saved =
      sessionStorage.getItem(key) ||
      localStorage.getItem(key) ||
      sessionStorage.getItem('wts_gallery_photos_pub') ||
      localStorage.getItem('wts_gallery_photos_pub');
    if (saved) {
      const parsed = JSON.parse(saved);
      galleryCache = parsed;
      galleryCacheAdmin = admin;
      galleryCacheTime = now;
      if (!admin && parsed.some((p) => p.status !== 'approved')) {
        return parsed.filter((p) => p.status === 'approved');
      }
      return parsed;
    }
  } catch { /* ignore */ }
  return null;
}

export function invalidateGalleryCache() {
  galleryCache = null;
  galleryCacheTime = 0;
  try {
    sessionStorage.removeItem('wts_gallery_photos_admin');
    sessionStorage.removeItem('wts_gallery_photos_pub');
    localStorage.removeItem('wts_gallery_photos_admin');
    localStorage.removeItem('wts_gallery_photos_pub');
  } catch { /* ignore */ }
}

export async function getGalleryPhotos({ admin = false } = {}) {
  const cached = getCachedGalleryPhotos(admin);
  if (cached) return cached;

  try {
    let query = supabase
      .from('gallery_photos')
      .select(admin ? '*' : PUBLIC_GALLERY_COLUMNS)
      .order('date', { ascending: false })
      .order('id', { ascending: false });

    if (!admin) {
      query = query.eq('status', 'approved');
    }

    const { data, error } = await query;
    if (error) throw error;
    if (data && data.length > 0) {
      const mapped = data.map(fromRow).map((r) => ({
        ...r,
        photographer: (r.photographer === 'WTS Research Team' || r.photographer === 'WTS Team') ? 'WTS Admin' : (r.photographer || 'WTS Admin'),
      }));
      galleryCache = mapped;
      galleryCacheAdmin = admin;
      galleryCacheTime = Date.now();
      try {
        const key = `wts_gallery_photos_${admin ? 'admin' : 'pub'}`;
        sessionStorage.setItem(key, JSON.stringify(mapped));
        localStorage.setItem(key, JSON.stringify(mapped));
      } catch { /* ignore */ }
      return mapped;
    }
    return [];
  } catch (err) {
    console.warn('[GalleryModel] Could not fetch from Supabase:', err);
    return [];
  }
}

export async function submitGalleryPhoto(form) {
  const imageUrl = await uploadGalleryImage(form.image || form.imageUrl);
  if (!imageUrl) throw new Error('Please select or provide a photo.');

  const row = {
    image_url: imageUrl,
    title: form.title,
    tusker_name: form.tuskerName || null,
    location: form.location || null,
    date: form.date || todayLocalISO(),
    photographer: form.photographer,
    photographer_contact: form.photographerContact || null,
    status: 'pending',
  };

  const { error } = await supabase
    .from('gallery_photos')
    .insert(row);

  if (error) throw error;
  invalidateGalleryCache();
  return fromRow(row);
}

export async function approveGalleryPhoto(id) {
  const { data, error } = await supabase
    .from('gallery_photos')
    .update({ status: 'approved', approved_at: new Date().toISOString() })
    .eq('id', Number(id))
    .select()
    .single();

  if (error) throw error;
  invalidateGalleryCache();
  return fromRow(data);
}

export async function rejectGalleryPhoto(id) {
  const { data, error } = await supabase
    .from('gallery_photos')
    .update({ status: 'rejected' })
    .eq('id', Number(id))
    .select()
    .single();

  if (error) throw error;
  invalidateGalleryCache();
  return fromRow(data);
}

export async function deleteGalleryPhoto(id) {
  const { error } = await supabase
    .from('gallery_photos')
    .delete()
    .eq('id', Number(id));

  if (error) throw error;
  invalidateGalleryCache();
  return true;
}

export async function updateGalleryPhoto(id, updates) {
  const allowed = ['title', 'tuskerName', 'location', 'date', 'photographer', 'photographerContact', 'status'];
  const row = toRow(updates, allowed);

  const { data, error } = await supabase
    .from('gallery_photos')
    .update(row)
    .eq('id', Number(id))
    .select()
    .single();

  if (error) throw error;
  invalidateGalleryCache();
  return fromRow(data);
}


