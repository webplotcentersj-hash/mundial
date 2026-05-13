-- Habilitar la extensión UUID
create extension if not exists "uuid-ossp";

-- =========================================================================
-- 1. Tabla de Perfiles (Profiles) - Extiende auth.users
-- =========================================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  avatar_url text,
  total_points integer default 0,
  role text check (role in ('admin', 'user')) default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  last_active timestamp with time zone default timezone('utc'::text, now())
);

-- RLS (Row Level Security) para perfiles
alter table public.profiles enable row level security;
create policy "Cualquiera puede ver los perfiles" on profiles for select using (true);
create policy "Los usuarios pueden actualizar su propio perfil" on profiles for update using (auth.uid() = id);

-- Trigger para crear automáticamente un perfil cuando un usuario se registra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- =========================================================================
-- 2. Tabla de Equipos (Teams)
-- =========================================================================
create table public.teams (
  id text primary key,
  name text not null,
  group_id text not null,
  code text not null
);

alter table public.teams enable row level security;
create policy "Cualquiera puede ver los equipos" on teams for select using (true);
-- Los inserts/updates a teams solo los hará el admin (dejamos cerrado el acceso público de escritura)


-- =========================================================================
-- 3. Tabla de Partidos (Matches)
-- =========================================================================
create table public.matches (
  id text primary key,
  home_team_id text references public.teams(id),
  away_team_id text references public.teams(id),
  date timestamp with time zone not null,
  stage text not null,
  venue text not null,
  home_score integer,
  away_score integer,
  status text check (status in ('pending', 'finished')) default 'pending'
);

alter table public.matches enable row level security;
create policy "Cualquiera puede ver los partidos" on matches for select using (true);
create policy "Solo los admins pueden modificar partidos" on matches for update using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);


-- =========================================================================
-- 4. Tabla de Predicciones (Predictions)
-- =========================================================================
create table public.predictions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  match_id text references public.matches(id) on delete cascade not null,
  home_score integer not null,
  away_score integer not null,
  points_earned integer,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, match_id) -- Un usuario solo puede tener un pronóstico por partido
);

alter table public.predictions enable row level security;
create policy "Cualquiera puede ver las predicciones" on predictions for select using (true);
create policy "Usuarios pueden crear sus propias predicciones" on predictions for insert with check (auth.uid() = user_id);
create policy "Usuarios pueden actualizar sus propias predicciones" on predictions for update using (auth.uid() = user_id);

-- Función para actualizar la fecha de modificación en predicciones
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_prediction_updated
  before update on public.predictions
  for each row execute procedure public.handle_updated_at();

-- =========================================================================
-- INITIAL DATA SEED
-- =========================================================================

-- Insert Teams
INSERT INTO public.teams (id, name, group_id, code) VALUES
  ('mx', 'México', 'A', 'mx'),
  ('za', 'Sudáfrica', 'A', 'za'),
  ('kr', 'Rep. de Corea', 'A', 'kr'),
  ('cz', 'Rep. Checa', 'A', 'cz'),
  ('ca', 'Canadá', 'B', 'ca'),
  ('ba', 'Bosnia y Herz.', 'B', 'ba'),
  ('qa', 'Catar', 'B', 'qa'),
  ('ch', 'Suiza', 'B', 'ch'),
  ('br', 'Brasil', 'C', 'br'),
  ('ma', 'Marruecos', 'C', 'ma'),
  ('ht', 'Haití', 'C', 'ht'),
  ('gb-sct', 'Escocia', 'C', 'gb-sct'),
  ('us', 'Estados Unidos', 'D', 'us'),
  ('py', 'Paraguay', 'D', 'py'),
  ('au', 'Australia', 'D', 'au'),
  ('tr', 'Turquía', 'D', 'tr'),
  ('de', 'Alemania', 'E', 'de'),
  ('cw', 'Curazao', 'E', 'cw'),
  ('ci', 'C. de Marfil', 'E', 'ci'),
  ('ec', 'Ecuador', 'E', 'ec'),
  ('nl', 'Países Bajos', 'F', 'nl'),
  ('jp', 'Japón', 'F', 'jp'),
  ('se', 'Suecia', 'F', 'se'),
  ('tn', 'Túnez', 'F', 'tn'),
  ('be', 'Bélgica', 'G', 'be'),
  ('eg', 'Egipto', 'G', 'eg'),
  ('ir', 'RI de Irán', 'G', 'ir'),
  ('nz', 'N. Zelanda', 'G', 'nz'),
  ('es', 'España', 'H', 'es'),
  ('cv', 'Cabo Verde', 'H', 'cv'),
  ('sa', 'Arabia Saudí', 'H', 'sa'),
  ('uy', 'Uruguay', 'H', 'uy'),
  ('fr', 'Francia', 'I', 'fr'),
  ('sn', 'Senegal', 'I', 'sn'),
  ('iq', 'Irak', 'I', 'iq'),
  ('no', 'Noruega', 'I', 'no'),
  ('ar', 'Argentina', 'J', 'ar'),
  ('dz', 'Argelia', 'J', 'dz'),
  ('at', 'Austria', 'J', 'at'),
  ('jo', 'Jordania', 'J', 'jo'),
  ('pt', 'Portugal', 'K', 'pt'),
  ('cd', 'RD Congo', 'K', 'cd'),
  ('uz', 'Uzbekistán', 'K', 'uz'),
  ('co', 'Colombia', 'K', 'co'),
  ('gb-eng', 'Inglaterra', 'L', 'gb-eng'),
  ('hr', 'Croacia', 'L', 'hr'),
  ('gh', 'Ghana', 'L', 'gh'),
  ('pa', 'Panamá', 'L', 'pa')
ON CONFLICT (id) DO NOTHING;

-- Insert Matches
INSERT INTO public.matches (id, home_team_id, away_team_id, date, stage, venue, status) VALUES
  ('m1', 'mx', 'za', '2026-06-11T15:00:00Z', 'Grupo A', 'Estadio Ciudad de México', 'pending'),
  ('m2', 'kr', 'cz', '2026-06-11T22:00:00Z', 'Grupo A', 'Estadio Guadalajara', 'pending'),
  ('m3', 'ca', 'ba', '2026-06-12T15:00:00Z', 'Grupo B', 'Estadio Toronto', 'pending'),
  ('m4', 'us', 'py', '2026-06-12T21:00:00Z', 'Grupo D', 'Estadio Los Ángeles', 'pending'),
  ('m5', 'qa', 'ch', '2026-06-13T15:00:00Z', 'Grupo B', 'Estadio Bahía de San Francisco', 'pending'),
  ('m6', 'br', 'ma', '2026-06-13T18:00:00Z', 'Grupo C', 'Estadio Nueva York Nueva Jersey', 'pending'),
  ('m7', 'ht', 'gb-sct', '2026-06-13T21:00:00Z', 'Grupo C', 'Estadio Boston', 'pending'),
  ('m8', 'au', 'tr', '2026-06-14T00:00:00Z', 'Grupo D', 'Estadio BC Place Vancouver', 'pending'),
  ('m9', 'de', 'cw', '2026-06-14T13:00:00Z', 'Grupo E', 'Estadio Houston', 'pending'),
  ('m10', 'nl', 'jp', '2026-06-14T16:00:00Z', 'Grupo F', 'Estadio Dallas', 'pending'),
  ('m11', 'ci', 'ec', '2026-06-14T19:00:00Z', 'Grupo E', 'Estadio Filadelfia', 'pending'),
  ('m12', 'se', 'tn', '2026-06-14T22:00:00Z', 'Grupo F', 'Estadio Monterrey', 'pending'),
  ('m13', 'es', 'cv', '2026-06-15T12:00:00Z', 'Grupo H', 'Estadio Atlanta', 'pending'),
  ('m14', 'be', 'eg', '2026-06-15T15:00:00Z', 'Grupo G', 'Estadio Seattle', 'pending'),
  ('m15', 'sa', 'uy', '2026-06-15T18:00:00Z', 'Grupo H', 'Estadio Miami', 'pending'),
  ('m16', 'ir', 'nz', '2026-06-15T21:00:00Z', 'Grupo G', 'Estadio Los Ángeles', 'pending'),
  ('m17', 'fr', 'sn', '2026-06-16T15:00:00Z', 'Grupo I', 'Estadio Nueva York Nueva Jersey', 'pending'),
  ('m18', 'iq', 'no', '2026-06-16T18:00:00Z', 'Grupo I', 'Estadio Boston', 'pending'),
  ('m19', 'ar', 'dz', '2026-06-16T21:00:00Z', 'Grupo J', 'Estadio Kansas City', 'pending'),
  ('m20', 'at', 'jo', '2026-06-17T00:00:00Z', 'Grupo J', 'Estadio Bahía de San Francisco', 'pending'),
  ('m21', 'pt', 'cd', '2026-06-17T13:00:00Z', 'Grupo K', 'Estadio Houston', 'pending'),
  ('m22', 'gb-eng', 'hr', '2026-06-17T16:00:00Z', 'Grupo L', 'Estadio Dallas', 'pending'),
  ('m23', 'gh', 'pa', '2026-06-17T19:00:00Z', 'Grupo L', 'Estadio Toronto', 'pending'),
  ('m24', 'uz', 'co', '2026-06-17T22:00:00Z', 'Grupo K', 'Estadio Ciudad de México', 'pending'),
  ('m25', 'cz', 'za', '2026-06-18T12:00:00Z', 'Grupo A', 'Estadio Atlanta', 'pending'),
  ('m26', 'ch', 'ba', '2026-06-18T15:00:00Z', 'Grupo B', 'Estadio Los Ángeles', 'pending'),
  ('m27', 'ca', 'qa', '2026-06-18T18:00:00Z', 'Grupo B', 'Estadio BC Place Vancouver', 'pending'),
  ('m28', 'mx', 'kr', '2026-06-18T21:00:00Z', 'Grupo A', 'Estadio Guadalajara', 'pending'),
  ('m29', 'us', 'au', '2026-06-19T15:00:00Z', 'Grupo D', 'Estadio Seattle', 'pending'),
  ('m30', 'gb-sct', 'ma', '2026-06-19T18:00:00Z', 'Grupo C', 'Estadio Boston', 'pending'),
  ('m31', 'br', 'ht', '2026-06-19T21:00:00Z', 'Grupo C', 'Estadio Filadelfia', 'pending'),
  ('m32', 'tr', 'py', '2026-06-20T00:00:00Z', 'Grupo D', 'Estadio Bahía de San Francisco', 'pending'),
  ('m33', 'nl', 'se', '2026-06-20T13:00:00Z', 'Grupo F', 'Estadio Houston', 'pending'),
  ('m34', 'de', 'ci', '2026-06-20T16:00:00Z', 'Grupo E', 'Estadio Toronto', 'pending'),
  ('m35', 'ec', 'cw', '2026-06-20T22:00:00Z', 'Grupo E', 'Estadio Kansas City', 'pending'),
  ('m36', 'tn', 'jp', '2026-06-21T00:00:00Z', 'Grupo F', 'Estadio Monterrey', 'pending'),
  ('m37', 'es', 'sa', '2026-06-21T12:00:00Z', 'Grupo H', 'Estadio Atlanta', 'pending'),
  ('m38', 'be', 'ir', '2026-06-21T15:00:00Z', 'Grupo G', 'Estadio Los Ángeles', 'pending'),
  ('m39', 'uy', 'cv', '2026-06-21T18:00:00Z', 'Grupo H', 'Estadio Miami', 'pending'),
  ('m40', 'nz', 'eg', '2026-06-21T21:00:00Z', 'Grupo G', 'Estadio BC Place Vancouver', 'pending'),
  ('m41', 'ar', 'at', '2026-06-22T13:00:00Z', 'Grupo J', 'Estadio Dallas', 'pending'),
  ('m42', 'fr', 'iq', '2026-06-22T17:00:00Z', 'Grupo I', 'Estadio Filadelfia', 'pending'),
  ('m43', 'no', 'sn', '2026-06-22T20:00:00Z', 'Grupo I', 'Estadio Nueva York Nueva Jersey', 'pending'),
  ('m44', 'jo', 'dz', '2026-06-22T23:00:00Z', 'Grupo J', 'Estadio Bahía de San Francisco', 'pending'),
  ('m45', 'pt', 'uz', '2026-06-23T13:00:00Z', 'Grupo K', 'Estadio Houston', 'pending'),
  ('m46', 'gb-eng', 'gh', '2026-06-23T16:00:00Z', 'Grupo L', 'Estadio Boston', 'pending'),
  ('m47', 'pa', 'hr', '2026-06-23T19:00:00Z', 'Grupo L', 'Estadio Toronto', 'pending'),
  ('m48', 'co', 'cd', '2026-06-23T22:00:00Z', 'Grupo K', 'Estadio Guadalajara', 'pending'),
  ('m49', 'ch', 'ca', '2026-06-24T15:00:00Z', 'Grupo B', 'Estadio BC Place Vancouver', 'pending'),
  ('m50', 'ba', 'qa', '2026-06-24T15:00:00Z', 'Grupo B', 'Estadio Seattle', 'pending'),
  ('m51', 'gb-sct', 'br', '2026-06-24T18:00:00Z', 'Grupo C', 'Estadio Miami', 'pending'),
  ('m52', 'ma', 'ht', '2026-06-24T18:00:00Z', 'Grupo C', 'Estadio Atlanta', 'pending'),
  ('m53', 'cz', 'mx', '2026-06-24T21:00:00Z', 'Grupo A', 'Estadio Ciudad de México', 'pending'),
  ('m54', 'za', 'kr', '2026-06-24T21:00:00Z', 'Grupo A', 'Estadio Monterrey', 'pending'),
  ('m55', 'cw', 'ci', '2026-06-25T16:00:00Z', 'Grupo E', 'Estadio Filadelfia', 'pending'),
  ('m56', 'ec', 'de', '2026-06-25T16:00:00Z', 'Grupo E', 'Estadio Nueva York Nueva Jersey', 'pending'),
  ('m57', 'jp', 'se', '2026-06-25T19:00:00Z', 'Grupo F', 'Estadio Dallas', 'pending'),
  ('m58', 'tn', 'nl', '2026-06-25T19:00:00Z', 'Grupo F', 'Estadio Kansas City', 'pending'),
  ('m59', 'tr', 'us', '2026-06-25T22:00:00Z', 'Grupo D', 'Estadio Los Ángeles', 'pending'),
  ('m60', 'py', 'au', '2026-06-25T22:00:00Z', 'Grupo D', 'Estadio Bahía de San Francisco', 'pending'),
  ('m61', 'no', 'fr', '2026-06-26T15:00:00Z', 'Grupo I', 'Estadio Boston', 'pending'),
  ('m62', 'sn', 'iq', '2026-06-26T15:00:00Z', 'Grupo I', 'Estadio Toronto', 'pending'),
  ('m63', 'cv', 'sa', '2026-06-26T20:00:00Z', 'Grupo H', 'Estadio Houston', 'pending'),
  ('m64', 'uy', 'es', '2026-06-26T20:00:00Z', 'Grupo H', 'Estadio Guadalajara', 'pending'),
  ('m65', 'eg', 'ir', '2026-06-26T23:00:00Z', 'Grupo G', 'Estadio Seattle', 'pending'),
  ('m66', 'nz', 'be', '2026-06-26T23:00:00Z', 'Grupo G', 'Estadio BC Place Vancouver', 'pending'),
  ('m67', 'pa', 'gb-eng', '2026-06-27T17:00:00Z', 'Grupo L', 'Estadio Nueva York Nueva Jersey', 'pending'),
  ('m68', 'hr', 'gh', '2026-06-27T17:00:00Z', 'Grupo L', 'Estadio Filadelfia', 'pending'),
  ('m69', 'co', 'pt', '2026-06-27T19:30:00Z', 'Grupo K', 'Estadio Miami', 'pending'),
  ('m70', 'cd', 'uz', '2026-06-27T19:30:00Z', 'Grupo K', 'Estadio Atlanta', 'pending'),
  ('m71', 'dz', 'at', '2026-06-27T22:00:00Z', 'Grupo J', 'Estadio Kansas City', 'pending'),
  ('m72', 'jo', 'ar', '2026-06-27T22:00:00Z', 'Grupo J', 'Estadio Dallas', 'pending'),
  ('m73', NULL, NULL, '2026-06-28T12:00:00Z', '16avos', 'Estadio Los Ángeles', 'pending'),
  ('m74', NULL, NULL, '2026-06-29T12:00:00Z', '16avos', 'Estadio Boston', 'pending'),
  ('m75', NULL, NULL, '2026-06-29T16:00:00Z', '16avos', 'Estadio Monterrey', 'pending'),
  ('m76', NULL, NULL, '2026-06-29T19:00:00Z', '16avos', 'Estadio Houston', 'pending'),
  ('m77', NULL, NULL, '2026-06-30T12:00:00Z', '16avos', 'Estadio Nueva York Nueva Jersey', 'pending'),
  ('m78', NULL, NULL, '2026-06-30T16:00:00Z', '16avos', 'Estadio Dallas', 'pending'),
  ('m79', NULL, NULL, '2026-06-30T19:00:00Z', '16avos', 'Estadio Ciudad de México', 'pending'),
  ('m80', NULL, NULL, '2026-07-01T12:00:00Z', '16avos', 'Estadio Atlanta', 'pending'),
  ('m81', NULL, NULL, '2026-07-01T16:00:00Z', '16avos', 'Estadio Bahía de San Francisco', 'pending'),
  ('m82', NULL, NULL, '2026-07-01T19:00:00Z', '16avos', 'Estadio Seattle', 'pending'),
  ('m83', NULL, NULL, '2026-07-02T12:00:00Z', '16avos', 'Estadio Toronto', 'pending'),
  ('m84', NULL, NULL, '2026-07-02T16:00:00Z', '16avos', 'Estadio Los Ángeles', 'pending'),
  ('m85', NULL, NULL, '2026-07-02T19:00:00Z', '16avos', 'Estadio BC Place Vancouver', 'pending'),
  ('m86', NULL, NULL, '2026-07-03T12:00:00Z', '16avos', 'Estadio Miami', 'pending'),
  ('m87', NULL, NULL, '2026-07-03T16:00:00Z', '16avos', 'Estadio Kansas City', 'pending'),
  ('m88', NULL, NULL, '2026-07-03T19:00:00Z', '16avos', 'Estadio Dallas', 'pending'),
  ('m89', NULL, NULL, '2026-07-04T12:00:00Z', 'Octavos', 'Estadio Filadelfia', 'pending'),
  ('m90', NULL, NULL, '2026-07-04T16:00:00Z', 'Octavos', 'Estadio Houston', 'pending'),
  ('m91', NULL, NULL, '2026-07-05T12:00:00Z', 'Octavos', 'Estadio Nueva York Nueva Jersey', 'pending'),
  ('m92', NULL, NULL, '2026-07-05T16:00:00Z', 'Octavos', 'Estadio Ciudad de México', 'pending'),
  ('m93', NULL, NULL, '2026-07-06T12:00:00Z', 'Octavos', 'Estadio Dallas', 'pending'),
  ('m94', NULL, NULL, '2026-07-06T16:00:00Z', 'Octavos', 'Estadio Seattle', 'pending'),
  ('m95', NULL, NULL, '2026-07-07T12:00:00Z', 'Octavos', 'Estadio Atlanta', 'pending'),
  ('m96', NULL, NULL, '2026-07-07T16:00:00Z', 'Octavos', 'Estadio BC Place Vancouver', 'pending'),
  ('m97', NULL, NULL, '2026-07-09T16:00:00Z', 'Cuartos', 'Estadio Boston', 'pending'),
  ('m98', NULL, NULL, '2026-07-10T16:00:00Z', 'Cuartos', 'Estadio Los Ángeles', 'pending'),
  ('m99', NULL, NULL, '2026-07-11T12:00:00Z', 'Cuartos', 'Estadio Miami', 'pending'),
  ('m100', NULL, NULL, '2026-07-11T16:00:00Z', 'Cuartos', 'Estadio Kansas City', 'pending'),
  ('m101', NULL, NULL, '2026-07-14T16:00:00Z', 'Semifinal', 'Estadio Dallas', 'pending'),
  ('m102', NULL, NULL, '2026-07-15T16:00:00Z', 'Semifinal', 'Estadio Atlanta', 'pending'),
  ('m103', NULL, NULL, '2026-07-18T16:00:00Z', '3er Puesto', 'Estadio Miami', 'pending'),
  ('m104', NULL, NULL, '2026-07-19T16:00:00Z', 'Final', 'Estadio Nueva York Nueva Jersey', 'pending')
ON CONFLICT (id) DO NOTHING;
