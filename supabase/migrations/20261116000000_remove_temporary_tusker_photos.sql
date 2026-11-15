-- =====================================================================
-- Migration: Remove temporary list images & comparisons
-- Preserves all Gallery photos. Starts Unlisted Monitoring completely empty.
-- =====================================================================

-- 1. Ensure Unlisted Monitoring is completely empty for fresh additions
truncate table public.unlisted_tuskers restart identity cascade;

-- 2. Remove temporary photographic comparison & ear biometrics from Kawanthissa (T075)
update public.tuskers
set 
  photos = '{}',
  ear_photos = '{}',
  photographic_comparison = null,
  ear_comparison = null
where id = 'T075';

-- 3. Remove temporary list photos added yesterday (keep gallery photos intact)
update public.tuskers
set photos = '{}'
where id in ('T013', 'T041', 'T078', 'T096', 'T177', 'T180', 'T204', 'T294');

