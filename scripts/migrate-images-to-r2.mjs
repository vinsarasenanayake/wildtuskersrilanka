/* ==============================================================
   ONE-TIME: move photos from Supabase Storage → Cloudflare R2
   --------------------------------------------------------------
   For every photo in the Supabase `wts-media` bucket:
     • original (untouched)    → R2 `wts-originals/<path>`
     • web copy (1920 px WebP) → R2 `wts-public/web/<path>.webp`
     • thumbnail (480 px WebP) → R2 `wts-public/thumb/<path>.webp`
   Then every link in the database and in src/ is updated to the
   new web-copy URL. Supabase files are NOT deleted (see --cleanup).

   npm run images:migrate                 # preview, changes nothing
   npm run images:migrate -- --apply      # do it (safe to re-run)
   npm run images:migrate -- --cleanup    # later: delete migrated files from Supabase

   .env.local needs: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_BASE_URL
============================================================== */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { ROOT, loadEnvLocal, requireEnv, r2FromEnv, rewriteDatabase, rewriteSourceFiles, dbFromSupabase, encodeKey } from './lib/images-common.mjs';

const SUPABASE_BUCKET = 'wts-media';
const MAP_FILE = join(ROOT, 'scripts', 'r2-migration-map.json');
const CACHE_1Y = 'public, max-age=31536000, immutable';
const TYPE_BY_EXT = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.heic': 'image/heic', '.svg': 'image/svg+xml' };

export async function makeVersions(buffer, path) {
  const ext = extname(path).toLowerCase();
  if (['.gif', '.svg'].includes(ext)) return null;           // keep as-is
  try {
    const base = sharp(buffer, { failOn: 'none' }).rotate();
    const web = await base.clone().resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    const thumb = await base.clone().resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true }).webp({ quality: 75 }).toBuffer();
    return { web, thumb };
  } catch {
    return null;                                              // undecodable → keep as-is
  }
}

async function listAll(storage, prefix = '') {
  const files = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await storage.list(prefix, { limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } });
    if (error) throw error;
    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) files.push(...await listAll(storage, path));
      else if (item.name !== '.emptyFolderPlaceholder') files.push({ path, size: item.metadata?.size ?? 0 });
    }
    if (data.length < 1000) break;
  }
  return files;
}

/** Old Supabase URL forms → new R2 URL. */
function urlPairs(map, supabaseUrl) {
  const pairs = [];
  for (const [path, entry] of Object.entries(map)) {
    const oldBase = `${supabaseUrl}/storage/v1/object/public/${SUPABASE_BUCKET}/`;
    for (const form of new Set([path, encodeURI(path), encodeKey(path)])) pairs.push([oldBase + form, entry.web]);
  }
  return pairs.sort((a, b) => b[0].length - a[0].length);  // longest first
}

export async function run({ storage, r2, db, supabaseUrl, srcDir, mapFile = MAP_FILE, apply = false, log = console.log }) {
  const map = existsSync(mapFile) ? JSON.parse(readFileSync(mapFile, 'utf8')) : {};
  const files = await listAll(storage);
  const todo = files.filter(f => !map[f.path]);
  const total = files.reduce((s, f) => s + f.size, 0);
  log(`Supabase storage: ${files.length} files, ${(total / 1048576).toFixed(1)} MB. Already migrated: ${files.length - todo.length}. To migrate: ${todo.length}.`);
  if (!apply) log('DRY RUN — nothing will be uploaded or changed. Add --apply to do it.\n');

  let webBytes = 0, failed = 0;
  for (const [i, f] of todo.entries()) {
    try {
      const { data: blob, error } = await storage.download(f.path);
      if (error) throw error;
      const original = Buffer.from(await blob.arrayBuffer());
      const ext = extname(f.path).toLowerCase();
      const versions = await makeVersions(original, f.path);
      const keyBase = versions ? f.path.slice(0, f.path.length - ext.length) + '.webp' : f.path;
      const entry = { web: `${r2.publicBaseUrl}/web/${encodeKey(keyBase)}`, thumb: `${r2.publicBaseUrl}/thumb/${encodeKey(keyBase)}`, original: f.path };
      const webBuf = versions?.web ?? original;
      webBytes += webBuf.length;
      log(`[${i + 1}/${todo.length}] ${f.path}  ${(original.length / 1024).toFixed(0)} KB → web ${(webBuf.length / 1024).toFixed(0)} KB, thumb ${((versions?.thumb ?? original).length / 1024).toFixed(0)} KB`);
      if (!apply) continue;

      const type = TYPE_BY_EXT[ext] || 'application/octet-stream';
      await r2.put(r2.originalsBucket, f.path, original, type);
      await r2.put(r2.publicBucket, `web/${keyBase}`, webBuf, versions ? 'image/webp' : type, CACHE_1Y);
      await r2.put(r2.publicBucket, `thumb/${keyBase}`, versions?.thumb ?? original, versions ? 'image/webp' : type, CACHE_1Y);
      map[f.path] = entry;
      writeFileSync(mapFile, JSON.stringify(map, null, 2));   // save progress after each file
    } catch (err) {
      failed++;
      log(`FAILED ${f.path}: ${err.message}`);
    }
  }

  // Preview mapping for not-yet-migrated files too, so the dry run shows link changes
  const previewMap = { ...map };
  if (!apply) for (const f of todo) {
    const ext = extname(f.path).toLowerCase();
    const keyBase = ['.gif', '.svg'].includes(ext) ? f.path : f.path.slice(0, f.path.length - ext.length) + '.webp';
    previewMap[f.path] = { web: `${r2.publicBaseUrl}/web/${encodeKey(keyBase)}` };
  }
  const pairs = urlPairs(apply ? map : previewMap, supabaseUrl);
  const dbResult = await rewriteDatabase(db, pairs, { apply, log });
  const srcChanged = rewriteSourceFiles(srcDir, pairs, { apply });

  log(`\n${apply ? 'Done' : 'Would do'}:`);
  log(`  photos ${apply ? 'migrated' : 'to migrate'}: ${todo.length - failed} (failed ${failed}); web copies total ≈ ${(webBytes / 1048576).toFixed(1)} MB (was ${(total / 1048576).toFixed(1)} MB)`);
  log(`  database: ${dbResult.rows} rows / ${dbResult.cells} fields ${apply ? 'updated' : 'would update'}`);
  log(`  source files ${apply ? 'updated' : 'would update'}: ${srcChanged.length ? srcChanged.map(p => p.replace(ROOT + '/', '').replace(ROOT + '\\', '')).join(', ') : 'none'}`);
  if (apply && failed) log('  Re-run the same command to retry failed files.');
  return { migrated: todo.length - failed, failed, db: dbResult, srcChanged };
}

export async function cleanup({ storage, mapFile = MAP_FILE, log = console.log }) {
  const map = existsSync(mapFile) ? JSON.parse(readFileSync(mapFile, 'utf8')) : {};
  const paths = Object.keys(map);
  for (let i = 0; i < paths.length; i += 100) {
    const { error } = await storage.remove(paths.slice(i, i + 100));
    if (error) throw error;
  }
  log(`Deleted ${paths.length} migrated files from Supabase Storage.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  loadEnvLocal();
  requireEnv('VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_PUBLIC_BASE_URL');
  if (!process.env.R2_ACCOUNT_ID && !process.env.R2_ENDPOINT) requireEnv('R2_ACCOUNT_ID');
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const storage = supabase.storage.from(SUPABASE_BUCKET);
  const task = process.argv.includes('--cleanup')
    ? cleanup({ storage })
    : run({ storage, r2: r2FromEnv(), db: dbFromSupabase(supabase), supabaseUrl: process.env.VITE_SUPABASE_URL.replace(/\/+$/, ''), srcDir: join(ROOT, 'src'), apply: process.argv.includes('--apply') });
  task.catch(err => { console.error(err); process.exit(1); });
}
