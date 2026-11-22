/**
 * @file leafletLoader.js
 * @description Dynamic on-demand code-splitting loader for the Leaflet mapping engine.
 */

let leafletPromise = null;

export function loadLeaflet() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window unavailable'));
  if (window.L) return Promise.resolve(window.L);
  if (!leafletPromise) {
    leafletPromise = Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')])
      .then(([mod]) => {
        const L = mod.default || mod;
        window.L = L;
        return L;
      })
      .catch((err) => {
        leafletPromise = null;
        throw err;
      });
  }
  return leafletPromise;
}
