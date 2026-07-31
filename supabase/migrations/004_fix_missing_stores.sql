-- ============================================
-- KGStore — Fix: create missing helper functions
-- and stores table, reconcile profiles column
-- ============================================

-- 1. Helper functions (never applied from 001_initial_schema)

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

-- 2. Ensure profiles has full_name column
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'name'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'full_name'
  ) then
    alter table public.profiles rename column name to full_name;
  end if;
end $$;

-- 3. Create stores table if it does not exist
create table if not exists public.stores (
  id          bigint generated always as identity primary key,
  seller_id   uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  description text,
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at  timestamptz not null default now()
);

alter table public.stores enable row level security;

-- 4. RLS policies for stores

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Anyone can read approved stores' and tablename = 'stores') then
    create policy "Anyone can read approved stores" on public.stores for select using ( status = 'approved' );
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Sellers can read own stores' and tablename = 'stores') then
    create policy "Sellers can read own stores" on public.stores for select using ( seller_id = auth.uid() );
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Sellers can create stores' and tablename = 'stores') then
    create policy "Sellers can create stores" on public.stores for insert with check ( seller_id = auth.uid() );
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Sellers can update own stores' and tablename = 'stores') then
    create policy "Sellers can update own stores" on public.stores for update using ( seller_id = auth.uid() );
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Admins can read all stores' and tablename = 'stores') then
    create policy "Admins can read all stores" on public.stores for select using ( public.is_admin() );
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Admins can update any store' and tablename = 'stores') then
    create policy "Admins can update any store" on public.stores for update using ( public.is_admin() );
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Admins can delete stores' and tablename = 'stores') then
    create policy "Admins can delete stores" on public.stores for delete using ( public.is_admin() );
  end if;
end $$;

-- 5. Backfill store rows for existing seller profiles that don't have one
insert into public.stores (seller_id, name, description, status)
select
  p.id,
  p.full_name || '''s Store',
  null,
  'pending'
from public.profiles p
where p.role = 'seller'
  and not exists (
    select 1 from public.stores s
    where s.seller_id = p.id
  );
