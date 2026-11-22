-- Migration: Fix Sinhala rakaranshaya ZWJ ligatures and remove em-dashes from tusker descriptions
-- Date: 2026-11-22

-- 1. Fix Sinhala names with proper ZWJ Rakaranshaya (්‍ර)
UPDATE public.tuskers SET sinhala = 'දෙව්‍ර' WHERE id = 'T173';
UPDATE public.tuskers SET sinhala = 'දේවේන්ද්‍ර' WHERE id = 'T257';
UPDATE public.tuskers SET sinhala = 'දේවසුරේන්ද්‍ර' WHERE id = 'T284';
UPDATE public.tuskers SET sinhala = 'ප්‍රථාප' WHERE id = 'T289';
UPDATE public.tuskers SET sinhala = 'ප්‍රහස්ථ' WHERE id = 'T301';
UPDATE public.tuskers SET sinhala = 'රුද්‍රජ' WHERE id = 'T303';

-- 2. Clean em-dashes and artificial formatting from descriptions (replacing with standard commas)
UPDATE public.tuskers
SET description = 'Named in remembrance of King Thulaththana, the royal son of King Saddha Tissa who ascended the throne of the ancient Anuradhapura Kingdom in the 1st century BCE. Remembered in Sri Lankan chronicles for his royal lineage and devotion to the sacred precincts of Anuradhapura, particularly the revered Thuparama, Tusker Thulaththana carries a name steeped in ancient sovereignty, heritage, and majestic grace.'
WHERE id = 'T280';

UPDATE public.tuskers
SET description = 'Named in honor of King Vibeeshana, the noble younger brother of the legendary King Ravana and a revered sovereign of ancient Lanka. Celebrated for choosing wisdom, dharma, and justice over blind loyalty, and venerated in Sri Lankan tradition as a guardian deity (Deva) of Kelaniya, his name lives on through Tusker Vibeeshana as a symbol of moral courage, principled strength, and dignified guardianship.'
WHERE id = 'T272';

UPDATE public.tuskers
SET description = 'Daśakaṇṭha, "The Ten-Necked One," an ancient epithet of the legendary Ravana, symbolising immense power, authority and formidable presence. Named in honour of that legendary might, this magnificent tusker carries an unmistakable aura of strength and majesty. With every step, he seems to embody the grandeur of an ancient Lanka, a living legend of the wild, commanding respect without uttering a sound.'
WHERE id = 'T313';

UPDATE public.tuskers
SET description = 'Dhumarakka derives its name from Dhumrāksha, one of the legendary war commanders of King Ravana described in the Ramayana. The name combines the Sanskrit words Dhuma (smoke) and Aksha (eyes), meaning "the one with smoke-like eyes" or "smoke-eyed warrior." Renowned for his immense strength, fearlessness, and unwavering determination on the battlefield, Dhumrāksha symbolised power and resilience. This magnificent tusker earned the name for his commanding presence, imposing stature, and the quiet authority he displays in the wild, qualities befitting a true giant of Sri Lanka''s forests.'
WHERE id = 'T308';

UPDATE public.tuskers
SET description = 'Named ''Nero'' in honor of Ranjith Premasiri Madalana, alias Nero, the heroic soldier who fought fearlessly in the Fourth Eelam War and is recognized as one of the most exceptionally skilled sniper marksmen the world has ever seen.'
WHERE id = 'T304';

UPDATE public.tuskers
SET description = 'Girikaṇḍasiva is a prominent historical and mythological figure from ancient Sri Lankan history. He was an ancient prince, a provincial chieftain, and the uncle and father-in-law of King Pandukabhaya (437-367 BCE), the ruler who founded the Anuradhapura Kingdom. The name is derived from a combination of three Sanskrit/Pali words which means "The Auspicious One of the Mountain Ridge" or "Siva of the Mountain Province."'
WHERE id = 'T321';
