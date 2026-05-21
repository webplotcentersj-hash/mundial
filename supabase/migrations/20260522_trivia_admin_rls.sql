-- Admin puede leer respuestas de trivia de cualquier usuario (panel + sync ranking).

drop policy if exists "trivia_answers_admin_select" on public.trivia_user_answers;
create policy "trivia_answers_admin_select"
  on public.trivia_user_answers for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Upsert del banco de preguntas (insert + update en conflict).
drop policy if exists "trivia_questions_admin_insert" on public.trivia_questions;
create policy "trivia_questions_admin_insert"
  on public.trivia_questions for insert
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "trivia_questions_authenticated_insert" on public.trivia_questions;
drop policy if exists "trivia_questions_authenticated_upsert" on public.trivia_questions;
create policy "trivia_questions_authenticated_upsert"
  on public.trivia_questions for insert
  with check (auth.uid() is not null);
