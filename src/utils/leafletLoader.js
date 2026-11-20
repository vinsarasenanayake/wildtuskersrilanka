/* ── Leaflet Script & CSS Loader (Singleton) ────────────────────────── */
let leafletPromise = null;

export function loadLeaflet() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window unavailable'));
  if (window.L) return Promise.resolve(window.L);

  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    // 1. Inject Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // 2. Inject Leaflet JS
    const existing = document.getElementById('leaflet-js');
    if (existing) {
      if (window.L) {
        resolve(window.L);
      } else {
        existing.addEventListener('load', () => resolve(window.L));
        existing.addEventListener('error', (e) => reject(e));
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      if (window.L) {
        resolve(window.L);
      } else {
        reject(new Error('Leaflet script loaded but window.L is undefined'));
      }
    };
    script.onerror = (err) => {
      leafletPromise = null;
      reject(err);
    };
    document.head.appendChild(script);
  });

  return leafletPromise;
}
