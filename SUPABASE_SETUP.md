# Supabase setup — Wild Tuskers Sri Lanka

The site now reads and writes all data through Supabase instead of the browser's `localStorage`.

## 1. Create the project
1. Go to <https://supabase.com/dashboard> → **New project** (pick the **Singapore** region, the closest to Sri Lanka).
2. Wait for it to finish provisioning.

## 2. Create the tables and load the data
In **SQL Editor → New query**, paste and run these files **in order**:

1. `supabase/migrations/20261114000000_init_schema.sql`: tables, security rules, image storage bucket
2. `supabase/migrations/20261114010000_tusker_registry_fields.sql`: living status, last seen, zone, threat level and the other registry columns
3. `supabase/seed.sql`: the official tusker list (323 tuskers) plus starter observations, field notes and events

All three can safely be run again.

### Already set up before the full tusker list was added?
Run these two in order instead of the seed:

1. `supabase/migrations/20261114010000_tusker_registry_fields.sql`
2. `supabase/data/20261114_import_full_tusker_list.sql`: replaces the 20 demo tuskers and loads all 323 from `Full_list.xlsx`. Re-running it updates the list fields but keeps descriptions, photos and Sinhala names you've added.

## 3. Create the admin login
1. **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up" (only you should have an account).
2. **Authentication → Users → Add user → Create new user**: enter your admin email and a strong password, and tick **Auto Confirm User**.
3. Back in the **SQL Editor**, run this to make that user an admin:
   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'YOUR-ADMIN-EMAIL';
   ```

The old `admin@wildtuskers.lk / admin123` login is gone. Sign in at `/login` with the account above.

## 4. Connect the React app
1. **Project Settings → API Keys** (or the **Connect** button): copy the **Project URL** and the **anon / publishable** key.
2. Copy `.env.example` to `.env.local` and paste the two values in.
3. Run:
   ```bash
   npm install
   npm run dev
   ```

> Never put the `service_role` / secret key in the React app. The anon key is safe in the browser because Row Level Security limits what it can do.

## 5. When you deploy
Add the same two variables, `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, in your host's environment settings (Vercel, Netlify, etc.), then redeploy.

## Who can do what

| | Visitors | Admin |
|---|---|---|
| Tuskers, sightings, special observations, events | read | full edit |
| Field notes | read approved notes; submit new ones (they stay **pending** until approved) | approve, reject, delete, publish directly |
| Contributor email on field notes | hidden | visible |
| Unlisted tuskers | no access | full edit |
| Photo uploads (bucket `wts-media`) | `field-notes/` folder only, images up to 5 MB | everything |

## Tables
`tuskers` (official registry: status, last seen, zone/district/province, age, health, threat level, remarks), `tusker_sightings`, `unlisted_tuskers`, `special_observations`, `field_notes`, `events`, `admin_users`

## Note
Changes you made in your own browser while testing (stored in `localStorage`) are not copied over. Only the default data in `seed.sql` is loaded.
