# Photo storage — Cloudflare R2

Photos are stored on Cloudflare R2 (free up to 10 GB, no charge for visitors viewing them).
Supabase keeps the data and the admin login.

Every uploaded photo is saved three ways:

| Version | Bucket | Size | Used for |
|---|---|---|---|
| Original (untouched) | `wts-originals` (private) | 3–10 MB | Research, zooming into details |
| Web copy (1920 px) | `wts-public` → `/web/…` | ~200–400 KB | Opening a photo on the site |
| Thumbnail (480 px) | `wts-public` → `/thumb/…` | ~10–50 KB | List and gallery cards |

## One-time setup
1. **R2 bucket CORS** — for **both** buckets: R2 → bucket → **Settings → CORS Policy → Add**, paste:
   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:5173", "https://wildtuskersrilanka.vercel.app"],
       "AllowedMethods": ["PUT", "GET"],
       "AllowedHeaders": ["content-type"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
   (On launch week add `"https://wildtuskers.lk"` and `"https://www.wildtuskers.lk"` to `AllowedOrigins`.)
2. **Keys** — copy `.env.example` lines into `.env.local` and fill them in.
3. **Vercel** → Settings → Environment Variables → add `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
   `R2_SECRET_ACCESS_KEY`, `R2_PUBLIC_BUCKET`, `R2_ORIGINALS_BUCKET`, `R2_PUBLIC_BASE_URL`.
   **Do not** add `SUPABASE_SERVICE_ROLE_KEY` to Vercel.

## Move existing photos from Supabase (one time)
```
npm install
npm run images:migrate              # preview — changes nothing
npm run images:migrate -- --apply   # do it (safe to re-run; retries failures)
```
Check the site. When everything looks right, free the Supabase space:
```
npm run images:migrate -- --cleanup
```

## Launch week — switch to your own domain
1. Cloudflare → R2 → `wts-public` → Settings → **Custom Domains → Connect** → `images.wildtuskers.lk`
2. `npm run images:switch-domain -- https://images.wildtuskers.lk` (preview), then add `--apply`
3. Set `R2_PUBLIC_BASE_URL=https://images.wildtuskers.lk` in `.env.local` and Vercel → redeploy.
4. Turn off the `r2.dev` Public Development URL.

## Notes
- `scripts/upload_tusker_photos*.js` upload full-size photos straight to Supabase. Prefer the admin
  portal; if you do use them, run `npm run images:migrate -- --apply` afterwards.
- If R2 isn't configured (e.g. missing keys), uploads automatically fall back to Supabase Storage.
