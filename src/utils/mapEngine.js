/* ── Map engine ───────────────────────────────────────────────────────
   One small API used by every map on the site.

   • With VITE_GOOGLE_MAPS_API_KEY set  → real Google Maps (satellite +
     labels by default, Map/Satellite switch).
   • Without a key, or if Google refuses the key → Leaflet with free
     Esri satellite / street maps (see mapLayers.js).

   Usage:
     const map = await createMap(el, { center: [lat, lng], zoom: 8 });
     const pin = map.addMarker([lat, lng], { html, popup, onClick });
     map.onClick(({ lat, lng }) => …);
     map.destroy();
*/
import { loadLeaflet } from './leafletLoader';
import { addBaseLayers } from './mapLayers';

const GOOGLE_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
let googlePromise = null;

// If Google refuses the key (demo limit reached, key expired, billing off…)
// we remember it for a few hours and use the free maps instead.
const BROKEN_FLAG = 'wts_google_maps_failed_at';
const RETRY_AFTER_MS = 6 * 60 * 60 * 1000; // try Google again after 6 hours

function readBrokenFlag() {
  try {
    const t = Number(localStorage.getItem(BROKEN_FLAG) || 0);
    return t > 0 && Date.now() - t < RETRY_AFTER_MS;
  } catch {
    return false;
  }
}
let googleBroken = readBrokenFlag();

/** Switches the whole site to the free maps and reloads the page once. */
function markGoogleBroken(reason) {
  if (googleBroken) return;
  googleBroken = true;
  console.error(`[maps] Google Maps is not working (${reason}). Switching to the free maps.`);
  try {
    localStorage.setItem(BROKEN_FLAG, String(Date.now()));
    // Reload once so maps already on screen are redrawn with the free maps
    if (!sessionStorage.getItem('wts_maps_fallback_reloaded')) {
      sessionStorage.setItem('wts_maps_fallback_reloaded', '1');
      window.location.reload();
    }
  } catch { /* storage blocked: new maps will still use the free maps */ }
}

export function isGoogleMapsEnabled() {
  return Boolean(GOOGLE_KEY) && !googleBroken;
}

/* ── Google loader (one script tag for the whole app) ─────────────── */
export function loadGoogleMaps() {
  if (!isGoogleMapsEnabled()) return Promise.reject(new Error('Google Maps not configured'));
  if (window.google?.maps?.Map) return Promise.resolve(window.google.maps);
  if (googlePromise) return googlePromise;

  googlePromise = new Promise((resolve, reject) => {
    // Google calls this when the key is invalid, restricted or billing is off
    window.gm_authFailure = () => markGoogleBroken('key rejected');
    window.__wtsGoogleMapsReady = () => resolve(window.google.maps);

    const params = new URLSearchParams({
      key: GOOGLE_KEY,
      v: 'weekly',
      loading: 'async',
      libraries: 'places,geocoding',
      region: 'LK',
      language: 'en',
      callback: '__wtsGoogleMapsReady',
    });
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    script.async = true;
    script.onerror = () => {
      googlePromise = null;
      googleBroken = true; // this visit only (could be a network hiccup)
      reject(new Error('Google Maps script failed to load'));
    };
    document.head.appendChild(script);
  });
  return googlePromise;
}

/* ── Popup content (built from text, never raw HTML) ──────────────── */
function buildPopup({ badge, date, title, lines = [] } = {}) {
  const root = document.createElement('div');
  root.style.cssText =
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;min-width:180px;max-width:260px;line-height:1.4;padding:4px 2px;color:#f3f4f6;';

  if (badge || date) {
    const top = document.createElement('div');
    top.style.cssText =
      'display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:6px;flex-wrap:wrap;';
    if (badge) {
      const b = document.createElement('span');
      b.style.cssText =
        'background:rgba(198,155,85,0.18);color:#e5b869;border:1px solid rgba(198,155,85,0.45);font-weight:700;font-size:10px;padding:2px 7px;border-radius:6px;letter-spacing:0.5px;text-transform:uppercase;box-shadow:0 1px 3px rgba(0,0,0,0.3);';
      b.textContent = badge;
      top.appendChild(b);
    }
    if (date) {
      const d = document.createElement('span');
      d.style.cssText = 'font-size:10.5px;font-weight:600;color:#9ca3af;margin-left:auto;';
      d.textContent = date;
      top.appendChild(d);
    }
    root.appendChild(top);
  }

  if (title) {
    const t = document.createElement('div');
    t.style.cssText =
      'font-weight:700;font-size:13.5px;color:#ffffff;line-height:1.3;margin-bottom:4px;word-break:break-word;';
    t.textContent = title;
    root.appendChild(t);
  }

  lines.filter(Boolean).forEach((line) => {
    const l = document.createElement('div');
    const trimmed = String(line).trim();
    if (/^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(trimmed)) {
      l.style.cssText =
        'display:inline-flex;align-items:center;gap:4px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;font-weight:600;color:#a7f3d0;background:#13261c;padding:2px 7px;border-radius:5px;border:1px solid #1f422e;margin-top:4px;';
      l.textContent = `📍 ${trimmed}`;
    } else {
      l.style.cssText = 'font-size:11.5px;color:#d1d5db;margin-top:2px;line-height:1.35;';
      l.textContent = line;
    }
    root.appendChild(l);
  });

  return root;
}

/* ── Google implementation ────────────────────────────────────────── */
function createGoogleMap(maps, container, { center, zoom, gestureHandling, mapTypeId = 'hybrid' }) {
  const map = new maps.Map(container, {
    center: { lat: center[0], lng: center[1] },
    zoom,
    mapTypeId,
    tilt: 0,
    heading: 0,
    backgroundColor: '#0e1210',
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    rotateControl: false,
    panControl: false,
    scaleControl: false,
    keyboardShortcuts: false,
    clickableIcons: false,
    gestureHandling,
    isFractionalZoomEnabled: true, // smoother wheel/trackpad zoom where Google supports it
  });
  // Google draws a grey "can't load Google Maps correctly" box on errors
  // (quota reached, key problems). Spot it and switch to the free maps.
  // (Checked a few times after loading — watching every change slowed zooming.)
  const errorChecks = [1500, 5000, 12000].map((ms) =>
    setTimeout(() => {
      if (container.isConnected && container.querySelector('.gm-err-container, .gm-err-message')) {
        markGoogleBroken('error shown on map');
      }
    }, ms)
  );

  const info = new maps.InfoWindow();
  const markers = new Set();
  const areas = new Set();

  // All shaded polygons share one layer (one layer per area made zooming slow)
  let sharedData = null;
  const polygonLayer = () => {
    if (!sharedData) {
      sharedData = new maps.Data({ map });
      sharedData.setStyle((feature) => feature.getProperty('_style') || {});
      sharedData.addListener('click', (e) => {
        const cb = e.feature.getProperty('_onClick');
        if (typeof cb === 'function') cb();
      });
    }
    return sharedData;
  };

  // HTML pin drawn with an OverlayView (no Map ID needed)
  class HtmlMarker extends maps.OverlayView {
    constructor(pos, html, onClick, centered = false) {
      super();
      this.pos = new maps.LatLng(pos[0], pos[1]);
      this.el = document.createElement('div');
      this.anchor = centered ? '-50%' : '-100%';
      this.el.style.cssText = `position:absolute;left:0;top:0;transform:translate(-50%,${this.anchor});cursor:pointer;z-index:20;width:max-content;will-change:transform;`;
      this.el.innerHTML = html; // our own static SVG markup
      this.el.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick?.();
      });
      this.setMap(map);
    }
    onAdd() {
      const panes = this.getPanes();
      if (panes?.overlayMouseTarget) {
        panes.overlayMouseTarget.appendChild(this.el);
      }
    }
    draw() {
      const projection = this.getProjection();
      if (!projection) return;
      const p = projection.fromLatLngToDivPixel(this.pos);
      if (p) {
        this.el.style.transform = `translate(${Math.round(p.x)}px, ${Math.round(p.y)}px) translate(-50%, ${this.anchor})`;
      }
    }
    onRemove() {
      if (this.el.parentNode) {
        this.el.parentNode.removeChild(this.el);
      }
    }
    setPos(pos) {
      this.pos = new maps.LatLng(pos[0], pos[1]);
      this.draw();
    }
    setHtml(html) {
      this.el.innerHTML = html;
    }
  }

  const openPopupAt = (pos, popup, offsetY) => {
    info.setContent(buildPopup(popup));
    info.setOptions({ pixelOffset: new maps.Size(0, -offsetY) });
    info.setPosition({ lat: pos[0], lng: pos[1] });
    info.open({ map });
  };

  return {
    engine: 'google',
    setView(pos, z, { animate = true } = {}) {
      if (animate) { map.panTo({ lat: pos[0], lng: pos[1] }); map.setZoom(z); }
      else { map.setCenter({ lat: pos[0], lng: pos[1] }); map.setZoom(z); }
    },
    fitBounds(points, { padding = 50, maxZoom = 13 } = {}) {
      const validPoints = (points || []).filter(
        (p) => Array.isArray(p) && p.length >= 2 &&
               Number.isFinite(p[0]) && Number.isFinite(p[1]) &&
               p[0] >= 5.5 && p[0] <= 10.0 && p[1] >= 79.5 && p[1] <= 82.5
      );
      if (!validPoints.length) return;
      const b = new maps.LatLngBounds();
      validPoints.forEach((p) => b.extend({ lat: p[0], lng: p[1] }));
      map.fitBounds(b, padding);
      maps.event.addListenerOnce(map, 'idle', () => { if (map.getZoom() > maxZoom) map.setZoom(maxZoom); });
    },
    addMarker(pos, { html, popup, onClick, height = 42, centered = false } = {}) {
      let current = pos;
      let currentPopup = popup;
      const m = new HtmlMarker(pos, html, () => {
        if (currentPopup) openPopupAt(current, currentPopup, height);
        onClick?.();
      }, centered);
      markers.add(m);
      return {
        setPosition(p) { current = p; m.setPos(p); },
        setHtml(h) { m.setHtml(h); },
        openPopup(p) { if (p) currentPopup = p; if (currentPopup) openPopupAt(current, currentPopup, height); },
        remove() { m.setMap(null); markers.delete(m); },
      };
    },
    clearMarkers() { markers.forEach((m) => m.setMap(null)); markers.clear(); info.close(); },
    // Shaded area: shape = { kind: 'polygon', geojson } | { kind: 'circle', center, radius }
    addArea(shape, { fill = '#f59e0b', fillOpacity = 0.3, stroke = '#fbbf24', strokeWeight = 1.5, onClick } = {}) {
      let obj;
      if (shape.kind === 'circle') {
        obj = new maps.Circle({
          map, center: { lat: Number(shape.center.lat), lng: Number(shape.center.lng) }, radius: Number(shape.radius),
          fillColor: fill, fillOpacity, strokeColor: stroke, strokeWeight, strokeOpacity: 0.9, clickable: Boolean(onClick),
        });
        if (onClick) obj.addListener('click', onClick);
      } else {
        const features = polygonLayer().addGeoJson({
          type: 'Feature',
          geometry: shape.geojson,
          properties: {
            _style: { fillColor: fill, fillOpacity, strokeColor: stroke, strokeWeight, strokeOpacity: 0.9, clickable: Boolean(onClick) },
            _onClick: onClick || null,
          },
        });
        obj = { setMap: () => features.forEach((f) => sharedData && sharedData.remove(f)) };
      }
      areas.add(obj);
      return { remove() { obj.setMap(null); areas.delete(obj); } };
    },
    clearAreas() { areas.forEach((o) => o.setMap(null)); areas.clear(); },
    addPolyline(points, { stroke = '#c69b55', strokeWeight = 2.5 } = {}) {
      const line = new maps.Polyline({
        map,
        path: points.map(([lat, lng]) => ({ lat: Number(lat), lng: Number(lng) })),
        strokeColor: stroke,
        strokeWeight,
        strokeOpacity: 0.85,
      });
      areas.add(line);
      return { remove() { line.setMap(null); areas.delete(line); } };
    },
    onClick(cb) {
      map.addListener('click', (e) => { if (e.latLng) cb({ lat: e.latLng.lat(), lng: e.latLng.lng() }); });
    },
    resize() { maps.event.trigger(map, 'resize'); },
    destroy() { markers.forEach((m) => m.setMap(null)); markers.clear(); areas.forEach((o) => o.setMap(null)); areas.clear(); info.close(); errorChecks.forEach(clearTimeout); maps.event.clearInstanceListeners(map); container.remove(); },
  };
}

/* ── Leaflet implementation (free fallback) ───────────────────────── */
function createLeafletMap(L, container, { center, zoom, gestureHandling: _gestureHandling }) {
  if (container._leaflet_id) delete container._leaflet_id;
  const map = L.map(container, {
    center,
    zoom,
    zoomControl: true,
    attributionControl: false,
    preferCanvas: true, // Hardware-accelerated GPU canvas for vector polygons and paths
    zoomSnap: 0.5,      // Fluid zoom step increments
    zoomDelta: 0.5,      // Responsive zooming
    wheelPxPerZoomLevel: 55, // Responsive mouse wheel zooming
    wheelDebounceTime: 15,
    scrollWheelZoom: true,
    inertia: true,
    inertiaDeceleration: 3000,
    inertiaMaxSpeed: 2000,
    zoomAnimation: true,
    zoomAnimationThreshold: 4,
    fadeAnimation: true,
    markerZoomAnimation: true,
  });
  addBaseLayers(L, map, { defaultLayer: 'satellite', showControl: false });
  const areaLayer = L.layerGroup().addTo(map);
  const layer = L.layerGroup().addTo(map);

  const iconFor = (html, height) =>
    L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div style="position:relative;transform:translate(-50%,-100%);width:max-content">${html}</div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      popupAnchor: [0, -(height - 2)],
    });

  return {
    engine: 'leaflet',
    setView(pos, z, { animate = true } = {}) { map.setView(pos, z, { animate }); },
    fitBounds(points, { padding = 50, maxZoom = 13 } = {}) {
      map.fitBounds(L.latLngBounds(points), { padding: [padding, padding], maxZoom, animate: true });
    },
    addMarker(pos, { html, popup, onClick, height = 42, centered = false } = {}) {
      const icon = centered
        ? L.divIcon({ className: 'custom-leaflet-marker', html: `<div style="position:relative;transform:translate(-50%,-50%);width:max-content">${html}</div>`, iconSize: [0, 0], iconAnchor: [0, 0] })
        : iconFor(html, height);
      const m = L.marker(pos, { icon }).addTo(layer);
      if (popup) m.bindPopup(buildPopup(popup));
      if (onClick) m.on('click', onClick);
      return {
        setPosition(p) { m.setLatLng(p); },
        setHtml(h) { m.setIcon(iconFor(h, height)); },
        openPopup(p) { if (p) m.bindPopup(buildPopup(p)); m.openPopup(); },
        remove() { layer.removeLayer(m); },
      };
    },
    clearMarkers() { layer.clearLayers(); },
    addArea(shape, { fill = '#f59e0b', fillOpacity = 0.3, stroke = '#fbbf24', strokeWeight = 1.5, onClick } = {}) {
      const style = { color: stroke, weight: strokeWeight, opacity: 0.9, fillColor: fill, fillOpacity };
      const obj = shape.kind === 'circle'
        ? L.circle([shape.center.lat, shape.center.lng], { radius: shape.radius, ...style })
        : L.geoJSON(shape.geojson, { style: () => style });
      if (onClick) obj.on('click', onClick);
      obj.addTo(areaLayer);
      return { remove() { areaLayer.removeLayer(obj); } };
    },
    clearAreas() { areaLayer.clearLayers(); },
    addPolyline(points, { stroke = '#c69b55', strokeWeight = 2.5, dashArray = '6, 8' } = {}) {
      const line = L.polyline(points, { color: stroke, weight: strokeWeight, opacity: 0.85, dashArray }).addTo(areaLayer);
      return { remove() { areaLayer.removeLayer(line); } };
    },
    onClick(cb) { map.on('click', (e) => cb({ lat: e.latlng.lat, lng: e.latlng.lng })); },
    resize() { map.invalidateSize(); },
    destroy() { map.remove(); container.remove(); },
  };
}

function showMapError(host, message) {
  const box = document.createElement('div');
  box.style.cssText =
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:20px;' +
    'font:500 13px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#6b7280;background:#f3f4f2';
  box.textContent = message;
  host.appendChild(box);
}

/**
 * Creates a map inside `host`.
 * options: { center: [lat, lng], zoom, gestureHandling: 'greedy' | 'cooperative', mapTypeId }
 */
export async function createMap(host, options) {
  const opts = { center: [7.8731, 80.7718], zoom: 8, gestureHandling: 'greedy', ...options };
  // Each map gets its own inner element, so an old map being cleaned up
  // (e.g. React running effects twice in development) never wipes a new one.
  const container = document.createElement('div');
  container.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
  host.appendChild(container);
  try {
    if (isGoogleMapsEnabled()) {
      try {
        const maps = await loadGoogleMaps();
        if (!googleBroken) return createGoogleMap(maps, container, opts);
      } catch (err) {
        console.warn('[maps] Using free maps instead of Google:', err.message);
      }
    }
    const L = await loadLeaflet();
    return createLeafletMap(L, container, opts);
  } catch (err) {
    container.remove();
    showMapError(host, 'The map could not be loaded. Check your internet connection and refresh the page.');
    throw err;
  }
}
