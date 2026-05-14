-- Pedidos de imprenta (figuritas, stickers, posters)
-- Ejecutar en Supabase SQL Editor si no usás migraciones automáticas.

create table if not exists public.print_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_type text not null check (product_type in ('figurita', 'sticker', 'poster')),
  quantity integer not null default 1 check (quantity >= 1 and quantity <= 99),
  notes text,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  status text not null default 'pending'
    check (status in ('pending', 'in_review', 'printing', 'ready', 'shipped', 'cancelled')),
  admin_notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists print_orders_user_id_idx on public.print_orders (user_id);
create index if not exists print_orders_status_idx on public.print_orders (status);
create index if not exists print_orders_created_idx on public.print_orders (created_at desc);

alter table public.print_orders enable row level security;

-- Lectura: el dueño ve los suyos; los admins ven todo (políticas separadas).
drop policy if exists "print_orders_select_own" on public.print_orders;
create policy "print_orders_select_own"
  on public.print_orders for select
  using (auth.uid() = user_id);

drop policy if exists "print_orders_select_admin" on public.print_orders;
create policy "print_orders_select_admin"
  on public.print_orders for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "print_orders_insert_own" on public.print_orders;
create policy "print_orders_insert_own"
  on public.print_orders for insert
  with check (auth.uid() = user_id);

drop policy if exists "print_orders_update_admin" on public.print_orders;
create policy "print_orders_update_admin"
  on public.print_orders for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Mantener updated_at al editar (estado / notas admin).
create or replace function public.touch_print_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists print_orders_touch_updated on public.print_orders;
create trigger print_orders_touch_updated
  before update on public.print_orders
  for each row
  execute function public.touch_print_orders_updated_at();
