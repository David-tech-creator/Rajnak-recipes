-- ============================================================
-- Family gallery schema for the Rajnak Supabase project.
-- Paste this entire file into Supabase → SQL Editor → "New query"
-- and click Run. Idempotent; safe to re-run.
-- ============================================================

-- Enable UUID generation (Supabase usually has this by default).
create extension if not exists "pgcrypto";

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.family_events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  date        date not null,
  event_type  text not null default 'other',
  location    text,
  cover_image text,
  created_by  uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.family_photos (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  caption     text,
  date        timestamptz not null default now(),
  event_type  text not null default 'other',
  event_id    uuid references public.family_events(id) on delete set null,
  created_by  uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists family_photos_event_id_idx     on public.family_photos(event_id);
create index if not exists family_photos_created_at_idx   on public.family_photos(created_at desc);
create index if not exists family_events_date_idx         on public.family_events(date desc);

-- ============================================================
-- Row-level security
-- ============================================================
-- Anyone (including anonymous visitors) can READ photos and events.
-- Only the user who created a row may insert / update / delete it.

alter table public.family_events enable row level security;
alter table public.family_photos enable row level security;

drop policy if exists "family_events read"             on public.family_events;
drop policy if exists "family_events insert by owner"  on public.family_events;
drop policy if exists "family_events update by owner"  on public.family_events;
drop policy if exists "family_events delete by owner"  on public.family_events;

create policy "family_events read"
  on public.family_events for select
  using (true);

create policy "family_events insert by owner"
  on public.family_events for insert
  with check (auth.uid() = created_by);

create policy "family_events update by owner"
  on public.family_events for update
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

create policy "family_events delete by owner"
  on public.family_events for delete
  using (auth.uid() = created_by);

drop policy if exists "family_photos read"             on public.family_photos;
drop policy if exists "family_photos insert by owner"  on public.family_photos;
drop policy if exists "family_photos update by owner"  on public.family_photos;
drop policy if exists "family_photos delete by owner"  on public.family_photos;

create policy "family_photos read"
  on public.family_photos for select
  using (true);

create policy "family_photos insert by owner"
  on public.family_photos for insert
  with check (auth.uid() = created_by);

create policy "family_photos update by owner"
  on public.family_photos for update
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

create policy "family_photos delete by owner"
  on public.family_photos for delete
  using (auth.uid() = created_by);

-- ============================================================
-- Storage bucket
-- ============================================================
-- Photos are uploaded to a "family-photos" bucket and served as
-- public URLs. Create it via the Supabase dashboard:
--   Storage → New bucket → name "family-photos", public = true.
-- Then add this storage policy in Storage → Policies:
--   - SELECT: bucket_id = 'family-photos' (allow public reads)
--   - INSERT/UPDATE/DELETE: bucket_id = 'family-photos' AND auth.role() = 'authenticated'
