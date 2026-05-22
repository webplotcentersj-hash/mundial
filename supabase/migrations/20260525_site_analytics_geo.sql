-- Geolocalización aproximada de visitas (headers Vercel / edge).

alter table public.site_page_views
  add column if not exists country_code text,
  add column if not exists country_name text,
  add column if not exists region_code text,
  add column if not exists region_name text,
  add column if not exists city text;

create index if not exists site_page_views_country_idx on public.site_page_views (country_code);
create index if not exists site_page_views_region_idx on public.site_page_views (region_name);

comment on column public.site_page_views.country_code is 'ISO 3166-1 alpha-2 (ej. AR, MX)';
comment on column public.site_page_views.region_name is 'Provincia/estado inferido del edge (ej. San Juan)';
