/* Shared helpers for the image scripts (run on your laptop with `node`). */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Tables whose rows may contain image URLs. Missing tables are skipped. */
export const TABLES = ['tuskers', 'tusker_sightings', 'unlisted_tuskers', 'special_observations',
  'field_notes', 'events', 'gallery_photos', 'team_members'];

export function loadEnvLocal() {
  const p = join(ROOT, '.env.local');
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

export function requireEnv(...names) {
  const missing = names.filter(n => !process.env[n]);
  if (missing.length) {
    console.error(`Missing in .env.local: ${missing.join(', ')}`);
    process.exit(1);
  }
}

export const encodeKey = (key) => key.split('/').map(encodeURIComponent).join('/');

export async function r2FromEnv(env = process.env) {
  const { AwsClient } = await import('aws4fetch');
  const endpoint = (env.R2_ENDPOINT || `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`).replace(/\/+$/, '');
  const client = new AwsClient({ accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY, service: 's3', region: 'auto' });
  return {
    publicBucket: env.R2_PUBLIC_BUCKET || 'wts-public',
    originalsBucket: env.R2_ORIGINALS_BUCKET || 'wts-originals',
    publicBaseUrl: (env.R2_PUBLIC_BASE_URL || '').replace(/\/+$/, ''),
    async put(bucket, key, body, contentType, cacheControl) {
      const res = await client.fetch(`${endpoint}/${bucket}/${encodeKey(key)}`, {
        method: 'PUT', body,
        headers: { 'content-type': contentType, ...(cacheControl ? { 'cache-control': cacheControl } : {}) },
      });
      if (!res.ok) throw new Error(`R2 PUT ${bucket}/${key} failed: ${res.status} ${await res.text()}`);
    },
  };
}

/** Replace every `from` with `to` inside strings, arrays and JSON values. */
export function replaceDeep(value, pairs) {
  if (typeof value === 'string') {
    let out = value;
    for (const [from, to] of pairs) if (out.includes(from)) out = out.split(from).join(to);
    return out;
  }
  if (value && typeof value === 'object') {
    const json = JSON.stringify(value);
    const replaced = replaceDeep(json, pairs);
    return replaced === json ? value : JSON.parse(replaced);
  }
  return value;
}

/**
 * Rewrite URLs in every table row. db = { selectAll(table), update(table, id, patch) }.
 * Returns { rows, cells } changed (or that would change in a dry run).
 */
export async function rewriteDatabase(db, pairs, { apply, log }) {
  let rows = 0, cells = 0;
  for (const table of TABLES) {
    let data;
    try { data = await db.selectAll(table); }
    catch (err) { log(`  (skipping table ${table}: ${err.message})`); continue; }
    for (const row of data) {
      const patch = {};
      for (const [col, val] of Object.entries(row)) {
        const next = replaceDeep(val, pairs);
        if (next !== val && JSON.stringify(next) !== JSON.stringify(val)) patch[col] = next;
      }
      const n = Object.keys(patch).length;
      if (!n) continue;
      if (row.id === undefined) { log(`  ! ${table}: row without id, not updated`); continue; }
      rows++; cells += n;
      if (apply) await db.update(table, row.id, patch);
    }
  }
  return { rows, cells };
}

/** Rewrite URLs inside src/**.{js,jsx,json,css,html}. Returns list of changed files. */
export function rewriteSourceFiles(dir, pairs, { apply }) {
  const changed = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) { if (name !== 'node_modules') walk(p); continue; }
      if (!/\.(jsx?|json|css|html)$/.test(name)) continue;
      const text = readFileSync(p, 'utf8');
      const next = replaceDeep(text, pairs);
      if (next !== text) { changed.push(p); if (apply) writeFileSync(p, next); }
    }
  };
  if (existsSync(dir)) walk(dir);
  return changed;
}

/** supabase-js client → the { selectAll, update } shape used above. */
export function dbFromSupabase(supabase) {
  return {
    async selectAll(table) {
      const all = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await supabase.from(table).select('*').range(from, from + 999);
        if (error) throw new Error(error.message);
        all.push(...data);
        if (data.length < 1000) return all;
      }
    },
    async update(table, id, patch) {
      const { error } = await supabase.from(table).update(patch).eq('id', id);
      if (error) throw new Error(`${table} #${id}: ${error.message}`);
    },
  };
}
