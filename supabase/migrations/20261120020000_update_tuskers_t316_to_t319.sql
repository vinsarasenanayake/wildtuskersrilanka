-- Migration: Update tusker profiles for T316 to T319 with recorded year, recorded/named by, and historical descriptions.

update public.tuskers
set
  listed_date = '2025-01-01',
  recorded_by = 'Binura Hasaranga',
  nickname_given_by = 'Binura Hasaranga'
where id = 'T316';

update public.tuskers
set
  listed_date = '2026-01-01',
  recorded_by = 'Kushan Sameera and Sanjaya Madhushan',
  nickname_given_by = 'Kushan Sameera and Sanjaya Madhushan',
  description = 'In Remembrance of Sakkha Senevi.

Sakka Senevi, also referred to as Sakkha Senevi or Seneviratna Sakka, was a prominent military commander and general who served under King Kassapa V during the Anuradhapura period of Sri Lankan history.

King Kassapa V is generally placed in the early 10th century, although his reign is dated differently in various chronological traditions. Sakka Senevi is remembered as one of the notable military figures associated with this era, reflecting the important role played by military commanders in the political and territorial affairs of ancient Sri Lanka.'
where id = 'T317';

update public.tuskers
set
  listed_date = '2026-01-01',
  recorded_by = 'Niklesh Mahanama',
  nickname_given_by = 'Niklesh Mahanama',
  description = 'Derived from the ancient Sanskrit-rooted expression Dharanī (the Earth) and Indra (lord, ruler, or supreme one), Dharanindra can be interpreted as "Lord of the Earth."'
where id = 'T318';

update public.tuskers
set
  listed_date = '2025-01-01',
  recorded_by = 'Nijal Buddika / Yushantha Dimunge / Chandika Dimunge',
  nickname_given_by = 'Nijal Buddika / Yushantha Dimunge / Chandika Dimunge',
  description = 'The name Chaddantha is inspired by the Chaddanta Jātaka, one of the famous Buddhist birth stories in which the Buddha, in a previous life, was born as Chaddanta, a majestic tusker king who led a herd of 8,000 elephants and lived near a golden cave.

The name Chaddanta means "Six-Tusked", derived from the Pali words Chakka, meaning "six," and Danta, meaning "tooth" or "tusk." In Buddhist tradition, Chaddanta is portrayed as a legendary, pure-white elephant, symbolizing supreme power, spiritual purity, dignity, and royal majesty.'
where id = 'T319';
