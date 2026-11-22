-- Migration: Update T220 to T249 details and Insert T329 (Thejas) & T330 (Manik)
-- Generated: 2026-11-23

-- T220 - Mahathissa
UPDATE public.tuskers
SET
  name = 'Mahathissa',
  sinhala = 'මහාතිස්ස',
  listed_date = '2021-01-01',
  location = 'Wilpattu / Karuwalagaswewa / Puttalam / Tabbowa'
WHERE id = 'T220';

-- T221 - Saman
UPDATE public.tuskers
SET
  name = 'Saman',
  sinhala = 'සමන්',
  listed_date = '2018-01-01',
  location = 'Yala / Kumana / Panama / Lunugamvehera / Lahugala'
WHERE id = 'T221';

-- T222 - Hudanchi
UPDATE public.tuskers
SET
  name = 'Hudanchi',
  sinhala = 'හුඩංචි',
  listed_date = '2021-01-01',
  location = 'Yala / Kumana / Panama / Lunugamvehera / Lahugala',
  description = 'Named in remembrance of Palani Hudanchi Appu, a dedicated wildlife ranger who worked in Kumana National Park, born in Kumana village, who retired in the 1980s.'
WHERE id = 'T222';

-- T223 - Nishan
UPDATE public.tuskers
SET
  name = 'Nishan',
  sinhala = 'නිශාන්',
  listed_date = '2021-01-01',
  location = 'Yala / Kumana / Panama / Lunugamvehera / Lahugala'
WHERE id = 'T223';

-- T224 - Janith
UPDATE public.tuskers
SET
  name = 'Janith',
  sinhala = 'ජනිත්',
  listed_date = '2021-01-01',
  location = 'Yala / Kumana / Panama / Lunugamvehera / Lahugala'
WHERE id = 'T224';

-- T225 - Mansoor
UPDATE public.tuskers
SET
  name = 'Mansoor',
  sinhala = 'මංසුර්',
  listed_date = '2021-01-01',
  location = 'Yala / Kumana / Panama / Lunugamvehera / Lahugala / Arugam Bay',
  description = 'In remembrance of brave wildlife officer, Mr. Manzoor, who passed away due to an elephant attack on an elephant relocation mission.

වනජීවී දෙපාර්තමේන්තු රාජකාරියකදී දිවිපිදු මංසුර් මහතා සිහිවීම පිණිස මෙම ඇත් පැටවා නම් කර ඇත.'
WHERE id = 'T225';

-- T226 - Luhul
UPDATE public.tuskers
SET
  name = 'Luhul',
  sinhala = 'ලුහුල්',
  listed_date = '2022-01-01',
  location = 'Yala / Kumana / Panama / Lunugamvehera / Lahugala'
WHERE id = 'T226';

-- T227 - Shantha
UPDATE public.tuskers
SET
  name = 'Shantha',
  sinhala = 'ශාන්ත',
  listed_date = '2022-01-01',
  location = 'Yala / Kumana / Panama / Lunugamvehera / Lahugala'
WHERE id = 'T227';

-- T228 - Vijitha
UPDATE public.tuskers
SET
  name = 'Vijitha',
  sinhala = 'විජිත',
  location = 'Udawalawe / Hambegamuwa'
WHERE id = 'T228';

-- T229 - Gamini
UPDATE public.tuskers
SET
  name = 'Gamini',
  sinhala = 'ගාමිණි',
  listed_date = '2021-01-01',
  location = 'Ampara / Buddhangala',
  recorded_by = 'Wasantha Dissanayaka - DWC',
  nickname_given_by = 'Wasantha Dissanayaka - DWC',
  description = '1981 වර්ෂයේදී වන සත්ව අඩවි ආරක්ෂක නිලධාරියෙකු ලෙස එවකට යාල නැගෙනහිර උද්‍යානයෙන් වනජීවී සංරක්ෂණ දෙපාර්තමේන්තුවේ රාජකාරි දිවිය ආරම්භ කල ගාමිණි විජිත් සමරකෝන් මහතා පසු කලෙක වනජීවී නිලධාරීන්හට පරමාදර්ශී චරිතයක් විය.

එතුමා නැගෙනහිර කලාපයේ සහකාර අධ්‍යක්ෂ ලෙස (2002 - 2008) සේවය කල අවධියේ කුමන හා ලාහුගල ජාතික උද්‍යාන වල වපසරිය වැඩි කිරීම, කුඩුම්බිගල, පානම අභයභූමිය හා කුමන ජාතික උද්‍යානය පස්වන රැම්සා තෙත්බිම ලෙස ප්‍රකාශයට පත් කිරීමට මූලිකත්වය ගනිමින් වනජීවී සංරක්ෂණය උදෙසා සිදුකල අමිල මෙහෙවරට උපහාරයක් ලෙස මෙම තරුණ හස්තියාට "ගාමිණී" ලෙස නම් තබමි.'
WHERE id = 'T229';

-- T230 - Barana
UPDATE public.tuskers
SET
  name = 'Barana',
  sinhala = 'බරණ',
  listed_date = '2022-01-01',
  location = 'Mahakanadarawa / Mahawilachchiya / Kebithigollewa',
  description = 'Name suggested by the photographer in remembrance of late tusker Barana of Kala Wewa.'
WHERE id = 'T230';

-- T231 - Luwara
UPDATE public.tuskers
SET
  name = 'Luwara',
  sinhala = 'ලූවර',
  listed_date = '2022-01-01',
  location = 'Yala / Kumana / Panama / Lunugamvehera / Lahugala',
  recorded_by = 'Bandara Nishantha',
  nickname_given_by = 'Bandara Nishantha'
WHERE id = 'T231';

-- T232 - Gajabahu
UPDATE public.tuskers
SET
  name = 'Gajabahu',
  sinhala = 'ගජබාහු',
  listed_date = '2021-01-01',
  location = 'Padaviya / Wahalkada / Kebithigollewa',
  recorded_by = 'Priyanjana Dilmith',
  nickname_given_by = 'Priyanjana Dilmith'
WHERE id = 'T232';

-- T233 - Gamendra
UPDATE public.tuskers
SET
  name = 'Gamendra',
  sinhala = 'ගාමේන්ද්‍ර',
  listed_date = '2022-01-01',
  location = 'Maduru Oya / Thoppigala / Chenkaladi'
WHERE id = 'T233';

-- T234 - Maithree
UPDATE public.tuskers
SET
  name = 'Maithree',
  sinhala = 'මෛත්‍රී',
  listed_date = '2022-01-01',
  location = 'Polonnaruwa / Minneriya / Kaudulla'
WHERE id = 'T234';

-- T235 - Deegayu
UPDATE public.tuskers
SET
  name = 'Deegayu',
  sinhala = 'දීඝායු',
  listed_date = '2022-01-01',
  location = 'Maduru Oya / Thoppigala / Chenkaladi'
WHERE id = 'T235';

-- T236 - Therapuththa
UPDATE public.tuskers
SET
  name = 'Therapuththa',
  sinhala = 'ථෙරපුත්ථ',
  listed_date = '2022-01-01',
  location = 'Wilpattu / Karuwalagaswewa / Puttalam / Tabbowa'
WHERE id = 'T236';

-- T237 - Sinhabahu
UPDATE public.tuskers
SET
  name = 'Sinhabahu',
  sinhala = 'සිංහබාහු',
  listed_date = '2022-01-01',
  location = 'Wilpattu / Karuwalagaswewa / Puttalam / Tabbowa'
WHERE id = 'T237';

-- T238 - Mitta
UPDATE public.tuskers
SET
  name = 'Mitta',
  sinhala = 'මිත්ථ',
  listed_date = '2022-01-01',
  location = 'Wilpattu / Karuwalagaswewa / Puttalam / Tabbowa'
WHERE id = 'T238';

-- T239 - Madduma
UPDATE public.tuskers
SET
  name = 'Madduma',
  sinhala = 'මද්දුම',
  listed_date = '2022-01-01',
  location = 'Yala Block 3, 5 / Buttala',
  recorded_by = 'Maduranga Bandara',
  nickname_given_by = 'Maduranga Bandara'
WHERE id = 'T239';

-- T240 - Jeeva
UPDATE public.tuskers
SET
  name = 'Jeeva',
  sinhala = 'ජීව',
  listed_date = '2022-01-01',
  location = 'Wilpattu / Karuwalagaswewa / Puttalam / Tabbowa'
WHERE id = 'T240';

-- T241 - Nimala
UPDATE public.tuskers
SET
  name = 'Nimala',
  sinhala = 'නිමල',
  listed_date = '2022-01-01',
  location = 'Wilpattu / Karuwalagaswewa / Puttalam / Tabbowa'
WHERE id = 'T241';

-- T242 - Deeghabaya
UPDATE public.tuskers
SET
  name = 'Deeghabaya',
  sinhala = 'දීඝාභය',
  listed_date = '2021-01-01',
  location = 'Padaviya / Wahalkada',
  recorded_by = 'Priyanjana Dilmith',
  nickname_given_by = 'Priyanjana Dilmith'
WHERE id = 'T242';

-- T243 - Megha
UPDATE public.tuskers
SET
  name = 'Megha',
  sinhala = 'මේඝ',
  listed_date = '2021-01-01',
  location = 'Padaviya / Wahalkada / Kebithigollewa',
  recorded_by = 'Priyanjana Dilmith',
  nickname_given_by = 'Priyanjana Dilmith'
WHERE id = 'T243';

-- T244 - Mahosha
UPDATE public.tuskers
SET
  name = 'Mahosha',
  sinhala = 'මහෝෂ',
  listed_date = '2024-01-01',
  location = 'Kala Wewa / Thirappane'
WHERE id = 'T244';

-- T245 - Dakshina
UPDATE public.tuskers
SET
  name = 'Dakshina',
  sinhala = 'දක්ෂිණ',
  listed_date = '2023-01-01',
  location = 'Yala / Lunugamvehera',
  recorded_by = 'Bandara Nishantha'
WHERE id = 'T245';

-- T246 - Kavan
UPDATE public.tuskers
SET
  name = 'Kavan',
  sinhala = 'කාවන්',
  listed_date = '2022-01-01',
  location = 'Wilpattu / Karuwalagaswewa / Puttalam / Tabbowa'
WHERE id = 'T246';

-- T247 - Walagamba 2
UPDATE public.tuskers
SET
  name = 'Walagamba 2',
  sinhala = 'වළගම්බා 2',
  listed_date = '2022-01-01',
  location = 'Wilpattu / Karuwalagaswewa / Puttalam / Tabbowa'
WHERE id = 'T247';

-- T248 - Jayabahu
UPDATE public.tuskers
SET
  name = 'Jayabahu',
  sinhala = 'ජයබාහු',
  listed_date = '2023-01-01',
  location = 'Wilpattu / Karuwalagaswewa / Puttalam / Tabbowa',
  recorded_by = 'Saranga Deva De Alwis',
  nickname_given_by = 'Saranga Deva De Alwis'
WHERE id = 'T248';

-- T249 - Saddha
UPDATE public.tuskers
SET
  name = 'Saddha',
  sinhala = 'සද්ධා',
  listed_date = '2023-01-01',
  location = 'Yala Block 3, 5 / Buttala',
  recorded_by = 'C P Aththanayaka',
  nickname_given_by = 'C P Aththanayaka'
WHERE id = 'T249';

-- Insert T329 (Thejas)
INSERT INTO public.tuskers (
  id, name, sinhala, listed_date, recorded_by, nickname_given_by,
  description, location, last_seen_area, zone, district, province,
  living_status, health_condition, threat_level, last_seen, photos, ear_photos
) VALUES (
  'T329',
  'Thejas',
  'තේජස්',
  '2022-01-01',
  'Maduranga Bandara',
  'Maduranga Bandara',
  'Named after the Sinhala word "Thejasa" (තේජස), symbolizing majestic aura, radiance, and commanding authority, Thejas embodies the true grandeur of Sri Lanka’s wild elephants. Carrying a naturally dignified posture and an unmistakable presence in the wild, this tusker commands quiet respect wherever he roams. His name reflects not merely physical strength, but the noble, regal spirit that defines him across his forest habitat.',
  'Yala Block 3, 5 / Buttala',
  'Buttala',
  'Zone 1',
  'Monaragala',
  'Uva',
  'Alive',
  'Good',
  'Low',
  '2026-10-01',
  '{}',
  '{}'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  sinhala = EXCLUDED.sinhala,
  listed_date = EXCLUDED.listed_date,
  recorded_by = EXCLUDED.recorded_by,
  nickname_given_by = EXCLUDED.nickname_given_by,
  description = EXCLUDED.description,
  location = EXCLUDED.location,
  last_seen_area = EXCLUDED.last_seen_area,
  zone = EXCLUDED.zone,
  district = EXCLUDED.district,
  province = EXCLUDED.province,
  living_status = EXCLUDED.living_status,
  health_condition = EXCLUDED.health_condition,
  threat_level = EXCLUDED.threat_level,
  last_seen = EXCLUDED.last_seen;

-- Insert T330 (Manik)
INSERT INTO public.tuskers (
  id, name, sinhala, listed_date, recorded_by, nickname_given_by,
  description, location, last_seen_area, zone, district, province,
  living_status, health_condition, threat_level, last_seen, photos, ear_photos
) VALUES (
  'T330',
  'Manik',
  'මැණික්',
  '2022-01-01',
  'Maduranga Bandara',
  'Maduranga Bandara',
  'First sighted near the banks of the historic Manik River (මැණික් ගඟ), Manik was named in honor of the river valley where he was initially documented. True to the Sinhala word "Manik," meaning a precious gem, this tusker stands as a rare and treasured icon of Sri Lanka’s southern wilderness, reflecting the enduring bond between the island\'s wild elephants and its sacred waterways.',
  'Manik River / Yala / Buttala',
  'Manik River',
  'Zone 1',
  'Monaragala',
  'Uva',
  'Alive',
  'Good',
  'Low',
  '2026-10-01',
  '{}',
  '{}'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  sinhala = EXCLUDED.sinhala,
  listed_date = EXCLUDED.listed_date,
  recorded_by = EXCLUDED.recorded_by,
  nickname_given_by = EXCLUDED.nickname_given_by,
  description = EXCLUDED.description,
  location = EXCLUDED.location,
  last_seen_area = EXCLUDED.last_seen_area,
  zone = EXCLUDED.zone,
  district = EXCLUDED.district,
  province = EXCLUDED.province,
  living_status = EXCLUDED.living_status,
  health_condition = EXCLUDED.health_condition,
  threat_level = EXCLUDED.threat_level,
  last_seen = EXCLUDED.last_seen;
