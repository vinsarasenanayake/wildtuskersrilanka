-- =====================================================================
-- Migration: Empty Field Notes, Projects/Events, and Special Observations
-- and configure storage policies for direct attachments
-- =====================================================================

-- 1. Empty tables so they start fresh
truncate table public.field_notes restart identity cascade;
truncate table public.events restart identity cascade;
truncate table public.special_observations restart identity cascade;

-- 2. Storage upload permissions for all attachment folders
drop policy if exists "Anyone can upload to media folders" on storage.objects;
create policy "Anyone can upload to media folders"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'wts-media'
    and (storage.foldername(name))[1] in ('field-notes', 'gallery', 'special-observations', 'team')
  );

