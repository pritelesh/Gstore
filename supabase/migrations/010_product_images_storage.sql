-- ============================================
-- KGStore — product-images storage hardening
-- Ensures the PUBLIC bucket exists, locks it to
-- the Add Product contract ("PNG, JPG up to 10MB"),
-- and scopes every seller operation to their OWN
-- folder (product-images/{user_id}/...) so one seller
-- can never read-then-write another seller's images.
--
-- Idempotent & safe against re-runs. Only touches the
-- "product-images" bucket / its storage policies.
-- ============================================

-- 1. Ensure the bucket exists and is PUBLIC.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update
  set public = excluded.public;

-- 2. Enforce the documented upload contract.
--    UI says "PNG, JPG up to 10MB" so match it at the bucket level:
--      - max 10 MB per file
--      - only PNG / JPEG mime types
update storage.buckets
   set file_size_limit    = 10485760,           -- 10 MB in bytes
       allowed_mime_types = array['image/png','image/jpeg']
 where id = 'product-images';

-- 3. Storage RLS policies (replaced via drop-if-exists so this is re-runnable).

-- Anyone (unauthenticated too) may VIEW images — public product bucket.
drop policy if exists "Anyone can read product-images" on storage.objects;
create policy "Anyone can read product-images"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

-- Authenticated SELLERS may only UPLOAD into their OWN folder.
drop policy if exists "Sellers can upload product-images" on storage.objects;
create policy "Sellers can upload product-images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
    -- first folder segment must equal the uploader's user id
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'seller'
    )
  );

-- Authenticated SELLERS may UPDATE only files inside their OWN folder.
drop policy if exists "Sellers can update own product-images" on storage.objects;
create policy "Sellers can update own product-images"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'seller'
    )
  );

-- Authenticated SELLERS may DELETE only files inside their OWN folder.
drop policy if exists "Sellers can delete own product-images" on storage.objects;
create policy "Sellers can delete own product-images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'seller'
    )
  );

-- Remove the old bucket-wide "for all" policy if migration 002 left it behind,
-- now that upload/update/delete are each scoped to the owner's folder above.
drop policy if exists "Sellers can manage own product-images" on storage.objects;