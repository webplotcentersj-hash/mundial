-- Imágenes de variantes para imprenta (admin)

alter table public.print_orders
  add column if not exists variant_image_url text,
  add column if not exists combo_sticker_image_url text,
  add column if not exists combo_poster_image_url text;

comment on column public.print_orders.variant_image_url is 'Poster o plancha individual (/Poster/... o /stiker/...).';
comment on column public.print_orders.combo_sticker_image_url is 'Plancha del combo.';
comment on column public.print_orders.combo_poster_image_url is 'Poster del combo.';
