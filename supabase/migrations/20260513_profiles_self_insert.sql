-- Plot Mundial: allow each auth user to INSERT their own profiles row.
-- Required for predictions FK (predictions.user_id -> profiles.id) when the
-- auth trigger did not run (legacy users) or failed. Safe: only auth.uid() = id.
-- Run once in Supabase SQL Editor on the project backing production.

drop policy if exists "Los usuarios pueden insertar su propio perfil" on public.profiles;

create policy "Los usuarios pueden insertar su propio perfil"
  on public.profiles
  for insert
  with check (auth.uid() = id);
