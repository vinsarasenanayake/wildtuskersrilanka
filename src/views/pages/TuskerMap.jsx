import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, X, Loader2 } from 'lucide-react';
import { getTuskers, parseSightingDetails, LIVING_STATUSES, ZONES, PROVINCES } from '../../models/TuskerModel';
import { createMap } from '../../utils/mapEngine';
import { cleanAreaName, areaKey, instantAreaShape, resolveAreaShape, shapeBoundsPoints } from '../../utils/areaShapes';
import { escapeHtml } from '../../utils/escapeHtml';

/* Admin-only page: how many tuskers are in each area.
   Each area (national park, sanctuary, tank, village…) is shaded with its
   real outline where one exists, and labelled with the number of tuskers.
   Area = place of the latest sighting, otherwise last seen area,
   otherwise the registered location. */

const SRI_LANKA_CENTER = [7.8731, 80.7718];
const STATUS_COLORS = { Alive: '#16a34a', 'No Recent Record': '#d97706', Deceased: '#6b7280' };
const statusColor = (s) => STATUS_COLORS[s] || '#0b2518';

function areaNameFor(t) {
  // 1. Latest verified field sighting (Row 2+):
  const list = [...(t.sightings || [])].sort((a, b) =>
    String(b.captureDate || '').localeCompare(String(a.captureDate || '')) || (b.id || 0) - (a.id || 0)
  );
  for (const s of list) {
    const loc = cleanAreaName(parseSightingDetails(s).location);
    if (loc) return { name: loc, source: 'Latest sighting', date: s.captureDate };
  }

  // 2. Recorded Last Seen Area (t.lastSeenArea):
  const lastArea = cleanAreaName(t.lastSeenArea);
  if (lastArea) {
    const isDeceased = t.livingStatus === 'Deceased';
    return {
      name: lastArea,
      source: isDeceased ? 'Last seen / Final location' : 'Last seen area',
      date: isDeceased ? (t.deathYear ? String(t.deathYear) : t.lastSeen) : t.lastSeen,
    };
  }

  // 3. NO baseline location (t.location) or roaming corridor on full map:
  // If neither latest sighting nor lastSeenArea is available, do NOT show him on the map!
  return null;
}

// More tuskers → stronger shading
function intensity(count) {
  if (count >= 20) return 0.6;
  if (count >= 10) return 0.5;
  if (count >= 5) return 0.42;
  if (count >= 2) return 0.33;
  return 0.25;
}

function badgeHtml(count, selected, name, status) {
  const isSingle = count === 1;
  const pinColor = isSingle ? statusColor(status || 'Alive') : '#0b2518';
  const strokeColor = selected ? '#ffffff' : (isSingle ? '#ffffff' : '#c69b55');
  const textColor = '#ffffff';
  const strokeWidth = selected ? 2.8 : 2;
  const pinWidth = isSingle ? 30 : (count >= 10 ? 36 : 32);
  const pinHeight = isSingle ? 38 : (count >= 10 ? 44 : 40);
  const fontSize = count >= 100 ? 10 : (count >= 10 ? 11.5 : 13);
  const dropShadow = selected
    ? 'filter:drop-shadow(0 0 6px rgba(198,155,85,0.95)) drop-shadow(0 3px 6px rgba(0,0,0,0.6));'
    : 'filter:drop-shadow(0 2px 5px rgba(0,0,0,0.55));';
  const tooltip = `${name} · ${count} ${count === 1 ? 'tusker' : 'tuskers'}`;

  return `
    <div title="${escapeHtml(tooltip)}" style="display:inline-flex;align-items:center;justify-content:center;cursor:pointer;${dropShadow}">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 44" width="${pinWidth}" height="${pinHeight}">
        <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z" fill="${pinColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        <circle cx="18" cy="18" r="11" fill="${pinColor}"/>
        <text x="18" y="22.5" font-size="${fontSize}" font-weight="800" fill="${textColor}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif">${escapeHtml(count)}</text>
      </svg>
    </div>`;
}

export default function TuskerMap() {
  const [tuskers, setTuskers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [shapes, setShapes] = useState({}); // areaKey -> shape | null
  const [lookingUp, setLookingUp] = useState(0);

  const [query, setQuery] = useState('');
  const [statuses, setStatuses] = useState(() => new Set(LIVING_STATUSES));
  const [zone, setZone] = useState('');
  const [province, setProvince] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const hostRef = useRef(null);
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Tusker Map';
    getTuskers()
      .then(setTuskers)
      .catch((err) => setLoadError(err.message || 'Could not load tuskers'))
      .finally(() => setLoading(false));
  }, []);

  const withArea = useMemo(() => tuskers.map((t) => ({ tusker: t, area: areaNameFor(t) })), [tuskers]);

  // Instant shapes from cache / built-in list, then real outlines in the background
  useEffect(() => {
    if (!withArea.length) return undefined;
    let active = true;
    const names = new Map();
    withArea.forEach(({ area }) => { if (area?.name) names.set(areaKey(area.name), area.name); });

    const initial = {};
    names.forEach((name, key) => { initial[key] = instantAreaShape(name); });
    setShapes(initial);

    const todo = [...names].filter(([key]) => !initial[key] || initial[key].provisional);
    setLookingUp(todo.length);
    (async () => {
      for (const [key, name] of todo) {
        const shape = await resolveAreaShape(name);
        if (!active) return;
        setShapes((prev) => ({ ...prev, [key]: shape || prev[key] || null }));
        setLookingUp((n) => Math.max(0, n - 1));
      }
    })();
    return () => { active = false; };
  }, [withArea]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return withArea.filter(({ tusker: t, area }) =>
      statuses.has(t.livingStatus || 'Alive') &&
      (!zone || t.zone === zone) &&
      (!province || t.province === province) &&
      (!q || `${t.id} ${t.name || ''} ${t.sinhala || ''} ${area?.name || ''}`.toLowerCase().includes(q))
    );
  }, [withArea, query, statuses, zone, province]);

  // One group per area outline (names that resolve to the same park are merged)
  const { groups, unplaced } = useMemo(() => {
    const byId = new Map();
    const none = [];
    filtered.forEach((item) => {
      const shape = item.area ? shapes[areaKey(item.area.name)] : null;
      const ok = shape && Number.isFinite(Number(shape.label?.lat)) && Number.isFinite(Number(shape.label?.lng));
      if (!ok) { none.push(item); return; }
      if (!byId.has(shape.id)) byId.set(shape.id, { id: shape.id, shape, names: new Set(), items: [] });
      const g = byId.get(shape.id);
      g.names.add(item.area.name);
      g.items.push(item);
    });
    const list = [...byId.values()].map((g) => ({
      ...g,
      title: g.shape.kind === 'polygon' ? g.shape.name : [...g.names][0],
    }));
    list.sort((a, b) => b.items.length - a.items.length);
    return { groups: list, unplaced: none };
  }, [filtered, shapes]);

  const selected = groups.find((g) => g.id === selectedId) || null;

  // Side list: every filtered tusker, with the area it is counted in
  const tuskerRows = useMemo(() => {
    const groupOf = new Map();
    groups.forEach((g) => g.items.forEach((i) => groupOf.set(i.tusker.id, g)));
    return filtered
      .map((item) => ({ ...item, group: groupOf.get(item.tusker.id) || null }))
      .sort((a, b) => String(a.tusker.id).localeCompare(String(b.tusker.id), undefined, { numeric: true }));
  }, [filtered, groups]);

  // Map
  useEffect(() => {
    let active = true;
    let created = null;
    createMap(hostRef.current, { center: SRI_LANKA_CENTER, zoom: 8, gestureHandling: 'greedy', mapTypeId: 'hybrid' })
      .then((map) => {
        if (!active) { map.destroy(); return; }
        created = map;
        mapRef.current = map;
        setMapReady(true);
      })
      .catch((err) => console.error('Tusker map failed to load:', err));
    return () => {
      active = false;
      if (created) created.destroy();
      mapRef.current = null;
    };
  }, []);

  // Draw shaded areas + count badges
  const fittedRef = useRef(false);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    map.clearAreas();
    map.clearMarkers();
    groups.forEach((g) => {
      try {
      const isSel = g.id === selectedId;
      const select = () => setSelectedId(g.id);
      map.addArea(g.shape, {
        fill: '#f59e0b',
        fillOpacity: isSel ? 0.55 : intensity(g.items.length),
        stroke: isSel ? '#ffffff' : '#fbbf24',
        strokeWeight: isSel ? 3 : 1.5,
        onClick: select,
      });
      const firstTusker = g.items[0]?.tusker;
      const pinHeight = g.items.length === 1 ? 38 : (g.items.length >= 10 ? 44 : 40);
      map.addMarker([Number(g.shape.label.lat), Number(g.shape.label.lng)], {
        html: badgeHtml(g.items.length, isSel, g.title, firstTusker?.livingStatus),
        height: pinHeight,
        onClick: select,
      });
      } catch (err) {
        console.error('[tusker map] could not draw area', g.title, err);
      }
    });
    if (!fittedRef.current && groups.length > 1 && lookingUp === 0) {
      try {
        map.fitBounds(groups.flatMap((g) => shapeBoundsPoints(g.shape)), { padding: 40, maxZoom: 10 });
      } catch (err) {
        console.error('[tusker map] fit failed', err);
      }
      fittedRef.current = true;
    }
  }, [groups, mapReady, selectedId, lookingUp]);

  const focusGroup = (g) => {
    setSelectedId(g.id);
    const pts = shapeBoundsPoints(g.shape);
    if (mapRef.current && pts.length) mapRef.current.fitBounds(pts, { padding: 60, maxZoom: 12 });
  };

  const toggleStatus = (s) => {
    setStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  };

  const shownCount = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="pt-[70px] h-screen flex flex-col bg-[#0b2518] font-sans">
      <div className="flex-1 min-h-0 flex">
        {/* ── Side panel: areas ranked by tusker count ── */}
        <aside className="w-[360px] shrink-0 bg-white border-r border-[#e2e8e4] flex flex-col min-h-0">
          <div className="p-4 border-b border-[#edf2ef]">
            <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6a7c73] hover:text-accent no-underline mb-3">
              <ArrowLeft size={14} /> Admin Portal
            </Link>
            <h1 className="text-lg font-bold text-[#0b2518] m-0 flex items-center gap-2">
              <MapPin size={18} className="text-accent" /> Tusker Map
            </h1>
            <p className="text-xs text-[#6a7c73] m-0 mt-1">
              {loading ? 'Loading tuskers…' : `${filtered.length} ${filtered.length === 1 ? 'tusker' : 'tuskers'} · ${shownCount} on the map across ${groups.length} ${groups.length === 1 ? 'area' : 'areas'}`}
            </p>

            <div className="relative mt-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa8a0]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tusker name, ID or area…"
                className="w-full box-border pl-9 pr-8 py-2 text-sm bg-[#f7f8f7] border border-[#e2e8e4] rounded-lg outline-none focus:border-accent"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#9aa8a0] p-0" aria-label="Clear search">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {LIVING_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleStatus(s)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.72rem] font-semibold border cursor-pointer transition-colors ${
                    statuses.has(s) ? 'bg-[#0b2518] text-white border-[#0b2518]' : 'bg-white text-[#6a7c73] border-[#d8e0db]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: statusColor(s) }} />
                  {s}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <select value={zone} onChange={(e) => setZone(e.target.value)} className="text-xs py-1.5 px-2 border border-[#e2e8e4] rounded-lg bg-white">
                <option value="">All zones</option>
                {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
              <select value={province} onChange={(e) => setProvince(e.target.value)} className="text-xs py-1.5 px-2 border border-[#e2e8e4] rounded-lg bg-white">
                <option value="">All provinces</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {lookingUp > 0 && (
              <div className="flex items-center gap-1.5 text-[0.7rem] text-[#8a9b92] mt-2">
                <Loader2 size={12} className="animate-spin" /> Drawing area outlines… {lookingUp} left (first visit only)
              </div>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {loadError && <p className="p-4 text-sm text-rose-600">{loadError}</p>}
            {tuskerRows.map(({ tusker: t, area, group }) => (
              <button
                key={t.id}
                type="button"
                onClick={() => group && focusGroup(group)}
                disabled={!group}
                className={`w-full text-left flex items-center gap-2.5 px-4 py-2.5 border-0 border-b border-[#f0f3f1] cursor-pointer disabled:cursor-default ${
                  group && group.id === selectedId ? 'bg-[#faf5ec]' : 'bg-white hover:bg-[#f7faf8]'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: statusColor(t.livingStatus) }} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[#111] truncate">
                    <span className="text-accent font-mono text-xs mr-1.5">{t.id}</span>{t.name}
                  </span>
                  <span className={`block text-[0.72rem] truncate ${group ? 'text-[#7a8a82]' : 'text-[#b0bab4] italic'}`}>
                    {group
                      ? `${group.title} · ${area?.source || 'Last location'}`
                      : 'No last seen location recorded · Not on map'}
                  </span>
                </span>
              </button>
            ))}
            {!loading && tuskerRows.length === 0 && <p className="p-4 text-sm text-[#7a8a82]">No tuskers match these filters.</p>}
            {unplaced.length > 0 && (
              <div className="p-3 text-[0.72rem] text-[#8a9b92] bg-[#f9faf9] border-t border-[#edf2ef]">
                <p className="m-0 leading-relaxed">
                  {unplaced.length} {unplaced.length === 1 ? 'tusker has' : 'tuskers have'} no verified last location recorded (awaiting field sighting).
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* ── Map ── */}
        <div className="relative flex-1 min-w-0 bg-[#0e1210]">
          <div ref={hostRef} className="absolute inset-0" />

          {/* Selected area card */}
          {selected && (
            <div className="absolute top-3 left-3 z-[5] w-[310px] max-h-[70%] overflow-y-auto bg-[#0d1612]/95 rounded-xl shadow-2xl border border-[#c69b55]/40 text-white">
              <div className="flex items-start justify-between gap-2 px-3.5 pt-3 pb-2 border-b border-white/10">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white">{selected.title}</div>
                  <div className="text-[0.7rem] text-[#9ca3af]">
                    {selected.items.length} tusker{selected.items.length === 1 ? '' : 's'}
                    {selected.names.size > 1 ? ` · recorded as ${[...selected.names].join(', ')}` : ''}
                  </div>
                </div>
                <button type="button" onClick={() => setSelectedId(null)} className="bg-transparent border-none cursor-pointer text-[#9ca3af] hover:text-white p-0.5" aria-label="Close">
                  <X size={16} />
                </button>
              </div>
              {selected.items.map(({ tusker: t, area }) => (
                <Link
                  key={t.id}
                  to={`/tuskers/${t.id.toLowerCase()}`}
                  className="flex items-center gap-2.5 px-3.5 py-2 no-underline hover:bg-white/10 border-b border-white/5"
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: statusColor(t.livingStatus) }} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white truncate">
                      <span className="text-accent font-mono text-xs mr-1.5">{t.id}</span>{t.name}
                    </span>
                    <span className="block text-[0.7rem] text-[#9ca3af]">
                      {t.livingStatus || 'Alive'} · {area.source}{area.date ? ` · ${area.date}` : ''}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
