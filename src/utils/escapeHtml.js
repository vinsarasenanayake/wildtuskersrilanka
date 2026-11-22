/**
 * @file escapeHtml.js
 * @description HTML character entity escaping utility preventing XSS injection in HTML string templates.
 */

/* Escapes text before it is put into HTML strings (e.g. Leaflet popups). */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
