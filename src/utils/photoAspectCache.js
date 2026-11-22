/**
 * @file photoAspectCache.js
 * @description Global in-memory aspect ratio cache mapping photo URLs to orientation (portrait vs landscape).
 */

// Global aspect ratio cache mapping photo URL -> boolean (true = portrait, false = landscape/square)
const aspectCache = new Map();

export function getCachedAspect(url) {
  if (!url) return null;
  return aspectCache.has(url) ? aspectCache.get(url) : null;
}

export function setCachedAspect(url, isPortrait) {
  if (!url) return;
  aspectCache.set(url, Boolean(isPortrait));
}

export function probeImageAspect(url, callback) {
  if (!url) return;

  if (aspectCache.has(url)) {
    if (callback) callback(aspectCache.get(url));
    return;
  }

  const img = new Image();
  img.src = url;

  if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
    const isPortrait = img.naturalHeight > img.naturalWidth;
    aspectCache.set(url, isPortrait);
    if (callback) callback(isPortrait);
    return;
  }

  img.onload = () => {
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      const isPortrait = img.naturalHeight > img.naturalWidth;
      aspectCache.set(url, isPortrait);
      if (callback) callback(isPortrait);
    }
  };
}

