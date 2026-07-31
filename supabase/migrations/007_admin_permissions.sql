-- ============================================
-- KGStore — Admin Permissions Health & Fix
-- Functions used by the /admin/permissions page
-- so issues can be resolved from the UI.
-- ============================================

-- Health check: returns a JSONB map of critical checks
create or replace function public.get_permission_health()
returns jsonb
language plpgsql
security definer
stable
as $$
declare
  is_admin_fn boolean;
  stores_rls boolean;
  stores_admin_policy boolean;
  sellers_missing int;
  role_constraint_ok boolean;
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin role required';
  end if;

  -- 1. is_admin() helper exists
  select exists (
    select 1 from pg_proc
    where proname = 'is_admin'
      and pronamespace = 'public'::regnamespace
  ) into is_admin_fn;

  -- 2. stores table RLS enabled
  select relrowsecurity into stores_rls
  from pg_class
  where oid = to_regclass('public.stores');
  stores_rls := coalesce(stores_rls, false);

  -- 3. admin policy exists on stores
  select exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'stores'
      and policyname ilike '%admin%'
  ) into stores_admin_policy;

  -- 4. sellers missing store records
  select count(*) into sellers_missing
  from public.profiles p
  where p.role = 'seller'
    and not exists (
      select 1 from public.stores s where s.seller_id = p.id
    );

  -- 5. profiles.role check constraint includes 'admin'
  select exists (
    select 1 from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any(con.conkey)
    where rel.relname = 'profiles'
      and con.contype = 'c'
      and att.attname = 'role'
      and pg_get_constraintdef(con.oid) ilike '%admin%'
  ) into role_constraint_ok;

  result := jsonb_build_object(
    'is_admin_function', coalesce(is_admin_fn, false),
    'stores_rls', coalesce(stores_rls, false),
    'stores_admin_policy', coalesce(stores_admin_policy, false),
    'sellers_missing_stores', coalesce(sellers_missing, 0),
    'role_constraint_ok', coalesce(role_constraint_ok, false)
  );

  return result;
end;
$$;

-- Backfill: create missing store rows for seller profiles
create or replace function public.backfill_missing_stores()
returns integer
language plpgsql
security definer
as $$
declare
  inserted integer;
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin role required';
  end if;

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
  get diagnostics inserted = row_count;
  return inserted;
end;
$$;

grant execute on function public.get_permission_health() to authenticated;
grant execute on function public.backfill_missing_stores() to authenticated;
