/**
 * @file mapEngine.js
 * @description Core dual-engine mapping abstraction. Transparently switches between Google Maps
 * (when API key is configured and valid) and Leaflet (with Esri Satellite / CARTO Voyager tiles)
 * when offline or without Google credentials.
 */

import { loadLeaflet } from './leafletLoader.js';
import { addBaseLayers } from './mapLayers.js';

const GOOGLE_KEY = (import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || '').trim();
let googlePromise = null;

// If Google refuses the key (demo limit reached, key expired, billing off…)
// we remember it for a few hours and use the free maps instead.
const BROKEN_FLAG = 'wts_google_maps_failed_at';
const RETRY_AFTER_MS = 30 * 60 * 1000; // try Google again after 30 minutes

function readBrokenFlag() {
  try {
    const t = Number(localStorage.getItem(BROKEN_FLAG) || 0);
    return t > 0 && Date.now() - t < RETRY_AFTER_MS;
  } catch {
    return false;
  }
}
let googleBroken = readBrokenFlag();

/** Switches the site to free maps without ever reloading or disrupting open modals/forms. */
function markGoogleBroken(reason) {
  if (googleBroken) return;
  googleBroken = true;
  console.warn(`[maps] Google Maps is not working (${reason}). Switching to the free maps.`);
  try {
    localStorage.setItem(BROKEN_FLAG, String(Date.now()));
  } catch { /* storage blocked: new maps will still use the free maps */ }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('wts_google_maps_broken'));
  }
}

// Intercept console.error to catch Google demo key quota/billing limit immediately
if (typeof window !== 'undefined' && !window.__wtsGoogleConsoleHooked) {
  window.__wtsGoogleConsoleHooked = true;
  const originalError = console.error;
  console.error = function (...args) {
    const text = args.map((a) => String(a?.message || a || '')).join(' ');
    if (
      text.includes('Maps Demo Key limit reached') ||
      text.includes('daily quota for Maps JavaScript') ||
      text.includes('Billing on the Google Cloud Project')
    ) {
      markGoogleBroken('google quota/billing error');
    }
    return originalError.apply(this, args);
  };
}

export function isGoogleMapsEnabled() {
  return Boolean(GOOGLE_KEY) && !googleBroken && !readBrokenFlag();
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
function buildPopup({ badge, date, title, lines = [] } = {}, onClose) {
  const root = document.createElement('div');
  root.style.cssText =
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;min-width:240px;max-width:310px;line-height:1.4;padding:4px 2px;color:#f3f4f6;position:relative;';

  const top = document.createElement('div');
  top.style.cssText =
    'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;padding-right:24px;';

  const leftMeta = document.createElement('div');
  leftMeta.style.cssText = 'display:flex;align-items:center;gap:6px;flex-wrap:wrap;';

  if (badge) {
    const b = document.createElement('span');
    b.style.cssText =
      'background:rgba(198,155,85,0.18);color:#e5b869;border:1px solid rgba(198,155,85,0.45);font-weight:700;font-size:10px;padding:2px 7px;border-radius:6px;letter-spacing:0.5px;text-transform:uppercase;box-shadow:0 1px 3px rgba(0,0,0,0.3);';
    b.textContent = badge;
    leftMeta.appendChild(b);
  }
  if (date) {
    const d = document.createElement('span');
    d.style.cssText = 'font-size:10.5px;font-weight:600;color:#9ca3af;';
    d.textContent = date;
    leftMeta.appendChild(d);
  }
  top.appendChild(leftMeta);
  root.appendChild(top);

  if (onClose) {
    const closeBtn = document.createElement('button');
    closeBtn.setAttribute('type', 'button');
    closeBtn.setAttribute('aria-label', 'Close popup');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText =
      'position:absolute;top:2px;right:2px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);color:#d1d5db;font-size:11px;font-weight:700;cursor:pointer;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all 0.15s ease;padding:0;line-height:1;flex-shrink:0;z-index:10;';
    closeBtn.onmouseenter = () => { closeBtn.style.backgroundColor = 'rgba(255,255,255,0.22)'; closeBtn.style.color = '#ffffff'; };
    closeBtn.onmouseleave = () => { closeBtn.style.backgroundColor = 'rgba(255,255,255,0.08)'; closeBtn.style.color = '#d1d5db'; };
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      onClose();
    };
    root.appendChild(closeBtn);
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
    zoomControlOptions: {
      position: maps.ControlPosition.RIGHT_BOTTOM,
    },
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    rotateControl: false,
    panControl: false,
    scaleControl: false,
    keyboardShortcuts: false,
    clickableIcons: false,
    gestureHandling,
    isFractionalZoomEnabled: false, // Clean integer zoom steps without continuous raster bicubic re-tessellation lag
  });
  // Google draws a grey "can't load Google Maps correctly" box on errors
  // (quota reached, key problems). Spot it and switch to the free maps.
  // (Checked a few times after loading - watching every change slowed zooming.)
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
      this.el.innerHTML = (typeof html === 'string') ? html : ''; // our own static SVG markup
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
      this.el.innerHTML = (typeof html === 'string') ? html : '';
    }
  }

  const openPopupAt = (pos, popup, offsetY) => {
    info.setContent(buildPopup(popup, () => {
      info.close();
      popup?.onClose?.();
    }));
    info.setOptions({ pixelOffset: new maps.Size(0, -offsetY) });
    info.setPosition({ lat: pos[0], lng: pos[1] });
    info.open({ map });
  };

  return {
    engine: 'google',
    closePopup() { info.close(); },
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
      maps.event.addListenerOnce(map, 'idle', () => {
        if (map.getZoom() > maxZoom) {
          map.setZoom(maxZoom);
          map.setCenter(b.getCenter());
        }
      });
    },
    addMarker(pos, { html, popup, onClick, height = 42, centered = false } = {}) {
      const lat = Array.isArray(pos) ? pos[0] : (pos?.lat ?? 0);
      const lng = Array.isArray(pos) ? pos[1] : (pos?.lng ?? 0);
      const safePos = [lat, lng];
      let current = safePos;
      let currentPopup = popup;
      const m = new HtmlMarker(safePos, html, () => {
        if (currentPopup) openPopupAt(current, currentPopup, height);
        onClick?.();
      }, centered);
      markers.add(m);
      return {
        setPosition(p) {
          const plat = Array.isArray(p) ? p[0] : (p?.lat ?? 0);
          const plng = Array.isArray(p) ? p[1] : (p?.lng ?? 0);
          current = [plat, plng];
          m.setPos(current);
        },
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
    zoomControl: false,
    attributionControl: false,
    preferCanvas: true, // Hardware-accelerated GPU canvas for vector polygons and paths
    zoomSnap: 1,        // Clean integer zoom step increments (prevents raster tile blur/stretching)
    zoomDelta: 1,       // Responsive single-step zooming
    wheelPxPerZoomLevel: 60, // Smooth mouse wheel sensitivity
    wheelDebounceTime: 40,   // Prevents overlapping zoom animation collisions
    scrollWheelZoom: true,
    touchZoom: true,
    doubleClickZoom: true,
    boxZoom: false,
    tap: false,          // Prevents touch event and click delays/bugs on modern mobile browsers
    bounceAtZoomLimits: false,
    inertia: true,
    inertiaDeceleration: 3000,
    inertiaMaxSpeed: 2000,
    zoomAnimation: true,
    zoomAnimationThreshold: 4,
    fadeAnimation: true,
    markerZoomAnimation: true,
  });
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  let leafletRo = null;
  if (typeof ResizeObserver !== 'undefined') {
    leafletRo = new ResizeObserver(() => {
      map.invalidateSize();
    });
    leafletRo.observe(container);
  }
  addBaseLayers(L, map, { defaultLayer: 'satellite', showControl: false });
  // Shared GPU canvas renderer with 50% buffer padding for smooth vector panning and zooming
  const canvasRenderer = L.canvas({ padding: 0.5, tolerance: 10 });
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
    setView(pos, z, { animate = true, duration = 0.75 } = {}) {
      if (animate && typeof map.flyTo === 'function') {
        map.flyTo(pos, z, { duration, easeLinearity: 0.25 });
      } else {
        map.setView(pos, z, { animate });
      }
    },
    fitBounds(points, { padding = 50, maxZoom = 13, animate = false, duration = 0.85 } = {}) {
      map.invalidateSize();
      const bounds = L.latLngBounds(points);
      if (animate && typeof map.flyToBounds === 'function') {
        map.flyToBounds(bounds, { padding: [padding, padding], maxZoom, duration, easeLinearity: 0.25 });
      } else {
        map.fitBounds(bounds, { padding: [padding, padding], maxZoom, animate });
      }
    },
    addMarker(pos, { html, popup, onClick, height = 42, centered = false } = {}) {
      const lat = Array.isArray(pos) ? pos[0] : (pos?.lat ?? 0);
      const lng = Array.isArray(pos) ? pos[1] : (pos?.lng ?? 0);
      const safePos = [lat, lng];
      const safeHtml = (typeof html === 'string') ? html : '';
      const icon = centered
        ? L.divIcon({ className: 'custom-leaflet-marker', html: `<div style="position:relative;transform:translate(-50%,-50%);width:max-content">${safeHtml}</div>`, iconSize: [0, 0], iconAnchor: [0, 0] })
        : iconFor(safeHtml, height);
      const m = L.marker(safePos, { icon }).addTo(layer);
      const makeCloseHandler = (p) => () => {
        map.closePopup();
        p?.onClose?.();
      };
      if (popup) m.bindPopup(buildPopup(popup, makeCloseHandler(popup)), { closeButton: false });
      if (onClick) m.on('click', onClick);
      return {
        setPosition(p) {
          const plat = Array.isArray(p) ? p[0] : (p?.lat ?? 0);
          const plng = Array.isArray(p) ? p[1] : (p?.lng ?? 0);
          m.setLatLng([plat, plng]);
        },
        setHtml(h) { m.setIcon(iconFor((typeof h === 'string') ? h : '', height)); },
        openPopup(p) { if (p) m.bindPopup(buildPopup(p, makeCloseHandler(p)), { closeButton: false }); m.openPopup(); },
        remove() { layer.removeLayer(m); },
      };
    },
    clearMarkers() { layer.clearLayers(); },
    closePopup() { map.closePopup(); },
    addArea(shape, { fill = '#f59e0b', fillOpacity = 0.3, stroke = '#fbbf24', strokeWeight = 1.5, onClick } = {}) {
      const style = { color: stroke, weight: strokeWeight, opacity: 0.9, fillColor: fill, fillOpacity, smoothFactor: 1.5, renderer: canvasRenderer };
      const obj = shape.kind === 'circle'
        ? L.circle([shape.center.lat, shape.center.lng], { radius: shape.radius, ...style })
        : L.geoJSON(shape.geojson, { style: () => style, smoothFactor: 1.5, renderer: canvasRenderer });
      if (onClick) obj.on('click', onClick);
      obj.addTo(areaLayer);
      return { remove() { areaLayer.removeLayer(obj); } };
    },
    clearAreas() { areaLayer.clearLayers(); },
    addPolyline(points, { stroke = '#c69b55', strokeWeight = 2.5, dashArray = '6, 8' } = {}) {
      const line = L.polyline(points, { color: stroke, weight: strokeWeight, opacity: 0.85, dashArray, smoothFactor: 1.5, renderer: canvasRenderer }).addTo(areaLayer);
      return { remove() { areaLayer.removeLayer(line); } };
    },
    onClick(cb) { map.on('click', (e) => cb({ lat: e.latlng.lat, lng: e.latlng.lng })); },
    resize() { map.invalidateSize(); },
    destroy() {
      if (leafletRo) leafletRo.disconnect();
      map.remove();
      container.remove();
    },
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

  if (!isGoogleMapsEnabled()) {
    try {
      const L = await loadLeaflet();
      return createLeafletMap(L, container, opts);
    } catch (err) {
      container.remove();
      showMapError(host, 'The map could not be loaded. Check your internet connection and refresh the page.');
      throw err;
    }
  }

  try {
    const maps = await loadGoogleMaps();
    if (googleBroken) {
      const L = await loadLeaflet();
      return createLeafletMap(L, container, opts);
    }

    let activeMap = createGoogleMap(maps, container, opts);
    let destroyed = false;
    let currentCenter = opts.center;
    let currentZoom = opts.zoom;
    let onClickCb = null;
    const trackedMarkers = new Set();
    const trackedAreas = new Set();
    const trackedPolylines = new Set();

    const fallbackToLeaflet = async () => {
      if (destroyed || activeMap?.engine === 'leaflet') return;
      try {
        if (activeMap) {
          activeMap.destroy();
          activeMap = null;
        }
        if (!host.contains(container)) {
          host.appendChild(container);
        }
        container.innerHTML = '';
        const L = await loadLeaflet();
        if (destroyed) return;
        activeMap = createLeafletMap(L, container, { ...opts, center: currentCenter, zoom: currentZoom });
        activeMap.resize();
        if (onClickCb) {
          activeMap.onClick(onClickCb);
        }
        trackedMarkers.forEach((m) => {
          m.ref = activeMap.addMarker(m.pos, m.opts);
        });
        trackedAreas.forEach((a) => {
          a.ref = activeMap.addArea(a.shape, a.opts);
        });
        trackedPolylines.forEach((p) => {
          p.ref = activeMap.addPolyline(p.points, p.opts);
        });
      } catch (e) {
        console.error('[maps] Fallback to Leaflet failed:', e);
      }
    };

    const brokenListener = () => {
      fallbackToLeaflet();
    };
    window.addEventListener('wts_google_maps_broken', brokenListener);

    // Watch for Google Maps quota error container if injected
    const errObserver = new MutationObserver(() => {
      if (container.querySelector('.gm-err-container') || container.querySelector('.gm-err-message')) {
        markGoogleBroken('google error overlay detected');
        errObserver.disconnect();
      }
    });
    errObserver.observe(container, { childList: true, subtree: true });

    return {
      get engine() { return activeMap ? activeMap.engine : 'google'; },
      closePopup() { activeMap?.closePopup(); },
      setView(pos, z, viewOpts) {
        currentCenter = pos;
        if (typeof z === 'number') currentZoom = z;
        activeMap?.setView(pos, z, viewOpts);
      },
      fitBounds(points, boundsOpts) { activeMap?.fitBounds(points, boundsOpts); },
      addMarker(pos, markerOpts) {
        const item = { pos, opts: markerOpts, ref: activeMap?.addMarker(pos, markerOpts) };
        trackedMarkers.add(item);
        return {
          setPosition(p) {
            item.pos = p;
            item.ref?.setPosition(p);
          },
          setHtml(h) { item.ref?.setHtml(h); },
          openPopup(p) { item.ref?.openPopup(p); },
          remove() {
            item.ref?.remove();
            trackedMarkers.delete(item);
          },
        };
      },
      clearMarkers() {
        trackedMarkers.clear();
        activeMap?.clearMarkers();
      },
      addArea(shape, areaOpts) {
        const item = { shape, opts: areaOpts, ref: activeMap?.addArea(shape, areaOpts) };
        trackedAreas.add(item);
        return {
          remove() {
            item.ref?.remove();
            trackedAreas.delete(item);
          },
        };
      },
      clearAreas() {
        trackedAreas.clear();
        activeMap?.clearAreas();
      },
      addPolyline(points, polyOpts) {
        const item = { points, opts: polyOpts, ref: activeMap?.addPolyline(points, polyOpts) };
        trackedPolylines.add(item);
        return {
          remove() {
            item.ref?.remove();
            trackedPolylines.delete(item);
          },
        };
      },
      onClick(cb) {
        onClickCb = cb;
        activeMap?.onClick(cb);
      },
      resize() { activeMap?.resize(); },
      destroy() {
        destroyed = true;
        window.removeEventListener('wts_google_maps_broken', brokenListener);
        errObserver.disconnect();
        trackedMarkers.clear();
        trackedAreas.clear();
        trackedPolylines.clear();
        activeMap?.destroy();
        activeMap = null;
      },
    };
  } catch (err) {
    console.warn('[maps] Using free maps instead of Google:', err.message);
    const L = await loadLeaflet();
    return createLeafletMap(L, container, opts);
  }
}
