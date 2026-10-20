-- =====================================================================
-- Inazuma Rogue · tabla de partidas guardadas
-- Pégalo entero en Supabase → SQL Editor → New query → Run.
-- Cada jugador solo puede leer y cambiar SU partida (reglas RLS).
-- =====================================================================

create table if not exists public.saves (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  username   text not null,
  data       jsonb not null,
  rev        integer not null default 1,          -- versión: sube en cada guardado
  updated_at timestamptz not null default now(),
  constraint saves_size check (pg_column_size(data) < 3000000)   -- máx. ~3 MB por partida
);

alter table public.saves enable row level security;

drop policy if exists "leer mi partida"    on public.saves;
drop policy if exists "crear mi partida"   on public.saves;
drop policy if exists "cambiar mi partida" on public.saves;

create policy "leer mi partida"    on public.saves for select using (auth.uid() = user_id);
create policy "crear mi partida"   on public.saves for insert with check (auth.uid() = user_id);
create policy "cambiar mi partida" on public.saves for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- La fecha de guardado la pone el servidor
create or replace function public.saves_touch() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists saves_touch on public.saves;
create trigger saves_touch before insert or update on public.saves
  for each row execute function public.saves_touch();
