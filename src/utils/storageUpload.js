import { supabase, MEDIA_BUCKET } from '../lib/supabaseClient';
import { compressImage } from './imageCompress';

/* ==============================================================
   PHOTO UPLOADS
   Every photo is saved three ways:
     • original  → private R2 bucket (full quality, never shown on the site)
     • web copy  → public R2 bucket, max 1920 px (~200–400 KB)
     • thumbnail → public R2 bucket, max 480 px (~30–50 KB), same name
                   as the web copy under /thumb/ — see thumbUrl()
   Falls back to Supabase Storage (web copy only) if R2 isn't set up.
============================================================== */

const EXT_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/heic': 'heic',
};

/** Thumbnail URL for an R2 web-copy URL; any other URL is returned unchanged. */
export function thumbUrl(url) {
  if (typeof url !== 'string') return url;
  return url.includes('/web/') ? url.replace('/web/', '/thumb/') : url;
}

async function toBlob(fileOrDataUrl) {
  if (fileOrDataUrl instanceof Blob) return fileOrDataUrl;   // File is a Blob too
  const res = await fetch(fileOrDataUrl);                     // data: or blob: URL
  return res.blob();
}

async function putToR2({ url, contentType }, blob) {
  const res = await fetch(url, { method: 'PUT', body: blob, headers: { 'Content-Type': contentType } });
  if (!res.ok) throw new Error(`R2 upload failed (${res.status})`);
}

async function uploadToR2(original, web, thumb, folder) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  const res = await fetch('/api/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({
      folder,
      web: { type: web.type, size: web.size },
      thumb: { type: thumb.type, size: thumb.size },
      original: original.type?.startsWith('image/') ? { type: original.type, size: original.size } : undefined,
    }),
  });
  if (res.status === 503 || res.status === 404) return null;   // R2 not configured → fall back
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Upload not allowed (${res.status})`);

  const parts = { web, thumb, original };
  await Promise.all(json.uploads.map(u => putToR2(u, parts[u.part])));
  return json.publicUrl;
}

async function uploadToSupabase(web, folder) {
  const ext = EXT_BY_TYPE[web.type] || 'jpg';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, web, {
    contentType: web.type || 'image/jpeg',
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) {
    console.error('[storageUpload] Failed to upload to Supabase storage:', error);
    throw error;
  }
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
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

  let original;
  try {
    original = await toBlob(fileOrDataUrl);
  } catch (err) {
    console.error('[storageUpload] Could not read image:', err);
    throw err;
  }

  const safeFolder = String(folder).toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 40) || 'uploads';
  const web = await compressImage(original);
  const thumb = await compressImage(original, { maxEdge: 480, quality: 0.75 });

  const r2Url = await uploadToR2(original, web, thumb, safeFolder);
  return r2Url || uploadToSupabase(web, safeFolder);
}
