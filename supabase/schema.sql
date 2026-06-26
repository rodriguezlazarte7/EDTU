-- ============================================================
--  EDTU — Esquema de base de datos para Supabase
--  Cómo usar: Supabase → SQL Editor → New query → pega TODO → Run
--  Es idempotente: puedes ejecutarlo varias veces sin problema.
-- ============================================================

-- 1) TABLAS ---------------------------------------------------
create table if not exists public.app_config (
  id           int primary key default 1,
  admin_pin    text,
  profile_name text default 'SUPERADMIN',
  profile_photo text,
  face_descriptor jsonb,
  updated_at   timestamptz default now(),
  constraint app_config_single_row check (id = 1)
);
alter table public.app_config add column if not exists face_descriptor jsonb;

create table if not exists public.missions (
  id        text primary key,
  name      text not null,
  objective text,
  agents    jsonb default '[]'::jsonb,
  date      text,
  time      text,
  location  text,
  prio      text,
  status    text,
  created_at timestamptz default now()
);

create table if not exists public.agents (
  id        text primary key,
  name      text not null,
  codename  text,
  specialty text,
  clearance text,
  status    text,
  pin       text,
  photo     text,
  notes      text,
  blocked    boolean default false,
  voice_hash text,
  created_at timestamptz default now()
);
alter table public.agents add column if not exists voice_hash text;

create table if not exists public.chat_messages (
  id    text primary key,
  key   text,
  name  text,
  role  text,
  text  text,
  audio text,
  ts    bigint,
  created_at timestamptz default now()
);
-- por si la tabla ya existía sin la columna de audio:
alter table public.chat_messages add column if not exists audio text;

-- 2) RLS (Row Level Security) --------------------------------
alter table public.app_config     enable row level security;
alter table public.missions       enable row level security;
alter table public.agents         enable row level security;
alter table public.chat_messages  enable row level security;

-- 3) POLÍTICAS — acceso abierto (login por PIN, sin Supabase Auth)
--    ⚠️ Cualquiera con la clave publicable puede leer/escribir.
--    Más adelante, para producción: Supabase Auth + políticas por usuario.
drop policy if exists edtu_all on public.app_config;
drop policy if exists edtu_all on public.missions;
drop policy if exists edtu_all on public.agents;
drop policy if exists edtu_all on public.chat_messages;

create policy edtu_all on public.app_config    for all to anon, authenticated using (true) with check (true);
create policy edtu_all on public.missions      for all to anon, authenticated using (true) with check (true);
create policy edtu_all on public.agents        for all to anon, authenticated using (true) with check (true);
create policy edtu_all on public.chat_messages for all to anon, authenticated using (true) with check (true);

-- 4) REALTIME (actualización en vivo entre dispositivos) -----
do $$ begin alter publication supabase_realtime add table public.missions;      exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.agents;        exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.chat_messages; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.app_config;    exception when duplicate_object then null; end $$;
