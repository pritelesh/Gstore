-- ============================================
-- KGStore — Add product variant columns
-- ============================================

-- Add sizes & colors variant arrays to products
-- (nullable text[], default NULL) for sellers' optional variant input.
alter table public.products
  add column if not exists sizes text[] default null,
  add column if not exists colors text[] default null;
