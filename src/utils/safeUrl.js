/**
 * @file safeUrl.js
 * @description URL sanitizer preventing untrusted schemes from being rendered as actionable links.
 */

/* Returns the URL only if it is a normal web link (http/https); otherwise undefined.
   Stops links like "javascript:…" from ever being clickable. */
export function safeUrl(url) {
  if (!url || typeof url !== 'string') return undefined;
  try {
    const u = new URL(url.trim());
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : undefined;
  } catch {
    return undefined;
  }
}
