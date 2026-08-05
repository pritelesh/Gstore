-- ============================================
-- KGStore — Switch product ownership to the sellers model
-- Live products FK to sellers.id (there is NO products.store_id).
-- The app previously created rows in the legacy "stores" table at
-- signup, but products/order_items never referenced it on live.
--
-- This migration:
--   1. Back-fills one sellers row for every legacy stores row
--      (preserving store name, description, and approval status).
--   2. Deletes the legacy stores rows, which are now fully replaced
--      by the sellers table.
--
-- Idempotent & safe against re-runs.
-- ============================================

-- 1. Back-fill sellers from legacy stores.
insert into public.sellers (user_id, store_name, store_description, status)
select
  s.seller_id,
  s.name,
  s.description,
  s.status
from public.stores s
where not exists (
  select 1 from public.sellers se
  where se.user_id = s.seller_id
);

-- 2. Delete the legacy stores rows (products never referenced stores.id on live).
delete from public.stores;

-- 3. Sanity: report the resulting sellers rows so you can confirm the back-fill.
select id, user_id, store_name, store_description, status, created_at
from public.sellers
order by created_at;
