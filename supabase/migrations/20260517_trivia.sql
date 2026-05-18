-- Trivia mundialista: preguntas + respuestas por usuario (puntos suman a profiles.total_points)

create table if not exists public.trivia_questions (
  id text primary key,
  question text not null,
  options jsonb not null,
  correct_index smallint not null check (correct_index >= 0 and correct_index <= 3),
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  world_cup_year smallint,
  category text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.trivia_user_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_id text not null references public.trivia_questions (id) on delete cascade,
  selected_index smallint not null check (selected_index >= 0 and selected_index <= 3),
  correct boolean not null,
  points_earned integer not null default 0,
  answered_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, question_id)
);

create index if not exists trivia_user_answers_user_id_idx on public.trivia_user_answers (user_id);
create index if not exists trivia_questions_difficulty_idx on public.trivia_questions (difficulty);

alter table public.trivia_questions enable row level security;
alter table public.trivia_user_answers enable row level security;

drop policy if exists "trivia_questions_select_all" on public.trivia_questions;
create policy "trivia_questions_select_all"
  on public.trivia_questions for select using (true);

drop policy if exists "trivia_answers_select_own" on public.trivia_user_answers;
create policy "trivia_answers_select_own"
  on public.trivia_user_answers for select using (auth.uid() = user_id);

drop policy if exists "trivia_answers_insert_own" on public.trivia_user_answers;
create policy "trivia_answers_insert_own"
  on public.trivia_user_answers for insert with check (auth.uid() = user_id);

-- Siembra del banco: usuarios autenticados pueden insertar (upsert idempotente desde el servidor)
drop policy if exists "trivia_questions_authenticated_insert" on public.trivia_questions;
create policy "trivia_questions_authenticated_insert"
  on public.trivia_questions for insert
  with check (auth.uid() is not null);

drop policy if exists "trivia_questions_admin_update" on public.trivia_questions;
create policy "trivia_questions_admin_update"
  on public.trivia_questions for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
