-- =====================================================================
-- Photo uploads: web copies + thumbnails in Supabase Storage
--
-- Uploads are now saved as  web/<folder>/…  and  thumb/<folder>/…
-- Visitors may upload only for their own submissions (gallery and field
-- notes). Admins can upload anywhere (existing "Admins manage media" policy).
-- Run once in Supabase → SQL Editor. Safe to run again.
-- =====================================================================
drop policy if exists "Visitors can upload field note photos" on storage.objects;
drop policy if exists "Visitors can upload submission photos" on storage.objects;

create policy "Visitors can upload submission photos"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'wts-media'
    and (
      (storage.foldername(name))[1] in ('field-notes', 'fieldnotes', 'gallery')
      or (
        (storage.foldername(name))[1] in ('web', 'thumb')
        and (storage.foldername(name))[2] in ('field-notes', 'fieldnotes', 'gallery')
      )
    )
  );
