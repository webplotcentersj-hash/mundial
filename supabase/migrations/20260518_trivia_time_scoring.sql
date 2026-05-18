-- Trivia: tiempo de respuesta y desglose base + bonus en puntos

alter table public.trivia_user_answers
  add column if not exists response_time_ms integer,
  add column if not exists base_points integer not null default 0,
  add column if not exists time_bonus integer not null default 0;

alter table public.trivia_user_answers drop constraint if exists trivia_user_answers_selected_index_check;

alter table public.trivia_user_answers
  add constraint trivia_user_answers_selected_index_check
  check (selected_index >= -1 and selected_index <= 3);
