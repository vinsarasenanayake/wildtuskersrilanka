-- =====================================================================
-- Migration: Deduplicate Team Members, Remove Dushantha Silva, Enforce UNIQUE
-- =====================================================================

-- 1. Remove Dushantha Silva as requested (stepped down from team)
delete from public.team_members
where lower(name) like '%dushantha silva%';

-- 2. Remove duplicate team members by name, keeping the one with the lowest ID
delete from public.team_members
where id not in (
  select min(id)
  from public.team_members
  group by name
);

-- 3. Add unique constraint so future scripts or inserts cannot duplicate members
alter table public.team_members drop constraint if exists team_members_name_unique;
alter table public.team_members add constraint team_members_name_unique unique (name);

-- 4. Re-sequence display order cleanly from 1 to 12
update public.team_members set display_order = 1 where name = 'Milinda Wattegedara';
update public.team_members set display_order = 2 where name = 'Asanka Nilagaratne';
update public.team_members set display_order = 3 where name = 'Chandika Lakmal';
update public.team_members set display_order = 4 where name = 'Dr Isuru Upanishad';
update public.team_members set display_order = 5 where name = 'Saman Halloluwa';
update public.team_members set display_order = 6 where name = 'Lyndon Fernando';
update public.team_members set display_order = 7 where name = 'Namal Kalagoda';
update public.team_members set display_order = 8 where name = 'Pathum Bandara';
update public.team_members set display_order = 9 where name = 'Priyanjana Dilmith';
update public.team_members set display_order = 10 where name = 'Suraj Perera';
update public.team_members set display_order = 11 where name = 'Geemal Harold';
update public.team_members set display_order = 12 where name = 'Raveendra Siriwardana';
