-- =====================================================================
-- Migration: Update 42 Tuskers Last Seen Dates and Living Status
-- Note: last_seen_area is explicitly preserved per user instruction.
-- =====================================================================

UPDATE public.tuskers SET last_seen = '2026-08-22', living_status = 'Alive' WHERE id = 'T315'; -- Dappula (Dappula / Dala Kota), sighted 22 - 08 - 2026
UPDATE public.tuskers SET last_seen = '2026-11-03', living_status = 'Alive' WHERE id = 'T259'; -- Vimukthi (Vimukthi), sighted 03 - 11 - 2026
UPDATE public.tuskers SET last_seen = '2026-11-25', living_status = 'Alive' WHERE id = 'T252'; -- Kapila (Kapila), sighted 25 - 11 - 2026
UPDATE public.tuskers SET last_seen = '2025-08-10', living_status = 'Alive' WHERE id = 'T251'; -- Aggabodhi (AgghaBodhi), sighted 2025 -08 -10
UPDATE public.tuskers SET last_seen = '2026-11-24', living_status = 'Alive' WHERE id = 'T249'; -- Saddha (Saddha), sighted 2026 - 11 - 24
UPDATE public.tuskers SET last_seen = '2026-11-24', living_status = 'Alive' WHERE id = 'T245'; -- Dhakshina (Dakshina), sighted 2026 - 11 - 24
UPDATE public.tuskers SET last_seen = '2026-11-20', living_status = 'Alive' WHERE id = 'T239'; -- Madduma (Madduma), sighted 2026 - 11 - 20
UPDATE public.tuskers SET last_seen = '2023-01-01', living_status = 'No Recent Record' WHERE id = 'T231'; -- Luwara (Luwara), sighted 2023
UPDATE public.tuskers SET last_seen = '2025-01-01', living_status = 'Alive' WHERE id = 'T227'; -- Shantha (Shantha), sighted 2025
UPDATE public.tuskers SET last_seen = '2026-11-10', living_status = 'Alive', death_year = null, death_reason = null WHERE id = 'T226'; -- Luhul (Luhul), sighted 2026 - 11 - 10
UPDATE public.tuskers SET last_seen = '2026-01-01', living_status = 'Alive' WHERE id = 'T224'; -- Janith (Janith), sighted 2026
UPDATE public.tuskers SET last_seen = '2026-01-10', living_status = 'Alive' WHERE id = 'T223'; -- Nishan (Nishan), sighted 2026 -01 -10
UPDATE public.tuskers SET last_seen = '2026-11-01', living_status = 'Alive' WHERE id = 'T221'; -- Saman (Saman), sighted 2026 - 11
UPDATE public.tuskers SET last_seen = '2026-11-10', living_status = 'Alive' WHERE id = 'T218'; -- Migara (Migara), sighted 2026 - 11 - 10
UPDATE public.tuskers SET last_seen = '2021-01-01', living_status = 'No Recent Record' WHERE id = 'T208'; -- Dulitha (Dulitha), sighted 2021
UPDATE public.tuskers SET last_seen = '2023-01-01', living_status = 'No Recent Record' WHERE id = 'T201'; -- Iddi (Iddi), sighted 2023
UPDATE public.tuskers SET last_seen = '2023-01-01', living_status = 'No Recent Record' WHERE id = 'T195'; -- Gotaimbara (Gotaimbara), sighted 2023
UPDATE public.tuskers SET last_seen = '2026-11-01', living_status = 'Alive' WHERE id = 'T012'; -- Gemunu (Gemunu), sighted 2026 - 11
UPDATE public.tuskers SET last_seen = '2015-01-01', living_status = 'No Recent Record' WHERE id = 'T187'; -- Nissanka (Nissanka), sighted 2015
UPDATE public.tuskers SET last_seen = '2026-11-04', living_status = 'Alive' WHERE id = 'T184'; -- Mahasena (Mahasena), sighted 2026 - 11 - 04
UPDATE public.tuskers SET last_seen = '2025-01-01', living_status = 'Alive' WHERE id = 'T182'; -- Mugalan (Mugalan), sighted 2025
UPDATE public.tuskers SET last_seen = '2026-11-01', living_status = 'Alive' WHERE id = 'T181'; -- Manula (Manula), sighted 2026 - 11
UPDATE public.tuskers SET last_seen = '2026-10-25', living_status = 'Alive' WHERE id = 'T180'; -- Skandaraja (Skandaraja), sighted 2026 - 10 - 25
UPDATE public.tuskers SET last_seen = '2024-01-01', living_status = 'Alive' WHERE id = 'T179'; -- Vihanga (Vihanga), sighted 2024
UPDATE public.tuskers SET last_seen = '2022-01-01', living_status = 'No Recent Record' WHERE id = 'T173'; -- Devra (Devra), sighted 2022
UPDATE public.tuskers SET last_seen = '2025-01-01', living_status = 'Alive' WHERE id = 'T169'; -- Pabbatha (Pabbatha), sighted 2025
UPDATE public.tuskers SET last_seen = '2026-08-01', living_status = 'Alive' WHERE id = 'T162'; -- Parinda (Parinda), sighted 2026 - 8
UPDATE public.tuskers SET last_seen = '2025-01-01', living_status = 'Alive' WHERE id = 'T105'; -- Haritha (Haritha), sighted 2025
UPDATE public.tuskers SET last_seen = '2026-11-25', living_status = 'Alive' WHERE id = 'T035'; -- Kashyapa (Kashyapa), sighted 2026 - 11 - 25
UPDATE public.tuskers SET last_seen = '2026-10-23', living_status = 'Alive' WHERE id = 'T023'; -- Chethiya (Chethiya), sighted 2026 - 10 - 23
UPDATE public.tuskers SET last_seen = '2026-10-25', living_status = 'Alive' WHERE id = 'T024'; -- Namal (Namal), sighted 2026 - 10 - 25
UPDATE public.tuskers SET last_seen = '2026-08-01', living_status = 'Alive' WHERE id = 'T021'; -- Vidura (Vidura), sighted 2026 -08
UPDATE public.tuskers SET last_seen = '2026-01-01', living_status = 'Alive' WHERE id = 'T020'; -- Lokeshwara (Lokeshwara), sighted 2026
UPDATE public.tuskers SET last_seen = '2022-01-01', living_status = 'No Recent Record' WHERE id = 'T019'; -- Dala Kura (Dala Koora), sighted 2022
UPDATE public.tuskers SET last_seen = '2026-11-08', living_status = 'Alive' WHERE id = 'T018'; -- Pandula (Pandula), sighted 2026 - 11 - 08
UPDATE public.tuskers SET last_seen = '2026-05-01', living_status = 'Alive' WHERE id = 'T017'; -- Podi Dananjaya (Podi Dhananjaya), sighted 2026 - 05
UPDATE public.tuskers SET last_seen = '2026-11-22', living_status = 'Alive' WHERE id = 'T016'; -- Ruhunu (Ruhunu), sighted 2026 - 11 -22
UPDATE public.tuskers SET last_seen = '2026-11-18', living_status = 'Alive' WHERE id = 'T014'; -- Ravana (Rawana), sighted 2026 -11 -18
UPDATE public.tuskers SET last_seen = '2026-11-25', living_status = 'Alive' WHERE id = 'T013'; -- Parakum (Perakum), sighted 2026 - 11 - 25
UPDATE public.tuskers SET last_seen = '2023-09-01', living_status = 'No Recent Record' WHERE id = 'T011'; -- Sando (Sando), sighted 2023 - 09
UPDATE public.tuskers SET last_seen = '2026-11-01', living_status = 'Alive' WHERE id = 'T010'; -- Nandimithra (Nandimithra), sighted 2026 - 11
UPDATE public.tuskers SET last_seen = '2026-11-22', living_status = 'Alive' WHERE id = 'T009'; -- Nalaka (Nalaka), sighted 2026 - 11 - 22
