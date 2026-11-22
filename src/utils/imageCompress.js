/**
 * @file imageCompress.js
 * @description Client-side image resizing and WebP compression before uploading to storage.
 */

const MAX_EDGE = 1920;     // px — long edge; plenty for full-screen viewing
const QUALITY = 0.82;      // visually lossless for photos
const SKIP_TYPES = ['image/gif', 'image/svg+xml'];

function canvasToBlob(canvas, type, quality) {
  if (canvas.convertToBlob) return canvas.convertToBlob({ type, quality });
  return new Promise(resolve => canvas.toBlob(resolve, type, quality));
}

/**
 * Resize + re-encode an image Blob/File. Returns the original
 * unchanged if it can't be decoded (e.g. HEIC in most browsers),
 * is an animation/vector, or if compression wouldn't make it smaller.
 */
export async function compressImage(blob, { maxEdge = MAX_EDGE, quality = QUALITY } = {}) {
  if (!blob || !blob.type?.startsWith('image/') || SKIP_TYPES.includes(blob.type)) return blob;

  let bitmap;
  try {
    bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
  } catch {
    return blob; // browser can't decode it — upload as-is
  }

  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(width, height)
    : Object.assign(document.createElement('canvas'), { width, height });
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  // Prefer WebP; fall back to JPEG where the browser can't encode WebP (older Safari)
  let out = await canvasToBlob(canvas, 'image/webp', quality);
  if (!out || out.type !== 'image/webp') out = await canvasToBlob(canvas, 'image/jpeg', quality);

  return out && out.size < blob.size ? out : blob;
}
