-- Gorieta: fotos en reseñas
-- Las imágenes viven en Supabase Storage (bucket público "review-photos") bajo
-- `<user_id>/<archivo>`; la reseña guarda las rutas en `photos`.

alter table public.reviews
  add column photos text[] not null default '{}'
    check (cardinality(photos) <= 5);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-photos',
  'review-photos',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

-- Lectura pública: el bucket es público, las URLs se sirven sin sesión.

create policy "Usuarios suben fotos a su carpeta"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'review-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Usuarios borran fotos de su carpeta"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'review-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
