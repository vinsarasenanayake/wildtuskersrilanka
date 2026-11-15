import { supabase, MEDIA_BUCKET } from '../lib/supabaseClient';

const EXT_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/heic': 'heic',
};

/**
 * Upload a File, Blob, or base64 data URL directly to Supabase Storage (wts-media bucket).
 * Returns the permanent public URL.
 *
 * @param {File|Blob|string} fileOrDataUrl
 * @param {string} folder - subfolder name, e.g. 'tuskers', 'unlisted', 'sightings', 'team'
 * @returns {Promise<string>} public URL
 */
export async function uploadMediaFile(fileOrDataUrl, folder = 'uploads') {
  if (!fileOrDataUrl) return '';

  // If already a remote https URL (and not a local blob: URL), return as-is
  if (
    typeof fileOrDataUrl === 'string' &&
    /^https?:\/\//i.test(fileOrDataUrl) &&
    !fileOrDataUrl.startsWith('blob:')
  ) {
    return fileOrDataUrl;
  }

  let blob;
  let fileExt = 'jpg';

  if (fileOrDataUrl instanceof File) {
    blob = fileOrDataUrl;
    const nameExt = fileOrDataUrl.name?.split('.').pop()?.toLowerCase();
    fileExt = nameExt || EXT_BY_TYPE[fileOrDataUrl.type] || 'jpg';
  } else if (fileOrDataUrl instanceof Blob) {
    blob = fileOrDataUrl;
    fileExt = EXT_BY_TYPE[blob.type] || 'jpg';
  } else if (typeof fileOrDataUrl === 'string') {
    // data: URL or blob: URL
    try {
      const res = await fetch(fileOrDataUrl);
      blob = await res.blob();
      fileExt = EXT_BY_TYPE[blob.type] || 'jpg';
    } catch (err) {
      console.error('[storageUpload] Could not convert string to blob:', err);
      return fileOrDataUrl;
    }
  }

  const cleanExt = fileExt.replace(/[^a-z0-9]/gi, '');
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${cleanExt || 'jpg'}`;
  const path = `${folder}/${fileName}`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, {
    contentType: blob.type || 'image/jpeg',
    upsert: false,
  });

  if (error) {
    console.error('[storageUpload] Failed to upload to Supabase storage:', error);
    throw error;
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

