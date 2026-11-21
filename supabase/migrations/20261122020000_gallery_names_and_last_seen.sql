-- Migration: QA fixes (gallery tusker names, Situlpawwa)
-- Date: 2026-11-22
-- Safe to run more than once.

-- 1. Gallery photos labelled "T048 - Abhaya" etc. now use the exact name
--    from the tusker list (e.g. "T048 - Abaya"). Only single-tusker labels
--    in the form "T### - Name" are touched.
update public.gallery_photos g
   set tusker_name = t.id || ' - ' || t.name
  from public.tuskers t
 where g.tusker_name ~ '^T[0-9]{3} - [^,]+$'
   and t.id = substring(g.tusker_name from '^(T[0-9]{3})')
   and g.tusker_name <> t.id || ' - ' || t.name;

update public.gallery_photos g
   set title = t.id || ' - ' || t.name
  from public.tuskers t
 where g.title ~ '^T[0-9]{3} - [^,]+$'
   and t.id = substring(g.title from '^(T[0-9]{3})')
   and g.title <> t.id || ' - ' || t.name;

-- 2. Last seen "Situlpawwa Road" -> "Situlpawwa" (Google Maps place name)
update public.tuskers
   set last_seen_area = regexp_replace(last_seen_area, '\mSitulpawwa Road\M', 'Situlpawwa', 'gi')
 where last_seen_area ~* '\mSitulpawwa Road\M';
