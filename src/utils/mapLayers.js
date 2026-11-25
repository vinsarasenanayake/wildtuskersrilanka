/**
 * @file mapLayers.js
 * @description Base map tile layers configuration (Esri Clarity high-res satellite imagery,
 * reference labels, CARTO Voyager and OpenStreetMap tiles).
 */

/* ── Shared base maps ─────────────────────────────────────────────────
   Satellite (default): Esri Clarity imagery + place names
   Map: CARTO Voyager when VITE_CARTO_API_KEY is set, otherwise OpenStreetMap
   No paid API involved. */

// CARTO needs a free key since Sept 2026 (carto.com/basemaps/apikey).
// Without one the "Map" option falls back to the standard OpenStreetMap style.
const CARTO_KEY = (import.meta.env?.VITE_CARTO_API_KEY || '').trim();
const CARTO_VOYAGER = `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(CARTO_KEY)}`;
const OSM_STANDARD = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services';
// Clarity: sharper, mostly cloud-free imagery
const ESRI_CLARITY = 'https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const ESRI_IMAGERY = `${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`;
const ESRI_LABELS = `${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`;

const ESRI_CREDIT = 'Imagery &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community';

/**
 * Adds the base maps and a Satellite / Map switch to a Leaflet map.
 * Satellite is shown by default.
 * Returns { satellite: LayerGroup, map: TileLayer, control }.
 */
export function addBaseLayers(L, map, { position = 'topright', showControl = false } = {}) {
  // Satellite imagery; if a Clarity tile is missing, use the standard imagery tile
  const imagery = L.tileLayer(ESRI_CLARITY, {
    maxZoom: 19,
    maxNativeZoom: 18,
    attribution: ESRI_CREDIT,
    keepBuffer: 2,
    updateWhenZooming: false,
    updateWhenIdle: true,
  });
  imagery.on('tileerror', (e) => {
    const { x, y, z } = e.coords;
    if (e.tile && !e.tile.dataset.fallback) {
      e.tile.dataset.fallback = '1';
      e.tile.src = ESRI_IMAGERY.replace('{z}', z).replace('{y}', y).replace('{x}', x);
    }
  });
  const labels = L.tileLayer(ESRI_LABELS, {
    maxZoom: 19,
    maxNativeZoom: 18,
    pane: 'overlayPane',
    keepBuffer: 2,
    updateWhenZooming: false,
    updateWhenIdle: true,
  });
  const satellite = L.layerGroup([imagery, labels]);

  const osmCredit =
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';
  const street = CARTO_KEY
    ? L.tileLayer(CARTO_VOYAGER, {
        maxZoom: 19,
        keepBuffer: 2,
        updateWhenZooming: false,
        updateWhenIdle: true,
        attribution: `${osmCredit} &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>`,
      })
    : L.tileLayer(OSM_STANDARD, { maxZoom: 19, keepBuffer: 2, updateWhenZooming: false, updateWhenIdle: true, attribution: osmCredit });

  // Default to satellite on every map
  satellite.addTo(map);

  let control = null;
  if (showControl) {
    control = L.control
      .layers({ Satellite: satellite, Map: street }, null, { position, collapsed: false })
      .addTo(map);
  }
  return { satellite, map: street, control };
}
