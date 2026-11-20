/* ── Leaflet loader (bundled from npm, loaded on demand) ──────────────
   Leaflet ships inside our own build, so no third-party script CDN is
   involved. It is still code-split: the chunk only downloads the first
   time a map is shown. */
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
