/**
 * @file storageUpload.js
 * @description Supabase Storage (wts-media bucket) upload utility.
 * Compresses images client-side into responsive WebP web and thumbnail variants.
 */

import { supabase, MEDIA_BUCKET } from '../lib/supabaseClient';
import { compressImage } from './imageCompress';

/* ==============================================================
   PHOTO UPLOADS (Supabase Storage, `wts-media` bucket)
   Every photo is shrunk in the browser and saved twice:
     • web copy  → web/<folder>/<year>/<id>.webp   max 1920 px (~200–400 KB)
     • thumbnail → thumb/<folder>/<year>/<id>.webp max 480 px  (~10–50 KB)
   The thumbnail has the same name under /thumb/ - see thumbUrl().
============================================================== */

const EXT_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/heic': 'heic',
};

function generateUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      /* fallback */
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function normalizeMimeType(type) {
  if (!type) return 'image/jpeg';
  const lower = String(type).toLowerCase();
  if (lower === 'image/jpg') return 'image/jpeg';
  if (lower === 'image/heif') return 'image/heic';
  return lower;
}

/** Thumbnail URL for a web-copy URL; any other URL is returned unchanged. */
export function thumbUrl(url) {
  if (typeof url !== 'string') return url;
  return url.includes('/web/') ? url.replace('/web/', '/thumb/') : url;
}

async function toBlob(fileOrDataUrl) {
  if (fileOrDataUrl instanceof Blob) return fileOrDataUrl;   // File is a Blob too
  const res = await fetch(fileOrDataUrl);                     // data: or blob: URL
  return res.blob();
}

async function put(path, blob) {
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, {
    contentType: normalizeMimeType(blob.type),
    cacheControl: '31536000',   // unique names → browsers can cache for a year
    upsert: false,
  });
  if (error) {
    console.error('[storageUpload] Failed to upload to Supabase storage:', error);
    throw error;
  }
}

/**
 * Upload a File, Blob, or data:/blob: URL. Returns the public web-copy URL.
 * Remote http(s) URLs are returned unchanged.
 *
 * @param {File|Blob|string} fileOrDataUrl
 * @param {string} folder - e.g. 'tuskers', 'unlisted', 'sightings', 'team', 'gallery', 'fieldnotes'
 */
export async function uploadMediaFile(fileOrDataUrl, folder = 'uploads') {
  if (!fileOrDataUrl) return '';
  if (typeof fileOrDataUrl === 'string' && /^https?:\/\//i.test(fileOrDataUrl)) return fileOrDataUrl;

  const original = await toBlob(fileOrDataUrl);
  const web = await compressImage(original);
  const thumb = await compressImage(original, { maxEdge: 480, quality: 0.75 });

  const safeFolder = String(folder).toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 40) || 'uploads';
  const ext = EXT_BY_TYPE[web.type] || 'jpg';
  const name = `${safeFolder}/${new Date().getUTCFullYear()}/${generateUuid()}.${ext}`;

  await put(`web/${name}`, web);
  try {
    await put(`thumb/${name}`, thumb);
  } catch {
    // Thumbnail is optional - pages fall back gracefully if it's missing
  }
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(`web/${name}`).data.publicUrl;
}

/**
 * Upload an uncompressed document or presentation file (PPTX, DOCX, PDF, etc.)
 * directly to Supabase Storage wts-media bucket under docs/<folder>/<year>/<filename>.
 *
 * @param {File|Blob|string} fileOrUrl
 * @param {string} folder - e.g. 'identifications', 'presentations'
 * @returns {Promise<{ url: string, name: string, size: number, type: string }>}
 */
export async function uploadDocumentFile(fileOrUrl, folder = 'identifications') {
  if (!fileOrUrl) return null;
  if (typeof fileOrUrl === 'string' && /^https?:\/\//i.test(fileOrUrl)) {
    const fileName = fileOrUrl.split('/').pop() || 'document';
    const ext = fileName.split('.').pop().toLowerCase();
    return { url: fileOrUrl, name: fileName, size: 0, type: ext };
  }

  const safeFolder = String(folder).toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 40) || 'identifications';
  const originalName = fileOrUrl.name || 'presentation_document';
  const parts = originalName.split('.');
  const ext = (parts.length > 1 ? parts.pop() : 'bin').toLowerCase();
  const rawBaseName = parts.join('.').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50) || 'file';
  const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Date.now();
  const path = `docs/${safeFolder}/${new Date().getUTCFullYear()}/${Date.now()}_${uniqueId}_${rawBaseName}.${ext}`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, fileOrUrl, {
    contentType: fileOrUrl.type || 'application/octet-stream',
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) {
    console.error('[storageUpload] Failed to upload document file:', error);
    throw error;
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return {
    url: data.publicUrl,
    name: originalName,
    size: fileOrUrl.size || 0,
    type: ext,
  };
}
