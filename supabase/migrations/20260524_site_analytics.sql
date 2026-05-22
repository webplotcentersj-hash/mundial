-- Analytics de visitas (page views) para panel admin.

create table if not exists public.site_page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  referrer text,
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  user_agent text,
  user_id uuid references auth.users (id) on delete set null,
  session_id text not null,
  is_authenticated boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists site_page_views_created_at_idx on public.site_page_views (created_at desc);
create index if not exists site_page_views_path_idx on public.site_page_views (path);
create index if not exists site_page_views_referrer_host_idx on public.site_page_views (referrer_host);
create index if not exists site_page_views_session_idx on public.site_page_views (session_id, created_at desc);

comment on table public.site_page_views is 'Registro de visitas por página para estadísticas en admin';

alter table public.site_page_views enable row level security;

drop policy if exists "site_page_views_admin_select" on public.site_page_views;
create policy "site_page_views_admin_select"
  on public.site_page_views for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
