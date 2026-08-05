-- ============================================
-- KGStore — 2-level category hierarchy
-- Adds parent_id, normalizes parent row names,
-- and seeds the full category tree.
-- Idempotent & safe against re-runs.
-- ============================================

-- 1. parent_id self-referencing FK.
--    ON DELETE RESTRICT chosen (safer than CASCADE): deleting a parent
--    that still contains subcategories is blocked instead of silently
--    cascade-deleting every child (which would cause data loss and break
--    name-based category lookups used by the app).
alter table public.categories
  add column if not exists parent_id uuid
    references public.categories (id) on delete restrict;

create index if not exists categories_parent_id_idx
  on public.categories (parent_id);

-- 2a. Ensure name is unique BEFORE any inserts below, since the inserts use
--     ON CONFLICT (name). Live has categories_name_key; this guard makes the
--     migration safe even where it doesn't exist yet.
do $$
begin
  if not exists (
    select 1
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any(con.conkey)
    where rel.relname = 'categories'
      and con.contype = 'u'
      and att.attname = 'name'
  ) then
    alter table public.categories
      add constraint categories_name_key unique (name);
  end if;
end $$;

-- 2. Normalize existing top-level rows into canonical parent names.
--    (Row id is unchanged, so any existing products.category_id stays valid.)
update public.categories set name = 'Home',     slug = 'home'     where name = 'Home & Living';
update public.categories set name = 'Clothing', slug = 'clothing' where name = 'Fashion';

-- Ensure canonical parents exist (Electronics & Sports already present;
-- Clothing & Home come from the renames above; Seasonal is created now).
insert into public.categories (name, slug) values
  ('Electronics', 'electronics'),
  ('Sports',      'sports'),
  ('Clothing',    'clothing'),
  ('Home',        'home'),
  ('Seasonal',    'seasonal')
on conflict (name) do nothing;

-- 3. Insert subcategories under their parents.
do $$
declare
  v_clothing uuid;
  v_elec     uuid;
  v_home     uuid;
  v_sports   uuid;
  v_seasonal uuid;
begin
  select id into v_clothing from public.categories where name = 'Clothing';
  select id into v_elec     from public.categories where name = 'Electronics';
  select id into v_home     from public.categories where name = 'Home';
  select id into v_sports   from public.categories where name = 'Sports';
  select id into v_seasonal from public.categories where name = 'Seasonal';

  -- Clothing
  insert into public.categories (name, slug, parent_id) values
    ('Men', 'men', v_clothing),
    ('Women', 'women', v_clothing),
    ('Kids', 'kids', v_clothing)
  on conflict (name) do nothing;

  -- Electronics
  insert into public.categories (name, slug, parent_id) values
    ('Phone', 'phone', v_elec),
    ('Laptop/PC', 'laptop-pc', v_elec),
    ('Smart Watch', 'smart-watch', v_elec),
    ('TV', 'tv', v_elec),
    ('Refrigerator', 'refrigerator', v_elec),
    ('Air Conditioner', 'air-conditioner', v_elec),
    ('Camera', 'camera', v_elec),
    ('Speaker', 'speaker', v_elec),
    ('Headphone', 'headphone', v_elec)
  on conflict (name) do nothing;

  -- Home
  insert into public.categories (name, slug, parent_id) values
    ('Furniture', 'furniture', v_home),
    ('Wall Clock', 'wall-clock', v_home),
    ('Showpiece', 'showpiece', v_home),
    ('Kitchen Appliances', 'kitchen-appliances', v_home),
    ('Kitchen Utensils', 'kitchen-utensils', v_home),
    ('Washroom Accessories', 'washroom-accessories', v_home),
    ('Home Decor & Lighting', 'home-decor-lighting', v_home)
  on conflict (name) do nothing;

  -- Sports
  insert into public.categories (name, slug, parent_id) values
    ('Turf Shoes', 'turf-shoes', v_sports),
    ('Cricket Bat', 'cricket-bat', v_sports),
    ('Cricket Ball', 'cricket-ball', v_sports),
    ('Football', 'football', v_sports),
    ('Gym Equipment', 'gym-equipment', v_sports),
    ('Badminton Racket', 'badminton-racket', v_sports),
    ('Yoga Mat', 'yoga-mat', v_sports),
    ('Sports Wear', 'sports-wear', v_sports)
  on conflict (name) do nothing;

  -- Seasonal
  insert into public.categories (name, slug, parent_id) values
    ('Rainy', 'rainy', v_seasonal),
    ('Summer', 'summer', v_seasonal),
    ('Winter', 'winter', v_seasonal)
  on conflict (name) do nothing;
end $$;

-- 4. RLS — ensure every category row is publicly readable and parent rows
--    remain admin-writable (idempotent; guards against missing helpers).
do $$
begin
  if not exists (select 1 from pg_policies
                 where policyname = 'Anyone can read categories' and tablename = 'categories') then
    create policy "Anyone can read categories"
      on public.categories for select using ( true );
  end if;

  if to_regprocedure('public.is_admin()') is not null then
    if not exists (select 1 from pg_policies
                   where policyname = 'Admins can insert categories' and tablename = 'categories') then
      create policy "Admins can insert categories"
        on public.categories for insert with check ( public.is_admin() );
    end if;
    if not exists (select 1 from pg_policies
                   where policyname = 'Admins can update categories' and tablename = 'categories') then
      create policy "Admins can update categories"
        on public.categories for update using ( public.is_admin() );
    end if;
    if not exists (select 1 from pg_policies
                   where policyname = 'Admins can delete categories' and tablename = 'categories') then
      create policy "Admins can delete categories"
        on public.categories for delete using ( public.is_admin() );
    end if;
  end if;
end $$;