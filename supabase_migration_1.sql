-- =========================================================================
-- MIGRACIÓN 1: LLAVES, LIGAS Y MEDALLAS
-- =========================================================================

-- 1. Tabla para los pronósticos de las llaves (Brackets)
create table public.brackets (
  user_id uuid references public.profiles(id) primary key,
  r32_slots jsonb default '{}'::jsonb,
  match_winners jsonb default '{}'::jsonb,
  points_earned integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.brackets enable row level security;
create policy "Cualquiera puede ver las llaves" on public.brackets for select using (true);
create policy "Usuarios pueden crear y actualizar sus propias llaves" on public.brackets for all using (auth.uid() = user_id);


-- 2. Tabla para guardar la llave oficial (solo modificable por admin)
create table public.official_bracket (
  id integer primary key default 1 check (id = 1),
  r32_slots jsonb default '{}'::jsonb,
  match_winners jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.official_bracket enable row level security;
create policy "Cualquiera puede ver la llave oficial" on public.official_bracket for select using (true);
create policy "Solo admin puede editar la llave oficial" on public.official_bracket for all using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

insert into public.official_bracket (id) values (1) on conflict do nothing;


-- 3. Tabla de Ligas Privadas
create table public.leagues (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  invite_code text unique not null,
  owner_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.leagues enable row level security;
create policy "Cualquiera puede ver las ligas" on public.leagues for select using (true);
create policy "Usuarios pueden crear ligas" on public.leagues for insert with check (auth.uid() = owner_id);


-- 4. Tabla de Miembros de Ligas
create table public.league_members (
  league_id uuid references public.leagues(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (league_id, user_id)
);

alter table public.league_members enable row level security;
create policy "Cualquiera puede ver miembros de las ligas" on public.league_members for select using (true);
create policy "Usuarios pueden unirse a ligas" on public.league_members for insert with check (auth.uid() = user_id);
create policy "Usuarios pueden salirse de ligas" on public.league_members for delete using (auth.uid() = user_id);


-- 5. Tabla de Medallas obtenidas por usuarios
create table public.user_medals (
  user_id uuid references public.profiles(id) on delete cascade,
  medal_id text not null,
  earned_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (user_id, medal_id)
);

alter table public.user_medals enable row level security;
create policy "Cualquiera puede ver medallas de usuarios" on public.user_medals for select using (true);
create policy "Usuarios pueden otorgarse medallas mediante la app" on public.user_medals for insert with check (auth.uid() = user_id);


-- Triggers para updated_at
create trigger on_bracket_updated
  before update on public.brackets
  for each row execute procedure public.handle_updated_at();

create trigger on_official_bracket_updated
  before update on public.official_bracket
  for each row execute procedure public.handle_updated_at();
