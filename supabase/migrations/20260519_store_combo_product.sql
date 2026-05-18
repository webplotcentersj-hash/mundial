-- Store: tipo de producto "combo" en pedidos de impresión

alter table public.print_orders drop constraint if exists print_orders_product_type_check;

alter table public.print_orders
  add constraint print_orders_product_type_check
  check (product_type in ('figurita', 'sticker', 'poster', 'combo'));
