-- CRAWLFAST category management
-- Jalankan setelah 001_products_and_discounts.sql di Supabase SQL Editor.
-- Aman dijalankan ulang (idempotent).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint categories_name_length check (char_length(name) between 2 and 60),
  constraint categories_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and slug !~ '^[0-9]+$'
  ),
  constraint categories_sort_order_check check (sort_order between 0 and 9999)
);

create index if not exists categories_active_sort_idx
  on public.categories (is_active, sort_order, name);

-- Seed kategori yang sudah dipakai produk lama agar foreign key di bawah aman.
insert into public.categories (name, slug, sort_order)
select distinct
  category,
  trim(both '-' from regexp_replace(lower(category), '[^a-z0-9]+', '-', 'g')),
  100
from public.products
where category <> ''
on conflict do nothing;

-- Kategori dasar. Admin bisa menambah/mengubah/menghapus lewat panel.
insert into public.categories (name, slug, sort_order)
values
  ('T-Shirts', 't-shirts', 10),
  ('Outerwear', 'outerwear', 20),
  ('Shirts', 'shirts', 30),
  ('Accessories', 'accessories', 40),
  ('Bottoms', 'bottoms', 50),
  ('Knitwear', 'knitwear', 60)
on conflict do nothing;

-- Ganti daftar kategori hardcoded dengan foreign key ke tabel categories.
alter table public.products
  drop constraint if exists products_category_check;

alter table public.products
  drop constraint if exists products_category_fkey;

alter table public.products
  add constraint products_category_fkey
  foreign key (category)
  references public.categories(name)
  on update cascade
  on delete restrict;

-- Dukungan ukuran XXL (sebelumnya 2XL tidak diterima).
update public.products
set sizes = array_replace(sizes, '2XL', 'XXL')
where '2XL' = any(sizes);

alter table public.products
  drop constraint if exists products_sizes_check;

alter table public.products
  add constraint products_sizes_check check (
    cardinality(sizes) > 0
    and sizes <@ array['S', 'M', 'L', 'XL', 'XXL', 'All Size']::text[]
  );

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;

drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories"
on public.categories
for select
to anon, authenticated
using (is_active = true);

grant select on public.categories to anon, authenticated;
