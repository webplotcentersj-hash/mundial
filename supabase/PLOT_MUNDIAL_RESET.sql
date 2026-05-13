-- =============================================================================
-- Plot Mundial — RESET (borra datos y tablas de la app en public)
-- Ejecutar en Supabase → SQL Editor como postgres / service role.
-- NO borra usuarios de auth.users; sí borra public.profiles (recrear con setup).
-- Después de esto: ejecutar en orden plot-mundial-schema-aggiornato.sql
--    (o manualmente supabase_setup.sql y luego supabase_migration_1.sql).
-- =============================================================================

-- Triggers que referencian tablas que vamos a tirar
DROP TRIGGER IF EXISTS on_bracket_updated ON public.brackets;
DROP TRIGGER IF EXISTS on_official_bracket_updated ON public.official_bracket;
DROP TRIGGER IF EXISTS on_prediction_updated ON public.predictions;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP TABLE IF EXISTS public.user_medals CASCADE;
DROP TABLE IF EXISTS public.league_members CASCADE;
DROP TABLE IF EXISTS public.leagues CASCADE;
DROP TABLE IF EXISTS public.brackets CASCADE;
DROP TABLE IF EXISTS public.official_bracket CASCADE;
DROP TABLE IF EXISTS public.predictions CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
