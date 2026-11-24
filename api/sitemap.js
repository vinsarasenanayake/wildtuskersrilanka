/* ==============================================================
   LIVE SITEMAP  →  https://<site>/api/sitemap
   Built on every request from the tuskers table, so newly added
   tuskers appear automatically (cached by Vercel for 1 hour).
   Uses the same public (anon / publishable) key as the website,
   which can only read public data.
============================================================== */
const SITE = 'https://wildtuskersrilanka.vercel.app';
const STATIC_PAGES = ['/', '/about', '/tuskers', '/gallery', '/field-notes', '/observations', '/projects'];

const xmlEscape = (s) => String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

async function getTuskerIds() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const res = await fetch(`${url}/rest/v1/tuskers?select=id&order=id.asc`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`Supabase responded ${res.status}`);
  const rows = await res.json();
  return rows.map((r) => r.id).filter((id) => typeof id === 'string' && /^T\d+$/i.test(id));
}

export default async function handler(req, res) {
  let ids = [];
  try {
    ids = await getTuskerIds();
  } catch (err) {
    console.error('[sitemap] could not load tuskers:', err.message);
  }

  const paths = [...STATIC_PAGES, ...ids.map((id) => `/tuskers/${id.toLowerCase()}`)];
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    paths.map((p) => `  <url><loc>${xmlEscape(SITE + p)}</loc></url>`).join('\n') +
    '\n</urlset>\n';

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  // Fresh copy at most once an hour; serve the old one while refreshing.
  res.setHeader('Cache-Control', ids.length ? 'public, s-maxage=3600, stale-while-revalidate=86400' : 'no-store');
  res.status(200).send(body);
}
