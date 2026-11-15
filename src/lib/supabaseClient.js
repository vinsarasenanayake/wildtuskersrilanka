import { createClient } from '@supabase/supabase-js';

/* ==============================================================
   SUPABASE CLIENT
   Values come from .env.local (see .env.example). The anon /
   publishable key is safe to ship to the browser — Row Level
   Security in supabase/migrations decides what it can do.
============================================================== */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase config. Copy .env.example to .env.local and fill in ' +
    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart `npm run dev`.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/** Public bucket used for all uploaded images. */
export const MEDIA_BUCKET = 'wts-media';

/* ── Row mapping helpers (DB snake_case ⇄ app camelCase) ─────── */
const toCamelKey = (k) => k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
const toSnakeKey = (k) => k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

export function fromRow(row) {
  if (!row) return row;
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [toCamelKey(k), v]));
}

/**
 * Convert an app object to a DB row. Only keys listed in `allowed`
 * (camelCase) are kept; empty strings become null so date/optional
 * columns don't reject them.
 */
export function toRow(obj, allowed) {
  const row = {};
  for (const key of allowed) {
    if (obj[key] === undefined) continue;
    row[toSnakeKey(key)] = obj[key] === '' ? null : obj[key];
  }
  return row;
}

/** Throw a readable error when a Supabase call fails. */
export function unwrap({ data, error }) {
  if (error) {
    console.error('[Supabase]', error);
    throw new Error(error.message || 'Database request failed');
  }
  return data;
}
