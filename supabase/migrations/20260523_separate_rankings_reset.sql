-- Rankings separados: prode (fixture) vs trivia. Reset general a 0.

alter table public.profiles
  add column if not exists fixture_points integer not null default 0,
  add column if not exists trivia_points integer not null default 0;

comment on column public.profiles.fixture_points is 'Puntos del prode (pronósticos del fixture)';
comment on column public.profiles.trivia_points is 'Puntos de trivia mundialista';
comment on column public.profiles.total_points is 'Compatibilidad: refleja fixture_points (solo prode)';

-- Arranque en cero
update public.profiles
set fixture_points = 0,
    trivia_points = 0,
    total_points = 0;

update public.predictions
set points_earned = 0
where coalesce(points_earned, 0) <> 0;

delete from public.trivia_user_answers;
