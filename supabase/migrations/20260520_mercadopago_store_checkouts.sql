-- Mercado Pago: checkouts del Store y vínculo con pedidos de impresión

create table if not exists public.store_checkouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  total_ars integer not null check (total_ars > 0),
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  mp_preference_id text,
  mp_payment_id text,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'in_process', 'approved', 'rejected', 'cancelled')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists store_checkouts_user_id_idx on public.store_checkouts (user_id);
create index if not exists store_checkouts_payment_status_idx on public.store_checkouts (payment_status);

alter table public.store_checkouts enable row level security;

drop policy if exists "store_checkouts_select_own" on public.store_checkouts;
create policy "store_checkouts_select_own"
  on public.store_checkouts for select
  using (auth.uid() = user_id);

drop policy if exists "store_checkouts_select_admin" on public.store_checkouts;
create policy "store_checkouts_select_admin"
  on public.store_checkouts for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "store_checkouts_insert_own" on public.store_checkouts;
create policy "store_checkouts_insert_own"
  on public.store_checkouts for insert
  with check (auth.uid() = user_id);

alter table public.print_orders
  add column if not exists checkout_id uuid references public.store_checkouts (id) on delete set null;

alter table public.print_orders drop constraint if exists print_orders_status_check;

alter table public.print_orders
  add constraint print_orders_status_check
  check (status in ('awaiting_payment', 'pending', 'in_review', 'printing', 'ready', 'shipped', 'cancelled'));

create or replace function public.touch_store_checkouts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists store_checkouts_touch_updated on public.store_checkouts;
create trigger store_checkouts_touch_updated
  before update on public.store_checkouts
  for each row
  execute function public.touch_store_checkouts_updated_at();
