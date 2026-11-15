-- =====================================================================
-- Admin User Provisioning for wildtuskerssrilankaofficial@gmail.com
--
-- Run this in Supabase Dashboard -> SQL Editor
-- (Replace 'YOUR_STRONG_PASSWORD_HERE' with your chosen password)
-- =====================================================================

create extension if not exists "pgcrypto";

do $$
declare
  target_email text := 'wildtuskerssrilankaofficial@gmail.com';
  -- Set your desired admin password here if creating via SQL:
  target_password text := 'YOUR_STRONG_PASSWORD_HERE';
  user_record_id uuid;
begin
  select id into user_record_id from auth.users where email = target_email;

  if user_record_id is null then
    user_record_id := gen_random_uuid();

    insert into auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) values (
      user_record_id,
      '00000000-0000-0000-0000-000000000000',
      target_email,
      crypt(target_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now(),
      'authenticated',
      'authenticated'
    );
  else
    -- If user was already added via Supabase Dashboard Auth UI, ensure email is confirmed
    update auth.users
    set email_confirmed_at = coalesce(email_confirmed_at, now())
    where id = user_record_id;
  end if;

  -- Grant admin privileges by linking to public.admin_users
  insert into public.admin_users (user_id)
  values (user_record_id)
  on conflict (user_id) do nothing;
end $$;

