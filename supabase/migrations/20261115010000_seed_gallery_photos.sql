-- =====================================================================
-- Migration: Seed 55 Official Tusker Images into gallery_photos
-- =====================================================================

alter table if exists public.gallery_photos alter column title drop not null;

-- Ensure RLS allows reading approved photos
drop policy if exists "Anyone can read approved gallery photos" on public.gallery_photos;
create policy "Anyone can read approved gallery photos"
  on public.gallery_photos for select
  to anon, authenticated
  using (status = 'approved');

-- Insert the 55 gallery photos
insert into public.gallery_photos (image_url, title, tusker_name, location, date, photographer, status, approved_at)
values
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Abaya_Kawdulla.jpg', 'T048 - Abhaya', 'T048 - Abhaya', 'Kaudulla', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Agbo_Mannakkatiya.JPG', 'T096 - Agbo', 'T096 - Agbo', 'Mannakkatiya', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Ananda_Mankkatiya.JPG', 'T108 - Ananda', 'T108 - Ananda', 'Mankkatiya', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Aravinda.jpg', 'T112 - Aravinda', 'T112 - Aravinda', 'Udawalawa', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Arjuna_Yala.JPG', 'T008 - Arjuna', 'T008 - Arjuna', 'Yala', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Arrita_Mahaviachciya.jpg', 'Arrita', 'Arrita', 'Mahaviachciya', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Asela1_Minneriya.jpg', 'T062 - Esala', 'T062 - Esala', 'Minneriya', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Asela2_Kalawewa.JPG', 'T063 - Esala II', 'T063 - Esala II', 'Kalawewa', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Ashoka_Minneriya.jpg', 'T161 - Ashoka', 'T161 - Ashoka', 'Minneriya', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Barana_Kalawewa.jpg', 'T057 - Barana', 'T057 - Barana', 'Kalawewa', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Chandi_Galgamuwa.jpg', 'T081 - Chandi', 'T081 - Chandi', 'Galgamuwa', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Chethiya_Yala_5.jpg', 'T023 - Chethiya', 'T023 - Chethiya', 'Yala 5', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Dappula_Kalawewa.JPG', 'T099 - Dappula', 'T099 - Dappula', 'Kalawewa', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Deega1_Kalawewa.jpg', 'T059 - Deega 1', 'T059 - Deega 1', 'Kalawewa', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Deega2_Kalawewa.jpg', 'T059 - Deega 1', 'T059 - Deega 1', 'Kalawewa', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Deegabaya_Mahaviachciya.jpg', 'Deegabaya', 'Deegabaya', 'Mahaviachciya', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Gajabahu_YanOya.jpg', 'T107 - Gajaba', 'T107 - Gajaba', 'YanOya', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Galagamuwa_Puttuwa_Galgamuwa.jpg', 'T074 - Puttuwa', 'T074 - Puttuwa', 'Galgamuwa', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Gamunu_Yala.jpg', 'T012 - Gamunu', 'T012 - Gamunu', 'Yala', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Kalinga_Kumana.jpg', 'T026 - Kalinga', 'T026 - Kalinga', 'Kumana', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Kali_Wilpattu.jpg', 'T026 - Kalinga', 'T026 - Kalinga', 'Wilpattu', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Kashayapa_Bundala.jpg', 'Kashayapa', 'Kashayapa', 'Bundala', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Kashyapa_Yala.JPG', 'T015 - Kashyapa', 'T015 - Kashyapa', 'Yala', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Kavantissa_galgamuwa.jpg', 'T246 - Kavan', 'T246 - Kavan', 'galgamuwa', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Koliya_Kawdulla.jpg', 'T189 - Koliya', 'T189 - Koliya', 'Kawdulla', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Lankeshwara_Huruluwewa.jpg', 'T295 - Lankeshwara', 'T295 - Lankeshwara', 'Huruluwewa', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Lokeshwara_Yala.jpg', 'T020 - Lokeshwara', 'T020 - Lokeshwara', 'Yala', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Mahasena_Lunugamwehera.jpg', 'T005 - Mahasen', 'T005 - Mahasen', 'Lunugamwehera', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Mahasen_Minneriya.jpg', 'T005 - Mahasen', 'T005 - Mahasen', 'Minneriya', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Mangala_Kalawewa.JPG', 'T064 - Mangala', 'T064 - Mangala', 'Kalawewa', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Migara_Maruoya.jpg', 'T151 - Migara', 'T151 - Migara', 'Maruoya', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Missaka_Galgamuwa2.JPG', 'T078 - Missaka', 'T078 - Missaka', 'Galgamuwa', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Mithra_Manakkatiya.jpg', 'T010 - Nandimithra', 'T010 - Nandimithra', 'Manakkatiya', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Mugalan_Udawalawe.JPG', 'T111 - Mugalan', 'T111 - Mugalan', 'Udawalawe', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Nalaka_Yala.jpg', 'T009 - Nalaka', 'T009 - Nalaka', 'Yala', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Nandamithra_Yala.JPG', 'T103 - Mithra', 'T103 - Mithra', 'Yala', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Neela_Kalawewa.jpg', 'T058 - Neela', 'T058 - Neela', 'Kalawewa', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Panduka_Galgamuwa.JPG', 'T083 - Panduka', 'T083 - Panduka', 'Galgamuwa', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Parinda_Yala.jpg', 'T162 - Parinda', 'T162 - Parinda', 'Yala', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Podi_Dananjaya_Yala.jpg', 'T017 - Podi Dananjaya', 'T017 - Podi Dananjaya', 'Yala', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Ragu_Galgamuwa.JPG', 'Ragu', 'Ragu', 'Galgamuwa', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Rathaka_Galgamuwa.JPG', 'Rathaka', 'Rathaka', 'Galgamuwa', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Ratta_Galgamuwa.jpg', 'T079 - Ratta', 'T079 - Ratta', 'Galgamuwa', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Rewatha_Kalawewa.JPG', 'Rewatha', 'Rewatha', 'Kalawewa', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Sando_Yala.JPG', 'T011 - Sando', 'T011 - Sando', 'Yala', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Sapumal_Kawdulla.jpg', 'T047 - Sapumal', 'T047 - Sapumal', 'Kawdulla', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Soorya_Mahawilachchiya.JPG', 'T132 - Soorya', 'T132 - Soorya', 'Mahawilachchiya', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Sumedha_Minneriya.jpg', 'T038 - Sumedha', 'T038 - Sumedha', 'Minneriya', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Theekke_Raja_Galgamuwa.jpg', 'Theekke Raja', 'Theekke Raja', 'Galgamuwa', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Tissa_Lunugamwehera.jpg', 'Tissa', 'Tissa', 'Lunugamwehera', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Unicorn_Minneriya.jpg', 'T039 - Unicorn', 'T039 - Unicorn', 'Minneriya', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Walaganba_Karuwalagaswewa.jpeg', 'Walaganba', 'Walaganba', 'Karuwalagaswewa', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Wijaya_Kalawewa.jpg', 'T072 - Wijaya', 'T072 - Wijaya', 'Kalawewa', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Wijaya_WIlpattu.jpg', 'T072 - Wijaya', 'T072 - Wijaya', 'WIlpattu', '2026-11-15', 'WTS Admin', 'approved', now()),
  ('https://ysloiyecqryftybzcujh.supabase.co/storage/v1/object/public/wts-media/gallery/Yasa_Kalawewa.JPG', 'T069 - Yasa', 'T069 - Yasa', 'Kalawewa', '2026-11-15', 'WTS Admin', 'approved', now());
