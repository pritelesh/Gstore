-- ============================================
-- KGStore — Product Approval System Migration
-- ============================================

-- 1. Add rejection_reason column to products
alter table public.products
  add column if not exists rejection_reason text;

-- 2. Add seller_id column for direct seller lookup (denormalized, kept in sync)
alter table public.products
  add column if not exists seller_id uuid references public.profiles(id) on delete cascade;

-- Back-fill seller_id from stores for existing rows
update public.products
  set seller_id = stores.seller_id
  from public.stores
  where products.store_id = stores.id
    and products.seller_id is null;

-- Keep seller_id in sync via trigger
create or replace function public.sync_product_seller_id()
returns trigger
language plpgsql
security definer
as $$
begin
  if NEW.store_id is distinct from OLD.store_id or OLD.store_id is null then
    NEW.seller_id := (select seller_id from public.stores where id = NEW.store_id);
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_sync_product_seller_id on public.products;
create trigger trg_sync_product_seller_id
  before insert or update of store_id
  on public.products
  for each row
  execute function public.sync_product_seller_id();

-- 3. Create storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 4. Storage policies

-- Public can read product-images
create policy "Anyone can read product-images"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

-- Authenticated sellers can upload to product-images
drop policy if exists "Sellers can upload product-images" on storage.objects;
create policy "Sellers can upload product-images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'seller'
    )
  );

-- Sellers can update/delete own uploads
drop policy if exists "Sellers can manage own product-images" on storage.objects;
create policy "Sellers can manage own product-images"
  on storage.objects for all
  using (
    bucket_id = 'product-images'
    and auth.uid() = owner
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'seller'
    )
  );

-- 5. Extended RLS policies for products

-- Sellers can read all their own products (not just active)
-- (Already exists: "Sellers can read own products")

-- Sellers can only insert with status='pending' (can't self-approve)
drop policy if exists "Sellers can create products in own stores" on public.products;
create policy "Sellers can create products in own stores"
  on public.products for insert
  with check (
    status = 'pending'
    and exists (
      select 1 from public.stores
      where stores.id = store_id
        and stores.seller_id = auth.uid()
    )
  );

-- Sellers cannot update the status column
drop policy if exists "Sellers can update own products (except status)" on public.products;
create policy "Sellers can update own products (except status)"
  on public.products for update
  using (
    exists (
      select 1 from public.stores
      where stores.id = store_id
        and stores.seller_id = auth.uid()
    )
  )
  with check (
    status = (select status from public.products where id = id)
  );

-- Admins can read pending products for review
-- (Already exists: "Admins can read all products" covers this)

-- Admins can update status and rejection_reason
-- (Already exists: "Admins can update any product" covers this)
