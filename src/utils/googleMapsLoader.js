/* ── Google Maps Script Loader (Singleton) ────────────────────────── */
let googleMapsPromise = null;

export function loadGoogleMaps(apiKey) {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window unavailable'));
  if (window.google?.maps?.places) return Promise.resolve(window.google.maps);

  if (googleMapsPromise) return googleMapsPromise;

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return Promise.reject(new Error('No Google Maps API Key configured'));
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('google-maps-api-script');
    if (existing) {
      if (window.google?.maps?.places) {
        resolve(window.google.maps);
      } else {
        existing.addEventListener('load', () => resolve(window.google?.maps));
        existing.addEventListener('error', (e) => reject(e));
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-api-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps script loaded but window.google is undefined'));
      }
    };
    script.onerror = (err) => {
      googleMapsPromise = null;
      reject(err);
    };
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
