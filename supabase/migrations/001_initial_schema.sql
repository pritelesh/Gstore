-- ============================================
-- KGStore — Initial Schema Migration
-- ============================================

-- 1. PROFILES (extends auth.users)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'customer' check (role in ('customer','seller','admin')),
  full_name   text not null,
  email       text not null,
  phone       text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 2. CATEGORIES
create table public.categories (
  id         bigint generated always as identity primary key,
  name       text not null unique,
  type       text not null default 'normal' check (type in ('normal','seasonal')),
  season     text check (season in ('rainy','summer','winter', null)),
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

-- 3. STORES
create table public.stores (
  id          bigint generated always as identity primary key,
  seller_id   uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  description text,
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at  timestamptz not null default now()
);

alter table public.stores enable row level security;

-- 4. PRODUCTS (images stored as JSONB array of URLs)
create table public.products (
  id           bigint generated always as identity primary key,
  store_id     bigint not null references public.stores(id) on delete cascade,
  category_id  bigint not null references public.categories(id) on delete cascade,
  name         text not null,
  description  text,
  price        numeric(10,2) not null check (price >= 0),
  stock        integer not null default 0 check (stock >= 0),
  images       jsonb default '[]'::jsonb,
  status       text not null default 'pending' check (status in ('pending','approved','rejected','active')),
  created_at   timestamptz not null default now()
);

alter table public.products enable row level security;

-- 5. ORDERS
create table public.orders (
  id              bigint generated always as identity primary key,
  customer_id     uuid not null references public.profiles(id) on delete cascade,
  total           numeric(10,2) not null check (total >= 0),
  status          text not null default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  courier_name    text,
  tracking_status text,
  created_at      timestamptz not null default now()
);

alter table public.orders enable row level security;

-- 6. ORDER ITEMS
create table public.order_items (
  id         bigint generated always as identity primary key,
  order_id   bigint not null references public.orders(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  quantity   integer not null check (quantity > 0),
  price      numeric(10,2) not null check (price >= 0)
);

alter table public.order_items enable row level security;

-- 7. CART ITEMS
create table public.cart_items (
  id           bigint generated always as identity primary key,
  customer_id  uuid not null references public.profiles(id) on delete cascade,
  product_id   bigint not null references public.products(id) on delete cascade,
  quantity     integer not null default 1 check (quantity > 0)
);

alter table public.cart_items enable row level security;

-- 8. CASHOUT REQUESTS
create table public.cashout_requests (
  id         bigint generated always as identity primary key,
  seller_id  uuid not null references public.profiles(id) on delete cascade,
  amount     numeric(10,2) not null check (amount > 0),
  status     text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

alter table public.cashout_requests enable row level security;


-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Helper: is_admin()
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper: is_seller()
create or replace function public.is_seller()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'seller'
  );
$$;

-- ---------- PROFILES ----------
create policy "Users can read own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

create policy "Admins can read all profiles"
  on public.profiles for select
  using ( public.is_admin() );

create policy "Admins can update any profile"
  on public.profiles for update
  using ( public.is_admin() );

-- signed-up users may insert their own profile row
create policy "Users can insert own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );


-- ---------- CATEGORIES ----------
create policy "Anyone can read categories"
  on public.categories for select
  using ( true );

create policy "Admins can write categories"
  on public.categories for insert
  with check ( public.is_admin() );

create policy "Admins can update categories"
  on public.categories for update
  using ( public.is_admin() );

create policy "Admins can delete categories"
  on public.categories for delete
  using ( public.is_admin() );


-- ---------- STORES ----------
create policy "Anyone can read approved stores"
  on public.stores for select
  using ( status = 'approved' );

create policy "Sellers can read own stores"
  on public.stores for select
  using ( seller_id = auth.uid() );

create policy "Sellers can create stores"
  on public.stores for insert
  with check ( seller_id = auth.uid() );

create policy "Sellers can update own stores"
  on public.stores for update
  using ( seller_id = auth.uid() );

create policy "Admins can read all stores"
  on public.stores for select
  using ( public.is_admin() );

create policy "Admins can update any store"
  on public.stores for update
  using ( public.is_admin() );

create policy "Admins can delete stores"
  on public.stores for delete
  using ( public.is_admin() );


-- ---------- PRODUCTS ----------
create policy "Anyone can read active products"
  on public.products for select
  using ( status = 'active' );

create policy "Sellers can read own products"
  on public.products for select
  using (
    exists (
      select 1 from public.stores
      where stores.id = products.store_id
        and stores.seller_id = auth.uid()
    )
  );

create policy "Sellers can create products in own stores"
  on public.products for insert
  with check (
    exists (
      select 1 from public.stores
      where stores.id = products.store_id
        and stores.seller_id = auth.uid()
    )
  );

create policy "Sellers can update own products"
  on public.products for update
  using (
    exists (
      select 1 from public.stores
      where stores.id = products.store_id
        and stores.seller_id = auth.uid()
    )
  );

create policy "Sellers can delete own products"
  on public.products for delete
  using (
    exists (
      select 1 from public.stores
      where stores.id = products.store_id
        and stores.seller_id = auth.uid()
    )
  );

create policy "Admins can read all products"
  on public.products for select
  using ( public.is_admin() );

create policy "Admins can update any product"
  on public.products for update
  using ( public.is_admin() );

create policy "Admins can delete products"
  on public.products for delete
  using ( public.is_admin() );


-- ---------- ORDERS ----------
create policy "Customers can read own orders"
  on public.orders for select
  using ( customer_id = auth.uid() );

create policy "Customers can create orders"
  on public.orders for insert
  with check ( customer_id = auth.uid() );

create policy "Sellers can read orders containing their products"
  on public.orders for select
  using (
    exists (
      select 1 from public.order_items oi
      join public.products p on p.id = oi.product_id
      join public.stores s on s.id = p.store_id
      where oi.order_id = orders.id
        and s.seller_id = auth.uid()
    )
  );

create policy "Admins can read all orders"
  on public.orders for select
  using ( public.is_admin() );

create policy "Admins can update orders"
  on public.orders for update
  using ( public.is_admin() );


-- ---------- ORDER ITEMS ----------
create policy "Customers can read own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.customer_id = auth.uid()
    )
  );

create policy "Sellers can read items in their orders"
  on public.order_items for select
  using (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = order_items.product_id
        and s.seller_id = auth.uid()
    )
  );

create policy "Admins can read all order items"
  on public.order_items for select
  using ( public.is_admin() );


-- ---------- CART ITEMS ----------
create policy "Customers can read own cart"
  on public.cart_items for select
  using ( customer_id = auth.uid() );

create policy "Customers can insert into own cart"
  on public.cart_items for insert
  with check ( customer_id = auth.uid() );

create policy "Customers can update own cart"
  on public.cart_items for update
  using ( customer_id = auth.uid() );

create policy "Customers can delete from own cart"
  on public.cart_items for delete
  using ( customer_id = auth.uid() );

create policy "Admins can read all cart items"
  on public.cart_items for select
  using ( public.is_admin() );


-- ---------- CASHOUT REQUESTS ----------
create policy "Sellers can read own cashout requests"
  on public.cashout_requests for select
  using ( seller_id = auth.uid() );

create policy "Sellers can create cashout requests"
  on public.cashout_requests for insert
  with check ( seller_id = auth.uid() and public.is_seller() );

create policy "Admins can read all cashout requests"
  on public.cashout_requests for select
  using ( public.is_admin() );

create policy "Admins can update cashout requests"
  on public.cashout_requests for update
  using ( public.is_admin() );


-- ============================================
-- SEED DATA
-- ============================================

-- Categories
insert into public.categories (name, type, season) values
  ('Electronics',   'normal',   null),
  ('Clothing',      'normal',   null),
  ('Home & Garden', 'normal',   null),
  ('Books',         'normal',   null),
  ('Sports',        'normal',   null),
  ('Rainy Season',  'seasonal', 'rainy'),
  ('Summer Season', 'seasonal', 'summer'),
  ('Winter Season', 'seasonal', 'winter');
