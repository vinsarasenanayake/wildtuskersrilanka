-- Clear all tusker profile photos while leaving gallery_photos untouched
UPDATE public.tuskers
SET photos = '{}', ear_photos = '{}';
