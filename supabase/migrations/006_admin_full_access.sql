-- ============================================
-- KGStore — Admin Full Access RLS Policies
-- Ensures is_admin() has full CRUD on all tables
-- ============================================

-- Reference: existing RLS policies per table (live schema)
--   profiles:     Users read/update own; admins read/update all
--   stores:       Public read approved; sellers CRUD own; admins all
--   categories:   (likely none yet)
--   products:     (likely none yet — live schema has no policies)
--   orders:       (likely none yet — live schema has no policies)
--   order_items:  (likely none yet — live schema has no policies)
--   cashout_requests: (likely none yet — live schema has no policies)
--   sellers:      (likely none yet — live schema no policies)
--   seller_name_change_requests: (likely none yet)

-- Helper: skip policy creation if it already exists
create or replace function public._policy_exists(name text, tbl text)
returns boolean
language sql
stable
as $func$
  select exists (
    select 1 from pg_policies
    where policyname = name and tablename = tbl
  );
$func$;

-- ================================
-- PROFILES
-- ================================
do $$
begin
  if not public._policy_exists('Admins can read all profiles', 'profiles') then
    create policy "Admins can read all profiles"
      on public.profiles for select
      using ( public.is_admin() );
  end if;

  if not public._policy_exists('Admins can update any profile', 'profiles') then
    create policy "Admins can update any profile"
      on public.profiles for update
      using ( public.is_admin() );
  end if;

  if not public._policy_exists('Admins can delete profiles', 'profiles') then
    create policy "Admins can delete profiles"
      on public.profiles for delete
      using ( public.is_admin() );
  end if;
end $$;

-- ================================
-- STORES
-- ================================
do $$
begin
  if not public._policy_exists('Admins can read all stores', 'stores') then
    create policy "Admins can read all stores"
      on public.stores for select
      using ( public.is_admin() );
  end if;

  if not public._policy_exists('Admins can update any store', 'stores') then
    create policy "Admins can update any store"
      on public.stores for update
      using ( public.is_admin() );
  end if;

  if not public._policy_exists('Admins can delete stores', 'stores') then
    create policy "Admins can delete stores"
      on public.stores for delete
      using ( public.is_admin() );
  end if;
end $$;

-- ================================
-- CATEGORIES
-- ================================
do $$
begin
  if not public._policy_exists('Anyone can read categories', 'categories') then
    create policy "Anyone can read categories"
      on public.categories for select
      using ( true );
  end if;

  if not public._policy_exists('Admins can insert categories', 'categories') then
    create policy "Admins can insert categories"
      on public.categories for insert
      with check ( public.is_admin() );
  end if;

  if not public._policy_exists('Admins can update categories', 'categories') then
    create policy "Admins can update categories"
      on public.categories for update
      using ( public.is_admin() );
  end if;

  if not public._policy_exists('Admins can delete categories', 'categories') then
    create policy "Admins can delete categories"
      on public.categories for delete
      using ( public.is_admin() );
  end if;
end $$;

-- ================================
-- PRODUCTS
-- ================================
do $$
begin
  if not public._policy_exists('Anyone can read active products', 'products') then
    create policy "Anyone can read active products"
      on public.products for select
      using ( status = 'active' or status = 'approved' );
  end if;

  if not public._policy_exists('Sellers can read own products', 'products') then
    create policy "Sellers can read own products"
      on public.products for select
      using ( seller_id = auth.uid() );
  end if;

  if not public._policy_exists('Sellers can insert products', 'products') then
    create policy "Sellers can insert products"
      on public.products for insert
      with check ( seller_id = auth.uid() );
  end if;

  if not public._policy_exists('Sellers can update own products', 'products') then
    create policy "Sellers can update own products"
      on public.products for update
      using ( seller_id = auth.uid() );
  end if;

  if not public._policy_exists('Sellers can delete own products', 'products') then
    create policy "Sellers can delete own products"
      on public.products for delete
      using ( seller_id = auth.uid() );
  end if;

  if not public._policy_exists('Admins can read all products', 'products') then
    create policy "Admins can read all products"
      on public.products for select
      using ( public.is_admin() );
  end if;

  if not public._policy_exists('Admins can update any product', 'products') then
    create policy "Admins can update any product"
      on public.products for update
      using ( public.is_admin() );
  end if;

  if not public._policy_exists('Admins can delete products', 'products') then
    create policy "Admins can delete products"
      on public.products for delete
      using ( public.is_admin() );
  end if;
end $$;

-- ================================
-- ORDERS
-- ================================
do $$
begin
  if not public._policy_exists('Customers can read own orders', 'orders') then
    create policy "Customers can read own orders"
      on public.orders for select
      using ( customer_id = auth.uid() );
  end if;

  if not public._policy_exists('Customers can insert orders', 'orders') then
    create policy "Customers can insert orders"
      on public.orders for insert
      with check ( customer_id = auth.uid() );
  end if;

  if not public._policy_exists('Sellers can read own store orders', 'orders') then
    create policy "Sellers can read own store orders"
      on public.orders for select
      using (
        exists (
          select 1 from public.order_items oi
          where oi.order_id = orders.id and oi.seller_id = auth.uid()
        )
      );
  end if;

  if not public._policy_exists('Admins can read all orders', 'orders') then
    create policy "Admins can read all orders"
      on public.orders for select
      using ( public.is_admin() );
  end if;

  if not public._policy_exists('Admins can update orders', 'orders') then
    create policy "Admins can update orders"
      on public.orders for update
      using ( public.is_admin() );
  end if;

  if not public._policy_exists('Admins can delete orders', 'orders') then
    create policy "Admins can delete orders"
      on public.orders for delete
      using ( public.is_admin() );
  end if;
end $$;

-- ================================
-- ORDER ITEMS
-- ================================
do $$
begin
  if not public._policy_exists('Customers can read own order items', 'order_items') then
    create policy "Customers can read own order items"
      on public.order_items for select
      using (
        exists (
          select 1 from public.orders
          where orders.id = order_items.order_id and orders.customer_id = auth.uid()
        )
      );
  end if;

  if not public._policy_exists('Sellers can read own order items', 'order_items') then
    create policy "Sellers can read own order items"
      on public.order_items for select
      using ( seller_id = auth.uid() );
  end if;

  if not public._policy_exists('Admins can read all order items', 'order_items') then
    create policy "Admins can read all order items"
      on public.order_items for select
      using ( public.is_admin() );
  end if;

  if not public._policy_exists('Admins can update order items', 'order_items') then
    create policy "Admins can update order items"
      on public.order_items for update
      using ( public.is_admin() );
  end if;

  if not public._policy_exists('Admins can delete order items', 'order_items') then
    create policy "Admins can delete order items"
      on public.order_items for delete
      using ( public.is_admin() );
  end if;
end $$;

-- ================================
-- CASHOUT REQUESTS
-- ================================
do $$
begin
  if not public._policy_exists('Sellers can read own cashouts', 'cashout_requests') then
    create policy "Sellers can read own cashouts"
      on public.cashout_requests for select
      using ( seller_id = auth.uid() );
  end if;

  if not public._policy_exists('Sellers can insert cashouts', 'cashout_requests') then
    create policy "Sellers can insert cashouts"
      on public.cashout_requests for insert
      with check ( seller_id = auth.uid() and public.is_seller() );
  end if;

  if not public._policy_exists('Admins can read all cashouts', 'cashout_requests') then
    create policy "Admins can read all cashouts"
      on public.cashout_requests for select
      using ( public.is_admin() );
  end if;

  if not public._policy_exists('Admins can update cashouts', 'cashout_requests') then
    create policy "Admins can update cashouts"
      on public.cashout_requests for update
      using ( public.is_admin() );
  end if;

  if not public._policy_exists('Admins can delete cashouts', 'cashout_requests') then
    create policy "Admins can delete cashouts"
      on public.cashout_requests for delete
      using ( public.is_admin() );
  end if;
end $$;

-- ================================
-- SELLERS (live schema table)
-- ================================
do $$
begin
  if not public._policy_exists('Sellers can read own seller row', 'sellers') then
    create policy "Sellers can read own seller row"
      on public.sellers for select
      using ( user_id = auth.uid() );
  end if;

  if not public._policy_exists('Sellers can update own seller row', 'sellers') then
    create policy "Sellers can update own seller row"
      on public.sellers for update
      using ( user_id = auth.uid() );
  end if;

  if not public._policy_exists('Admins can read all sellers', 'sellers') then
    create policy "Admins can read all sellers"
      on public.sellers for select
      using ( public.is_admin() );
  end if;

  if not public._policy_exists('Admins can update any seller', 'sellers') then
    create policy "Admins can update any seller"
      on public.sellers for update
      using ( public.is_admin() );
  end if;

  if not public._policy_exists('Admins can delete sellers', 'sellers') then
    create policy "Admins can delete sellers"
      on public.sellers for delete
      using ( public.is_admin() );
  end if;
end $$;

-- ================================
-- SELLER NAME CHANGE REQUESTS
-- ================================
do $$
begin
  if not public._policy_exists('Sellers can read own name change requests', 'seller_name_change_requests') then
    create policy "Sellers can read own name change requests"
      on public.seller_name_change_requests for select
      using ( seller_id = auth.uid() );
  end if;

  if not public._policy_exists('Admins can read all name change requests', 'seller_name_change_requests') then
    create policy "Admins can read all name change requests"
      on public.seller_name_change_requests for select
      using ( public.is_admin() );
  end if;

  if not public._policy_exists('Admins can update name change requests', 'seller_name_change_requests') then
    create policy "Admins can update name change requests"
      on public.seller_name_change_requests for update
      using ( public.is_admin() );
  end if;

  if not public._policy_exists('Admins can delete name change requests', 'seller_name_change_requests') then
    create policy "Admins can delete name change requests"
      on public.seller_name_change_requests for delete
      using ( public.is_admin() );
  end if;
end $$;

-- Cleanup helper
drop function if exists public._policy_exists(text, text);
