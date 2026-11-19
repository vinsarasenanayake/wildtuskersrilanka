import { supabase, MEDIA_BUCKET } from '../lib/supabaseClient';
import { compressImage } from './imageCompress';

/* ==============================================================
   PHOTO UPLOADS (Supabase Storage, `wts-media` bucket)
   Every photo is shrunk in the browser and saved twice:
     • web copy  → web/<folder>/<year>/<id>.webp   max 1920 px (~200–400 KB)
     • thumbnail → thumb/<folder>/<year>/<id>.webp max 480 px  (~10–50 KB)
   The thumbnail has the same name under /thumb/ — see thumbUrl().
============================================================== */

const EXT_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/heic': 'heic',
};

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
    contentType: blob.type || 'image/jpeg',
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
  const name = `${safeFolder}/${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${ext}`;

  await put(`web/${name}`, web);
  try {
    await put(`thumb/${name}`, thumb);
  } catch {
    // Thumbnail is optional — pages fall back gracefully if it's missing
  }
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(`web/${name}`).data.publicUrl;
}
