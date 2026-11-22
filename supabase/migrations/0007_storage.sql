-- 0007 — Storage bucket for photos and the featured video.
-- Public bucket: anyone can VIEW a file by its URL (needed for the website).
-- Only admins can upload, replace or delete. Max 15 MB per file (the video limit);
-- photos are compressed in the browser before upload (usually 150–500 KB).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'public-media',
  'public-media',
  true,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public-media: admins read" on storage.objects;
create policy "public-media: admins read" on storage.objects
  for select to authenticated
  using (bucket_id = 'public-media' and (select public.is_admin()));

drop policy if exists "public-media: admins upload" on storage.objects;
create policy "public-media: admins upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'public-media' and (select public.is_admin()));

drop policy if exists "public-media: admins update" on storage.objects;
create policy "public-media: admins update" on storage.objects
  for update to authenticated
  using (bucket_id = 'public-media' and (select public.is_admin()))
  with check (bucket_id = 'public-media' and (select public.is_admin()));

drop policy if exists "public-media: admins delete" on storage.objects;
create policy "public-media: admins delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'public-media' and (select public.is_admin()));
