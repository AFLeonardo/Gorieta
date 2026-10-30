-- Gorieta: esquema inicial
-- Los vehículos viven en CarVector; aquí guardamos un "snapshot" (año/marca/modelo/imagen)
-- junto a cada reseña o guardado para poder listar sin volver a llamar a la API.

-- ───────────── Perfiles ─────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Perfiles visibles para todos"
  on public.profiles for select using (true);

create policy "Cada usuario edita su perfil"
  on public.profiles for update using ((select auth.uid()) = id);

-- Crea el perfil automáticamente al registrarse
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ───────────── Reseñas ─────────────
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  vehicle_id text not null,           -- id de CarVector
  year int not null,
  make text not null,
  model text not null,
  trim text,
  image_url text,
  rating smallint not null check (rating between 1 and 5),
  title text not null check (char_length(title) between 3 and 120),
  body text not null check (char_length(body) between 10 and 4000),
  pros text,
  cons text,
  mileage int check (mileage >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, vehicle_id)        -- una reseña por usuario y vehículo
);

create index reviews_vehicle_id_idx on public.reviews (vehicle_id);
create index reviews_created_at_idx on public.reviews (created_at desc);

alter table public.reviews enable row level security;

create policy "Reseñas visibles para todos"
  on public.reviews for select using (true);

create policy "Usuarios autenticados crean sus reseñas"
  on public.reviews for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Cada usuario edita sus reseñas"
  on public.reviews for update to authenticated
  using ((select auth.uid()) = user_id);

create policy "Cada usuario borra sus reseñas"
  on public.reviews for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ───────────── Vehículos guardados ─────────────
create table public.saved_vehicles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  vehicle_id text not null,
  year int not null,
  make text not null,
  model text not null,
  trim text,
  image_url text,
  created_at timestamptz not null default now(),
  primary key (user_id, vehicle_id)
);

alter table public.saved_vehicles enable row level security;

create policy "Cada usuario ve sus guardados"
  on public.saved_vehicles for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Cada usuario guarda vehículos"
  on public.saved_vehicles for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Cada usuario quita sus guardados"
  on public.saved_vehicles for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ───────────── Ranking (Top) ─────────────
-- security_invoker para que la vista respete las políticas RLS de reviews
create view public.vehicle_ratings
with (security_invoker = true) as
select
  vehicle_id,
  max(year) as year,
  max(make) as make,
  max(model) as model,
  max(trim) as trim,
  max(image_url) as image_url,
  round(avg(rating)::numeric, 2) as avg_rating,
  count(*) as review_count
from public.reviews
group by vehicle_id;
