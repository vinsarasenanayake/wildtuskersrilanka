/* ==============================================================
   UPLOAD AUTHORIZATION (shared by the Vercel function and `npm run dev`)
   --------------------------------------------------------------
   The browser asks for short-lived signed URLs, then uploads the
   photo straight to Cloudflare R2. R2 keys never reach the browser.

   • Admins (Supabase login listed in admin_users): any folder.
   • Visitors: only the public-submission folders below, size-capped.
   • Each signed URL is locked to an exact content type and size.
============================================================== */
import { AwsClient } from 'aws4fetch';

const PUBLIC_FOLDERS = ['gallery', 'fieldnotes', 'field-notes'];
const MAX_BYTES = {
  visitor: { web: 3 * 1048576, thumb: 512 * 1024, original: 25 * 1048576 },
  admin:   { web: 8 * 1048576, thumb: 1048576,    original: 100 * 1048576 },
};
const EXT = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/heic': 'heic', 'image/heif': 'heif' };
const URL_TTL_SECONDS = 600;

export function r2Config(env) {
  const cfg = {
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    publicBucket: env.R2_PUBLIC_BUCKET || 'wts-public',
    originalsBucket: env.R2_ORIGINALS_BUCKET || 'wts-originals',
    publicBaseUrl: (env.R2_PUBLIC_BASE_URL || '').replace(/\/+$/, ''),
  };
  cfg.endpoint = (env.R2_ENDPOINT || (cfg.accountId ? `https://${cfg.accountId}.r2.cloudflarestorage.com` : '')).replace(/\/+$/, '');
  cfg.ready = Boolean(cfg.endpoint && cfg.accessKeyId && cfg.secretAccessKey && cfg.publicBaseUrl);
  return cfg;
}

export function r2Client(cfg) {
  return new AwsClient({ accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey, service: 's3', region: 'auto' });
}

const encodeKey = (key) => key.split('/').map(encodeURIComponent).join('/');

export async function presignPut(client, cfg, bucket, key, contentType, contentLength) {
  const url = new URL(`${cfg.endpoint}/${bucket}/${encodeKey(key)}`);
  url.searchParams.set('X-Amz-Expires', String(URL_TTL_SECONDS));
  const signed = await client.sign(
    new Request(url, { method: 'PUT', headers: { 'content-type': contentType, 'content-length': String(contentLength) } }),
    { aws: { signQuery: true, allHeaders: true } }
  );
  return signed.url;
}

async function isAdmin(authorization, env) {
  const token = /^Bearer\s+(.+)$/i.exec(authorization || '')?.[1];
  const base = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const anon = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;
  if (!token || !base || !anon) return false;
  const headers = { apikey: anon, Authorization: `Bearer ${token}` };
  const userRes = await fetch(`${base}/auth/v1/user`, { headers });
  if (!userRes.ok) return false;
  const user = await userRes.json();
  if (!user?.id) return false;
  const adminRes = await fetch(`${base}/rest/v1/admin_users?select=user_id&user_id=eq.${encodeURIComponent(user.id)}`, { headers });
  if (!adminRes.ok) return false;
  const rows = await adminRes.json();
  return Array.isArray(rows) && rows.length > 0;
}

const badFile = (f) => !f || typeof f.type !== 'string' || !f.type.startsWith('image/') || !Number.isInteger(f.size) || f.size <= 0;

/**
 * Body: { folder, web: {type,size}, thumb: {type,size}, original?: {type,size} }
 * Returns { status, json }.
 */
export async function handleUploadUrl({ method, body, authorization, env }) {
  if (method !== 'POST') return { status: 405, json: { error: 'Use POST' } };
  const cfg = r2Config(env);
  if (!cfg.ready) return { status: 503, json: { error: 'R2 is not configured' } };

  const { folder, web, thumb, original } = body || {};
  if (typeof folder !== 'string' || !/^[a-z0-9-]{1,40}$/.test(folder)) return { status: 400, json: { error: 'Invalid folder' } };
  if (badFile(web) || badFile(thumb) || (original && badFile(original))) return { status: 400, json: { error: 'Images only' } };

  const admin = await isAdmin(authorization, env).catch(() => false);
  if (!admin && !PUBLIC_FOLDERS.includes(folder)) return { status: 403, json: { error: 'Admin login required' } };
  const limits = MAX_BYTES[admin ? 'admin' : 'visitor'];
  if (web.size > limits.web || thumb.size > limits.thumb) return { status: 413, json: { error: 'Image too large' } };
  const keepOriginal = original && original.size <= limits.original;

  const now = new Date();
  const base = `${folder}/${now.getUTCFullYear()}/${crypto.randomUUID()}`;
  const ext = EXT[web.type] || 'img';
  const webKey = `web/${base}.${ext}`;
  const thumbKey = `thumb/${base}.${ext}`;   // same name as web → thumbnail URL is derivable
  const client = r2Client(cfg);

  const uploads = [
    { part: 'web', url: await presignPut(client, cfg, cfg.publicBucket, webKey, web.type, web.size), contentType: web.type },
    { part: 'thumb', url: await presignPut(client, cfg, cfg.publicBucket, thumbKey, thumb.type, thumb.size), contentType: thumb.type },
  ];
  if (keepOriginal) {
    const origKey = `${base}.${EXT[original.type] || 'bin'}`;
    uploads.push({ part: 'original', url: await presignPut(client, cfg, cfg.originalsBucket, origKey, original.type, original.size), contentType: original.type });
  }

  return {
    status: 200,
    json: { uploads, publicUrl: `${cfg.publicBaseUrl}/${webKey}`, thumbUrl: `${cfg.publicBaseUrl}/${thumbKey}` },
  };
}
