/* ==============================================================
   UNDO the Cloudflare R2 move — serve photos from Supabase again
   --------------------------------------------------------------
   Finds every R2 web-copy link in the database and in src/, copies
   that web copy + its thumbnail from R2 into Supabase Storage
   (`wts-media/web/…` and `wts-media/thumb/…`, same names), then
   points the links at the Supabase copies. Nothing is deleted
   anywhere — your full-size originals stay in Supabase as they are.

   npm run images:revert              # preview, changes nothing
   npm run images:revert -- --apply   # do it (safe to re-run)

   .env.local needs: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, R2_PUBLIC_BASE_URL
   Run this BEFORE removing the R2 settings.
============================================================== */
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, TABLES, loadEnvLocal, requireEnv, rewriteDatabase, rewriteSourceFiles, dbFromSupabase, encodeKey } from './lib/images-common.mjs';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';

const BUCKET = 'wts-media';
const CACHE_1Y = '31536000';

/** Collect every `<r2Base>/web/...` URL found in the database rows and source files. */
export async function findR2Urls(db, srcDir, r2Base) {
  const re = new RegExp(r2Base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/web/[^"\'\\s)\\]},]+', 'g');
  const found = new Set();
  for (const table of TABLES) {
    let rows; try { rows = await db.selectAll(table); } catch { continue; }
    for (const row of rows) for (const m of JSON.stringify(row).matchAll(re)) found.add(m[0]);
  }
  const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n);
    if (statSync(p).isDirectory()) { if (n !== 'node_modules') walk(p); continue; }
    if (/\.(jsx?|json|css|html)$/.test(n)) for (const m of readFileSync(p, 'utf8').matchAll(re)) found.add(m[0]); } };
  if (existsSync(srcDir)) walk(srcDir);
  return [...found];
}

export async function run({ storage, db, supabaseUrl, r2Base, srcDir, apply = false, fetchImpl = fetch, log = console.log }) {
  const urls = await findR2Urls(db, srcDir, r2Base);
  log(`Found ${urls.length} Cloudflare photo links.${apply ? '' : '  DRY RUN — nothing will change. Add --apply to do it.'}`);
  const pairs = []; let failed = 0, bytes = 0;

  for (const [i, url] of urls.entries()) {
    const webKey = decodeURIComponent(url.slice(r2Base.length + 1));        // web/tuskers/x.webp
    const thumbKey = webKey.replace(/^web\//, 'thumb/');
    const newUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${encodeKey(webKey)}`;
    try {
      if (apply) {
        for (const [key, src] of [[webKey, url], [thumbKey, url.replace('/web/', '/thumb/')]]) {
          const res = await fetchImpl(src);
          if (!res.ok) { if (key === thumbKey) continue; throw new Error(`download ${res.status}`); }  // thumb optional
          const blob = await res.blob();
          bytes += blob.size;
          const { error } = await storage.upload(key, blob, { contentType: blob.type || res.headers.get('content-type') || 'image/webp', cacheControl: CACHE_1Y, upsert: true });
          if (error) throw new Error(`upload ${key}: ${error.message}`);
        }
      }
      pairs.push([url, newUrl]);
      log(`[${i + 1}/${urls.length}] ${webKey}${apply ? ' ✓' : ''}`);
    } catch (err) {
      failed++;
      log(`FAILED ${webKey}: ${err.message}`);
    }
  }

  pairs.sort((a, b) => b[0].length - a[0].length);
  const dbResult = await rewriteDatabase(db, pairs, { apply, log });
  const srcChanged = rewriteSourceFiles(srcDir, pairs, { apply });
  log(`\n${apply ? 'Done' : 'Would do'}:`);
  log(`  photos ${apply ? 'copied to' : 'to copy to'} Supabase: ${urls.length - failed} (failed ${failed})${apply ? `, ≈ ${(bytes / 1048576).toFixed(1)} MB` : ''}`);
  log(`  database: ${dbResult.rows} rows / ${dbResult.cells} fields ${apply ? 'updated' : 'would update'}`);
  log(`  source files ${apply ? 'updated' : 'would update'}: ${srcChanged.length ? srcChanged.map(p => p.replace(ROOT, '').replace(/^[\\/]/, '')).join(', ') : 'none'}`);
  if (failed) log('  Re-run the same command to retry failed photos — their links were left unchanged.');
  return { copied: urls.length - failed, failed, db: dbResult, srcChanged };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  loadEnvLocal();
  requireEnv('VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'R2_PUBLIC_BASE_URL');
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseUrl = process.env.VITE_SUPABASE_URL.replace(/\/+$/, '');
  const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  run({ storage: supabase.storage.from(BUCKET), db: dbFromSupabase(supabase), supabaseUrl,
        r2Base: process.env.R2_PUBLIC_BASE_URL.replace(/\/+$/, ''), srcDir: join(ROOT, 'src'), apply: process.argv.includes('--apply') })
    .catch(err => { console.error(err); process.exit(1); });
}
