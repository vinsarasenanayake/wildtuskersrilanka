/* ==============================================================
   LAUNCH WEEK: switch photo links to your own domain
   --------------------------------------------------------------
   Replaces the current R2_PUBLIC_BASE_URL (e.g. https://pub-….r2.dev)
   with the new address in the database and in src/.

   npm run images:switch-domain -- https://images.wildtuskers.lk            # preview
   npm run images:switch-domain -- https://images.wildtuskers.lk --apply    # do it

   Afterwards: set R2_PUBLIC_BASE_URL to the new address in .env.local
   AND in Vercel → Settings → Environment Variables, then redeploy.
============================================================== */
import { join } from 'node:path';
import { ROOT, loadEnvLocal, requireEnv, rewriteDatabase, rewriteSourceFiles, dbFromSupabase } from './lib/images-common.mjs';

loadEnvLocal();
requireEnv('VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'R2_PUBLIC_BASE_URL');
const from = process.env.R2_PUBLIC_BASE_URL.replace(/\/+$/, '');
const to = (process.argv.slice(2).find(a => a.startsWith('https://')) || '').replace(/\/+$/, '');
const apply = process.argv.includes('--apply');
if (!to) { console.error('Usage: npm run images:switch-domain -- https://images.wildtuskers.lk [--apply]'); process.exit(1); }
if (from === to) { console.log('Links already use', to); process.exit(0); }

const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const pairs = [[from + '/', to + '/']];
console.log(`${apply ? 'Switching' : 'DRY RUN — would switch'} ${from} → ${to}`);
const db = await rewriteDatabase(dbFromSupabase(supabase), pairs, { apply, log: console.log });
const src = rewriteSourceFiles(join(ROOT, 'src'), pairs, { apply });
console.log(`database: ${db.rows} rows / ${db.cells} fields; source files: ${src.length}`);
if (apply) console.log(`\nNow set R2_PUBLIC_BASE_URL=${to} in .env.local and in Vercel, then redeploy.`);
