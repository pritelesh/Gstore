-- ============================================
-- KGStore — Fix: allow 'admin' in profiles.role
-- CHECK constraint was missing 'admin' value
-- ============================================

do $$
declare
  con_name text;
  found boolean := false;
begin
  -- Find any existing CHECK constraint on profiles.role
  for con_name in (
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any(con.conkey)
    where rel.relname = 'profiles'
      and con.contype = 'c'
      and att.attname = 'role'
  ) loop
    execute format('alter table public.profiles drop constraint %I', con_name);
    found := true;
  end loop;

  -- Add updated constraint that includes 'admin'
  alter table public.profiles
    add constraint profiles_role_check
    check (role in ('customer', 'seller', 'admin'));
end $$;
