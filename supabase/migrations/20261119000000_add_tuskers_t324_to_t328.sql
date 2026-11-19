-- =====================================================================
-- Migration: Add New Tuskers (T324 - T328)
-- Generated on 2026-11-19
-- =====================================================================

insert into public.tuskers (
  id, name, location, living_status, death_year, death_reason,
  last_seen_area, zone, district, province, last_seen, age_range,
  health_condition, threat_level, remarks, photos
) values
  ('T324', 'Dhanuraja', 'Butthala / Wellawaya / Okkampitiya', 'Alive', null, null, 'Buttala', 'Zone 1', 'Monaragala', 'Uva', '2026-11-01', '20-30', 'Good', 'Low', null, '{}'),
  ('T325', 'Veerabahu', 'Butthala / Wellawaya / Okkampitiya', 'Alive', null, null, 'Buttala', 'Zone 1', 'Monaragala', 'Uva', '2026-11-01', '20-30', 'Good', 'Low', null, '{}'),
  ('T326', 'Chandragiri', 'Butthala / Wellawaya / Handapanagala', 'Alive', null, null, 'Buttala', 'Zone 1', 'Monaragala', 'Uva', '2026-11-01', '30-40', 'Good', 'Low', null, '{}'),
  ('T327', 'Sahas', 'Butthala / Wellawaya / Lunugamvehera', 'Alive', null, null, 'Buttala', 'Zone 1', 'Monaragala', 'Uva', '2026-11-01', '20-30', 'Good', 'Low', null, '{}'),
  ('T328', 'Prabash', 'Maha Kanadarawa / Mihinthale / Rambawa', 'Alive', null, null, 'Maha kanadarawa', 'Zone 3', 'Anuradhapura', 'North - Central', '2026-10-01', '10-20', 'Good', 'Low', null, '{}')
on conflict (id) do update set
  name = excluded.name,
  location = excluded.location,
  living_status = excluded.living_status,
  last_seen_area = excluded.last_seen_area,
  zone = excluded.zone,
  district = excluded.district,
  province = excluded.province,
  last_seen = excluded.last_seen,
  age_range = excluded.age_range,
  health_condition = excluded.health_condition,
  threat_level = excluded.threat_level;
