-- LifeLine Supabase/PostgreSQL schema
-- Paste this file into the Supabase SQL Editor and run it once.

create extension if not exists pgcrypto;
create extension if not exists citext;

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text unique,
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  full_name text not null default '',
  email citext unique,
  phone text not null default '',
  city text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_owner_required check (
    firebase_uid is not null or auth_user_id is not null or email is not null
  )
);

create table if not exists public.medical_profiles (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null unique references public.user_profiles(id) on delete cascade,
  blood_type text not null default 'Unknown',
  allergies text[] not null default '{}',
  chronic_diseases text[] not null default '{}',
  medications text[] not null default '{}',
  emergency_contact_name text not null default '',
  emergency_contact_phone text not null default '',
  emergency_contact_relationship text not null default '',
  doctor_name text not null default '',
  critical_instructions text not null default '',
  qr_token text not null unique default ('ll_' || replace(gen_random_uuid()::text, '-', '')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.emergency_logs (
  id uuid primary key default gen_random_uuid(),
  qr_token text not null,
  responder text not null default 'unknown',
  location text not null default '',
  opened_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_firebase_uid_idx
  on public.user_profiles(firebase_uid);

create index if not exists user_profiles_auth_user_id_idx
  on public.user_profiles(auth_user_id);

create index if not exists medical_profiles_qr_token_idx
  on public.medical_profiles(qr_token);

create index if not exists medical_profiles_user_profile_id_idx
  on public.medical_profiles(user_profile_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_medical_profiles_updated_at on public.medical_profiles;
create trigger set_medical_profiles_updated_at
before update on public.medical_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_emergency_logs_updated_at on public.emergency_logs;
create trigger set_emergency_logs_updated_at
before update on public.emergency_logs
for each row execute function public.set_updated_at();

create or replace view public.public_emergency_profiles as
select
  up.full_name,
  mp.blood_type,
  mp.allergies,
  mp.chronic_diseases,
  mp.medications,
  mp.emergency_contact_name,
  mp.emergency_contact_phone,
  mp.critical_instructions,
  mp.qr_token
from public.medical_profiles mp
join public.user_profiles up on up.id = mp.user_profile_id;

alter table public.user_profiles enable row level security;
alter table public.medical_profiles enable row level security;
alter table public.emergency_logs enable row level security;

drop policy if exists "user_profiles_select_own" on public.user_profiles;
create policy "user_profiles_select_own"
on public.user_profiles
for select
to authenticated
using (auth.uid() = auth_user_id);

drop policy if exists "user_profiles_insert_own" on public.user_profiles;
create policy "user_profiles_insert_own"
on public.user_profiles
for insert
to authenticated
with check (auth.uid() = auth_user_id);

drop policy if exists "user_profiles_update_own" on public.user_profiles;
create policy "user_profiles_update_own"
on public.user_profiles
for update
to authenticated
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

drop policy if exists "medical_profiles_select_own" on public.medical_profiles;
create policy "medical_profiles_select_own"
on public.medical_profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.user_profiles up
    where up.id = medical_profiles.user_profile_id
      and up.auth_user_id = auth.uid()
  )
);

drop policy if exists "medical_profiles_insert_own" on public.medical_profiles;
create policy "medical_profiles_insert_own"
on public.medical_profiles
for insert
to authenticated
with check (
  exists (
    select 1
    from public.user_profiles up
    where up.id = medical_profiles.user_profile_id
      and up.auth_user_id = auth.uid()
  )
);

drop policy if exists "medical_profiles_update_own" on public.medical_profiles;
create policy "medical_profiles_update_own"
on public.medical_profiles
for update
to authenticated
using (
  exists (
    select 1
    from public.user_profiles up
    where up.id = medical_profiles.user_profile_id
      and up.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.user_profiles up
    where up.id = medical_profiles.user_profile_id
      and up.auth_user_id = auth.uid()
  )
);

drop policy if exists "emergency_logs_insert_public" on public.emergency_logs;
create policy "emergency_logs_insert_public"
on public.emergency_logs
for insert
to anon, authenticated
with check (true);

revoke all on public.user_profiles from anon, authenticated;
revoke all on public.medical_profiles from anon, authenticated;
revoke all on public.emergency_logs from anon, authenticated;
revoke all on public.public_emergency_profiles from anon, authenticated;

grant select, insert, update on public.user_profiles to authenticated;
grant select, insert, update on public.medical_profiles to authenticated;
grant insert on public.emergency_logs to anon, authenticated;
grant select on public.public_emergency_profiles to anon, authenticated;
