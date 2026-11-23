/**
 * @file ProjectModel.js
 * @description Data access model for conservation projects and events in Supabase PostgreSQL.
 */

import { supabase, fromRow, unwrap } from '../lib/supabaseClient';

/* ==============================================================
   EVENTS CRUD (async, Supabase)
   Seed data now lives in supabase/seed.sql.
   Upcoming events: soonest first. Past events: most recent first.
============================================================== */
export async function getEvents() {
  const rows = unwrap(await supabase.from('events').select('*')).map(fromRow);
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // Upcoming: explicitly marked upcoming AND date is today or later
  const upcoming = rows
    .filter(e => e.type === 'upcoming' && (!e.date || e.date >= todayStr))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  // Past: marked past OR date is earlier than today
  const past = rows
    .filter(e => e.type === 'past' || (e.date && e.date < todayStr))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return { upcoming, past };
}

export async function addEvent(event, type) {
  // type can be 'upcoming' or 'past'
  unwrap(await supabase.from('events').insert({
    type: type === 'upcoming' ? 'upcoming' : 'past',
    date: event.date,
    title: event.title,
    description: event.description,
    shared_by: event.sharedBy,
    image: event.image || null,
  }));
}

export async function deleteEvent(id) {
  unwrap(await supabase.from('events').delete().eq('id', Number(id)));
}

export async function getEventById(id) {
  const { data, error } = await supabase.from('events').select('*').eq('id', Number(id)).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

export async function updateEvent(id, event, type) {
  unwrap(await supabase.from('events').update({
    type: type === 'upcoming' ? 'upcoming' : 'past',
    date: event.date,
    title: event.title,
    description: event.description,
    shared_by: event.sharedBy,
    image: event.image || null,
  }).eq('id', Number(id)));
}
