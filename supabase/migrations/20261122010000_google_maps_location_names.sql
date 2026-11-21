-- Migration: Use the Google Maps spelling for tusker location names
-- Date: 2026-11-22
--
-- Run this AFTER all earlier migrations (it must be the last one).
-- It only renames place names that Google Maps spells differently.
-- Each name is matched as a whole word, so nothing else in the text changes,
-- and running it twice is harmless.
--
--   Deegawapiya / Deeghavapi / Deegawapi  -> Deegavapiya
--   Digampathana                          -> Diganpathaha
--   Malsiripura                           -> Melsiripura
--   Suriyapura                            -> Sooriyapura
--   Tabbowa                               -> Thabbowa
--   Tantirimale / Tanthirimale            -> Thanthirimale
--   Tirappane / Thirapane                 -> Thirappane
--   Vidattaltivu / Vedithalathiv          -> Vidataltivu
--   Sithulpawwa                           -> Situlpawwa
--   Wilachchiya / Maha Wilachchiya        -> Mahawilachchiya
--   Mannankattiya / Mannakkattiya         -> Manankattiya
--   Nimalawa Sanctuary                    -> Nimalawa Wildlife Sanctuary
--
-- It also fixes older misspellings that still appear in gallery photos,
-- sightings or other records (for example Kalawewa -> Kala Wewa,
-- Kawdulla -> Kaudulla, Maruoya -> Maduru Oya, Udawalawa -> Udawalawe),
-- and fixes capital letters (for example galgamuwa -> Galgamuwa, WIlpattu -> Wilpattu).

create or replace function pg_temp.google_place_names(txt text)
returns text
language plpgsql
immutable
as $$
declare
  r record;
  out_txt text := txt;
begin
  if out_txt is null or out_txt = '' then
    return out_txt;
  end if;
  for r in
    select * from (values
    ('Maha Wilachchiya', 'Mahawilachchiya'),
    ('Wilachchiya', 'Mahawilachchiya'),
    ('Deegawapiya', 'Deegavapiya'),
    ('Deeghavapi', 'Deegavapiya'),
    ('Deegawapi', 'Deegavapiya'),
    ('Digampathana', 'Diganpathaha'),
    ('Malsiripura', 'Melsiripura'),
    ('Suriyapura', 'Sooriyapura'),
    ('Tabbowa', 'Thabbowa'),
    ('Tantirimale', 'Thanthirimale'),
    ('Tanthirimale', 'Thanthirimale'),
    ('Tirappane', 'Thirappane'),
    ('Thirapane', 'Thirappane'),
    ('Vidattaltivu', 'Vidataltivu'),
    ('Vedithalathiv', 'Vidataltivu'),
    ('Sithulpawwa', 'Situlpawwa'),
    ('Mannankattiya', 'Manankattiya'),
    ('Mannakkattiya', 'Manankattiya'),
    ('Nimalawa Sanctuary', 'Nimalawa Wildlife Sanctuary'),
    ('Athimale Wewa', 'Ethimale Wewa'),
    ('Athimale', 'Ethimale'),
    ('Mawara', 'Mau Ara'),
    ('Anganmadiila', 'Angammedilla'),
    ('Bundangala', 'Buddhangala'),
    ('Toppigala', 'Thoppigala'),
    ('Saagama', 'Sagama'),
    ('Sasthrawela', 'Shasthrawela'),
    ('Galoya', 'Gal Oya'),
    ('Silavathura', 'Silavathurai'),
    ('Eluwankulam', 'Eluwankulama'),
    ('Mahakandarawa', 'Mahakanadarawa'),
    ('Mahakanadara', 'Mahakanadarawa'),
    ('Maha Kanadarawa', 'Mahakanadarawa'),
    ('Kabithigollewa', 'Kebithigollewa'),
    ('Kebathigollewa', 'Kebithigollewa'),
    ('Nawagaththegama', 'Nawagattegama'),
    ('Nawagathegama', 'Nawagattegama'),
    ('Karuwagaswewa', 'Karuwalagaswewa'),
    ('Karuwalgaswewa', 'Karuwalagaswewa'),
    ('Mahakubukkadawala', 'Mahakumbukkadawala'),
    ('Hambanthota', 'Hambantota'),
    ('Butthala', 'Buttala'),
    ('Udawalawa', 'Udawalawe'),
    ('Kakirawa', 'Kekirawa'),
    ('Lunugamwehera', 'Lunugamvehera'),
    ('Rambawa', 'Rambewa'),
    ('Tabbuwa', 'Thabbowa'),
    ('Kawdulla', 'Kaudulla'),
    ('Kalawewa', 'Kala Wewa'),
    ('Huruluwewa', 'Hurulu Wewa'),
    ('Mahaviachciya', 'Mahawilachchiya'),
    ('Mankkatiya', 'Manankattiya'),
    ('Mannakkatiya', 'Manankattiya'),
    ('Maruoya', 'Maduru Oya'),
    ('Manakkatiya', 'Manankattiya'),
    ('YanOya', 'Yan Oya'),
    ('Ampara', 'Ampara'),
    ('Anamaduwa', 'Anamaduwa'),
    ('Angammedilla', 'Angammedilla'),
    ('Anuradhapura', 'Anuradhapura'),
    ('Aralaganwila', 'Aralaganwila'),
    ('Balalu Wewa', 'Balalu Wewa'),
    ('Batticaloa', 'Batticaloa'),
    ('Buddhangala', 'Buddhangala'),
    ('Bundala', 'Bundala'),
    ('Buttala', 'Buttala'),
    ('Chenkaladi', 'Chenkaladi'),
    ('Damana', 'Damana'),
    ('Deegavapiya', 'Deegavapiya'),
    ('Diganpathaha', 'Diganpathaha'),
    ('Eluwankulama', 'Eluwankulama'),
    ('Ethimale', 'Ethimale'),
    ('Gal Oya', 'Gal Oya'),
    ('Galenbindunuwewa', 'Galenbindunuwewa'),
    ('Galgamuwa', 'Galgamuwa'),
    ('Galge', 'Galge'),
    ('Gomarankadawala', 'Gomarankadawala'),
    ('Habarana', 'Habarana'),
    ('Hambantota', 'Hambantota'),
    ('Handapanagala', 'Handapanagala'),
    ('Horowpathana', 'Horowpathana'),
    ('Hulannuge', 'Hulannuge'),
    ('Hurulu Eco Park', 'Hurulu Eco Park'),
    ('Hurulu Wewa', 'Hurulu Wewa'),
    ('Inginiyagala', 'Inginiyagala'),
    ('Kahatagasdigiliya', 'Kahatagasdigiliya'),
    ('Kala Wewa', 'Kala Wewa'),
    ('Kantale', 'Kantale'),
    ('Karuwalagaswewa', 'Karuwalagaswewa'),
    ('Kaudulla', 'Kaudulla'),
    ('Kebithigollewa', 'Kebithigollewa'),
    ('Kekirawa', 'Kekirawa'),
    ('Kossapola', 'Kossapola'),
    ('Kukulkatuwa', 'Kukulkatuwa'),
    ('Kumana', 'Kumana'),
    ('Lahugala', 'Lahugala'),
    ('Lunugamvehera', 'Lunugamvehera'),
    ('Madu', 'Madu'),
    ('Maduru Oya', 'Maduru Oya'),
    ('Maha Oya', 'Maha Oya'),
    ('Mahakanadarawa', 'Mahakanadarawa'),
    ('Mahakumbukkadawala', 'Mahakumbukkadawala'),
    ('Mahawilachchiya', 'Mahawilachchiya'),
    ('Manampitiya', 'Manampitiya'),
    ('Manankattiya', 'Manankattiya'),
    ('Mattala', 'Mattala'),
    ('Mau Ara', 'Mau Ara'),
    ('Medawachchiya', 'Medawachchiya'),
    ('Melsiripura', 'Melsiripura'),
    ('Mihintale', 'Mihintale'),
    ('Minneriya', 'Minneriya'),
    ('Mullikulam', 'Mullikulam'),
    ('Nachchaduwa', 'Nachchaduwa'),
    ('Naval Headworks Sanctuary', 'Naval Headworks Sanctuary'),
    ('Nawagattegama', 'Nawagattegama'),
    ('Nimalawa Wildlife Sanctuary', 'Nimalawa Wildlife Sanctuary'),
    ('Nuwaragala', 'Nuwaragala'),
    ('Okkampitiya', 'Okkampitiya'),
    ('Padaviya', 'Padaviya'),
    ('Palugaswewa', 'Palugaswewa'),
    ('Panama', 'Panama'),
    ('Pelwatta', 'Pelwatta'),
    ('Polonnaruwa', 'Polonnaruwa'),
    ('Pomparippu', 'Pomparippu'),
    ('Pothana', 'Pothana'),
    ('Pottuvil', 'Pottuvil'),
    ('Puttalam', 'Puttalam'),
    ('Rambewa', 'Rambewa'),
    ('Ritigala', 'Ritigala'),
    ('Sagama', 'Sagama'),
    ('Sengamuwa', 'Sengamuwa'),
    ('Shasthrawela', 'Shasthrawela'),
    ('Silavathurai', 'Silavathurai'),
    ('Situlpawwa', 'Situlpawwa'),
    ('Somawathiya', 'Somawathiya'),
    ('Sooriyapura', 'Sooriyapura'),
    ('Thabbowa', 'Thabbowa'),
    ('Thalawa', 'Thalawa'),
    ('Thanthirimale', 'Thanthirimale'),
    ('Thirappane', 'Thirappane'),
    ('Thoppigala', 'Thoppigala'),
    ('Trincomalee', 'Trincomalee'),
    ('Udawalawe', 'Udawalawe'),
    ('Vidataltivu', 'Vidataltivu'),
    ('Wahalkada', 'Wahalkada'),
    ('Wasgamuwa', 'Wasgamuwa'),
    ('Weerawila', 'Weerawila'),
    ('Welikanda', 'Welikanda'),
    ('Wellawaya', 'Wellawaya'),
    ('Wilpattu', 'Wilpattu'),
    ('Yala', 'Yala'),
    ('Yala Block 3', 'Yala Block 3'),
    ('Yala Block 5', 'Yala Block 5'),
    ('Yala Block 6', 'Yala Block 6')
    ) as m(old_name, new_name)
  loop
    out_txt := regexp_replace(out_txt, '\m' || r.old_name || '\M', r.new_name, 'gi');
  end loop;
  return out_txt;
end;
$$;

-- Tusker roaming areas and last seen areas
update public.tuskers
   set location = pg_temp.google_place_names(location)
 where location is distinct from pg_temp.google_place_names(location);

update public.tuskers
   set last_seen_area = pg_temp.google_place_names(last_seen_area)
 where last_seen_area is distinct from pg_temp.google_place_names(last_seen_area);

-- Other tables that store a place name
update public.unlisted_tuskers
   set location = pg_temp.google_place_names(location)
 where location is distinct from pg_temp.google_place_names(location);

update public.special_observations
   set location = pg_temp.google_place_names(location)
 where location is distinct from pg_temp.google_place_names(location);

update public.gallery_photos
   set location = pg_temp.google_place_names(location)
 where location is distinct from pg_temp.google_place_names(location);

update public.sighting_locations
   set location_name = pg_temp.google_place_names(location_name)
 where location_name is distinct from pg_temp.google_place_names(location_name);

-- Gallery photo labelled with the short form of a Yala block
update public.gallery_photos set location = 'Yala Block 5' where location = 'Yala 5';

-- Sighting notes are stored as JSON text: only the "location" field is changed.
do $$
declare
  s record;
  j jsonb;
  fixed text;
begin
  for s in select id, note from public.tusker_sightings where note like '{%' loop
    begin
      j := s.note::jsonb;
    exception when others then
      continue; -- not JSON: leave untouched
    end;
    if jsonb_typeof(j -> 'location') = 'string' then
      fixed := pg_temp.google_place_names(j ->> 'location');
      if fixed is distinct from (j ->> 'location') then
        update public.tusker_sightings
           set note = jsonb_set(j, '{location}', to_jsonb(fixed))::text
         where id = s.id;
      end if;
    end if;
  end loop;
end;
$$;
