-- Al cargar resultados oficiales, el servidor (sesión admin) actualiza
-- predictions.points_earned y profiles.total_points de TODOS los jugadores.
-- Sin estas políticas, RLS solo permite que cada usuario edite lo suyo y esas
-- actualizaciones fallan en silencio: el ranking queda en 0.

drop policy if exists "Admins pueden actualizar predicciones (puntos)" on public.predictions;

create policy "Admins pueden actualizar predicciones (puntos)"
  on public.predictions
  for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admins pueden actualizar perfiles (ranking)" on public.profiles;

create policy "Admins pueden actualizar perfiles (ranking)"
  on public.profiles
  for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
