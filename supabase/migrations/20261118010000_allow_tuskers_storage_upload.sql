-- =====================================================================
-- Migration: Allow Storage Uploads to 'tuskers' and Increase File Size Limit to 50MB
-- =====================================================================

-- 1. Increase bucket file size limit to 50MB so high-res DSLR wildlife photos upload smoothly
update storage.buckets
set file_size_limit = 52428800
where id = 'wts-media';

-- 2. Allow upload to 'tuskers' and 'unlisted' folders in wts-media bucket
drop policy if exists "Anyone can upload to media folders" on storage.objects;
create policy "Anyone can upload to media folders"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'wts-media'
    and (storage.foldername(name))[1] in ('field-notes', 'gallery', 'special-observations', 'team', 'tuskers', 'unlisted')
  );

-- 3. Ensure public read access for all objects in wts-media
drop policy if exists "Anyone can read media" on storage.objects;
create policy "Anyone can read media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'wts-media');

-- 4. Allow updating tuskers photos array
drop policy if exists "Anyone can update tusker photos" on public.tuskers;
create policy "Anyone can update tusker photos"
  on public.tuskers for update
  to anon, authenticated
  using (true)
  with check (true);
