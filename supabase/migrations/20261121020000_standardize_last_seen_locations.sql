-- Migration: Standardize last_seen_area locations to official Google Maps / Survey Dept names
-- Date: 2026-11-21

UPDATE public.tuskers SET last_seen_area = 'Ethimale' WHERE last_seen_area = 'Athimale';
UPDATE public.tuskers SET last_seen_area = 'Udawalawe' WHERE last_seen_area = 'Udawalawa';
UPDATE public.tuskers SET last_seen_area = 'Kebithigollewa' WHERE last_seen_area = 'Kabithigollewa';
UPDATE public.tuskers SET last_seen_area = 'Tirappane' WHERE last_seen_area = 'Thirappane';
UPDATE public.tuskers SET last_seen_area = 'Nawagattegama' WHERE last_seen_area = 'Nawagaththegama';
UPDATE public.tuskers SET last_seen_area = 'Mahakumbukkadawala' WHERE last_seen_area = 'Mahakubukkadawala';
UPDATE public.tuskers SET last_seen_area = 'Maha Kanadarawa' WHERE last_seen_area = 'Mahakanadarawa';
UPDATE public.tuskers SET last_seen_area = 'Maha Kanadarawa' WHERE last_seen_area = 'Mahakanadarawa forest side';
UPDATE public.tuskers SET last_seen_area = 'Maha Kanadarawa' WHERE last_seen_area = 'Maha kanadarawa';
UPDATE public.tuskers SET last_seen_area = 'Kekirawa' WHERE last_seen_area = 'Kakirawa';
UPDATE public.tuskers SET last_seen_area = 'Hurulu Eco Park' WHERE last_seen_area = 'Eco park';
UPDATE public.tuskers SET last_seen_area = 'Hurulu Eco Park' WHERE last_seen_area = 'Eco Park';
UPDATE public.tuskers SET last_seen_area = 'Kantale' WHERE last_seen_area = 'Kanthale';
UPDATE public.tuskers SET last_seen_area = 'Kala Wewa' WHERE last_seen_area = 'Kala wewa';
UPDATE public.tuskers SET last_seen_area = 'Hurulu Wewa' WHERE last_seen_area = 'Hurulu wewa';
UPDATE public.tuskers SET last_seen_area = 'Horowpathana' WHERE last_seen_area = 'Horopathana EHG';
UPDATE public.tuskers SET last_seen_area = 'Hulannuge' WHERE last_seen_area = 'Hulan nuge';
UPDATE public.tuskers SET last_seen_area = 'Deegawapiya' WHERE last_seen_area = 'Deegawapi';
UPDATE public.tuskers SET last_seen_area = 'Maduru Oya' WHERE last_seen_area = 'Maduru oya';
UPDATE public.tuskers SET last_seen_area = 'Tabbowa' WHERE last_seen_area = 'Thabbowa';
UPDATE public.tuskers SET last_seen_area = 'Vidattaltivu' WHERE last_seen_area = 'Vedithalathiv';
UPDATE public.tuskers SET last_seen_area = 'Mihintale' WHERE last_seen_area = 'Mihinthale';
UPDATE public.tuskers SET last_seen_area = 'Batticaloa' WHERE last_seen_area = 'Batticoloa';
UPDATE public.tuskers SET last_seen_area = 'Hambantota' WHERE last_seen_area = 'Hambanthota';
UPDATE public.tuskers SET last_seen_area = 'Pomparippu' WHERE last_seen_area = 'Wilpattu / Pomparippu / Silavathura';
