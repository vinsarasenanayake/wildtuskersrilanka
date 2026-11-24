/**
 * @file ProjectModel.js
 * @description Data access model for conservation projects and events in Supabase PostgreSQL.
 * Provides instant in-memory and session caching, and transparent metadata serialization
 * for event time and flexible venue/auditorium locations.
 */

import { supabase, fromRow, unwrap } from '../lib/supabaseClient';

/* ==============================================================
   METADATA PARSER & SERIALIZER FOR TIME & VENUE
============================================================== */
export function parseEventMeta(rawDescription) {
  if (!rawDescription) return { description: '', time: '', location: '' };
  const metaMatch = String(rawDescription).match(/<!--WTS_EVENT_META:([\s\S]*?)-->/);
  if (metaMatch) {
    try {
      const meta = JSON.parse(metaMatch[1]);
      const cleanDesc = rawDescription.replace(metaMatch[0], '').trim();
      return {
        description: cleanDesc,
        time: meta.time || '',
        location: meta.location || '',
      };
    } catch (e) {
      console.warn('Failed to parse event metadata', e);
    }
  }
  return { description: rawDescription, time: '', location: '' };
}

export function serializeEventDescription(description, time, location) {
  const cleanDesc = (description || '').trim();
  const meta = {};
  if (time && time.trim()) meta.time = time.trim();
  if (location && location.trim()) meta.location = location.trim();

  if (Object.keys(meta).length > 0) {
    return `<!--WTS_EVENT_META:${JSON.stringify(meta)}-->\n${cleanDesc}`;
  }
  return cleanDesc;
}

/* ==============================================================
   EVENTS CACHE (Instant 0ms Page Load)
============================================================== */
let eventsCache = null;
let eventsCacheTime = 0;
const EVENTS_CACHE_TTL_MS = 5 * 60 * 1000;

export function getCachedEvents() {
  const now = Date.now();
  if (eventsCache && (now - eventsCacheTime < EVENTS_CACHE_TTL_MS)) {
    return eventsCache;
  }
  try {
    const saved = sessionStorage.getItem('wts_events_cache');
    if (saved) {
      eventsCache = JSON.parse(saved);
      eventsCacheTime = now;
      return eventsCache;
    }
  } catch { /* ignore */ }
  return null;
}

export function invalidateEventsCache() {
  eventsCache = null;
  eventsCacheTime = 0;
  try {
    sessionStorage.removeItem('wts_events_cache');
  } catch { /* ignore */ }
}

/* ==============================================================
   EVENTS CRUD (async, Supabase)
   Upcoming events: soonest first. Past events: most recent first.
============================================================== */
export async function getEvents(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = getCachedEvents();
    if (cached) return cached;
  }

  const rows = unwrap(await supabase.from('events').select('*')).map(fromRow);
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const parsedRows = rows.map((r) => {
    const meta = parseEventMeta(r.description);
    return {
      ...r,
      description: meta.description,
      time: meta.time,
      location: meta.location,
    };
  });

  // Upcoming: explicitly marked upcoming AND date is today or later
  const upcoming = parsedRows
    .filter(e => e.type === 'upcoming' && (!e.date || e.date >= todayStr))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  // Past: marked past OR date is earlier than today
  const past = parsedRows
    .filter(e => e.type === 'past' || (e.date && e.date < todayStr))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const result = { upcoming, past };
  eventsCache = result;
  eventsCacheTime = Date.now();
  try {
    sessionStorage.setItem('wts_events_cache', JSON.stringify(result));
  } catch { /* ignore */ }

  return result;
}

export async function addEvent(event, type) {
  // type can be 'upcoming' or 'past'
  const finalDescription = serializeEventDescription(
    event.description,
    event.time,
    event.location
  );

  unwrap(await supabase.from('events').insert({
    type: type === 'upcoming' ? 'upcoming' : 'past',
    date: event.date,
    title: event.title,
    description: finalDescription,
    shared_by: event.sharedBy,
    image: event.image || null,
  }));
  invalidateEventsCache();
}

export async function deleteEvent(id) {
  unwrap(await supabase.from('events').delete().eq('id', Number(id)));
  invalidateEventsCache();
}

export async function getEventById(id) {
  const { data, error } = await supabase.from('events').select('*').eq('id', Number(id)).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const ev = fromRow(data);
  const meta = parseEventMeta(ev.description);
  return {
    ...ev,
    description: meta.description,
    time: meta.time,
    location: meta.location,
  };
}

export async function updateEvent(id, event, type) {
  const finalDescription = serializeEventDescription(
    event.description,
    event.time,
    event.location
  );

  unwrap(await supabase.from('events').update({
    type: type === 'upcoming' ? 'upcoming' : 'past',
    date: event.date,
    title: event.title,
    description: finalDescription,
    shared_by: event.sharedBy,
    image: event.image || null,
  }).eq('id', Number(id)));
  invalidateEventsCache();
}
