-- Store: URLs de arte del cliente (figurita alta calidad) y archivo que sube el admin.

alter table public.print_orders
  add column if not exists customer_image_url text,
  add column if not exists admin_file_url text;

comment on column public.print_orders.customer_image_url is 'PNG/JPEG público en Storage (ej. figurita para imprimir).';
comment on column public.print_orders.admin_file_url is 'Archivo subido por admin (prueba, pliego, etc.).';

-- Bucket público para leer previews sin firmar (escritura acotada por RLS).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'store-prints',
  'store-prints',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Lectura pública de objetos en este bucket
drop policy if exists "store_prints_select_public" on storage.objects;
create policy "store_prints_select_public"
  on storage.objects for select
  using (bucket_id = 'store-prints');

-- Usuario: subir solo bajo carpeta con su UUID
drop policy if exists "store_prints_insert_authenticated" on storage.objects;
create policy "store_prints_insert_authenticated"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'store-prints'
    and (
      split_part(name, '/', 1) = auth.uid()::text
      or (
        split_part(name, '/', 1) = 'admin'
        and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
      )
    )
  );

drop policy if exists "store_prints_update_authenticated" on storage.objects;
create policy "store_prints_update_authenticated"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'store-prints'
    and (
      split_part(name, '/', 1) = auth.uid()::text
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    )
  );

drop policy if exists "store_prints_delete_authenticated" on storage.objects;
create policy "store_prints_delete_authenticated"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'store-prints'
    and (
      split_part(name, '/', 1) = auth.uid()::text
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    )
  );
