-- =====================================================================
-- Migration: Update Remaining Team Member Facebook Links & Exact Names
-- =====================================================================

-- 1. Priyanjana Dilmith
update public.team_members
set facebook_url = 'https://web.facebook.com/priyanjana.dilmith/'
where lower(name) like '%priyanjana%dilmith%';

-- 2. Pathum Bandara
update public.team_members
set facebook_url = 'https://web.facebook.com/pethum.s.bandara/'
where lower(name) like '%pathum%bandara%';

-- 3. Lyndon Fernando
update public.team_members
set facebook_url = 'https://web.facebook.com/lyndon.fernando.52/'
where lower(name) like '%lyndon%fernando%';

-- 4. Namal Kamalgoda (update name spelling & facebook url)
update public.team_members
set name = 'Namal Kamalgoda',
    facebook_url = 'https://web.facebook.com/namal.kamalgoda/'
where lower(name) like '%namal%ka%';

-- 5. Suraj Perera
update public.team_members
set facebook_url = 'https://web.facebook.com/lushyanka.perera/'
where lower(name) like '%suraj%perera%';

-- 6. Geemal Harold
update public.team_members
set name = 'Geemal Harold',
    facebook_url = 'https://web.facebook.com/sasika.geemal/'
where lower(name) like '%geemal%harold%';

-- 7. Raveendra Siriwardhane (update name spelling & facebook url)
update public.team_members
set name = 'Raveendra Siriwardhane',
    facebook_url = 'https://web.facebook.com/raveendra.siriwardene/'
where lower(name) like '%raveendra%siriward%';
