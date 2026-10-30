# Gorieta

Facilita la toma de decisiones al adquirir un vehículo automotor y proporciona información
detallada del vehículo con base en la experiencia de otros usuarios.

## Alcance

| Incluye | No incluye |
| --- | --- |
| Información general del vehículo (CarVector) | Compra/venta directa de autos |
| Precio de mercado (MarketCheck) | Diagramas |
| Reseñas y valoraciones de usuarios (Supabase) | Orientación técnica eléctrica |
| Autos similares al modelo seleccionado | |
| Top de vehículos según reseñas | |
| Fallas comunes *(pendiente; hoy solo conteos de quejas/boletines)* | |

## Estructura

```
src/
  app/
    _layout.tsx           Stack raíz + AuthProvider
    (tabs)/               Barra de navegación
      index.tsx           1. Inicio: Top de vehículos y reseñas recientes
      search.tsx          2. Búsqueda por marca/modelo/año
      contribute.tsx      3. Agregar contribución (reseña)
      saved.tsx           4. Guardados
      profile.tsx         5. Perfil, inicio de sesión y mis reseñas
    vehicle/[id].tsx      Ficha: specs, precio, fallas, similares, reseñas
  services/
    carvector.ts          API de CarVector (specs, imágenes)
    marketcheck.ts        API de MarketCheck (estadísticas de precio)
    reviews.ts, saved.ts  Consultas a Supabase
  lib/supabase.ts         Cliente de Supabase
supabase/migrations/      Esquema SQL (tablas, vista de ranking, RLS)
```

## Configuración

1. Instala dependencias: `npm install`
2. Crea un proyecto en [Supabase](https://supabase.com) y ejecuta
   `supabase/migrations/20261029000000_init.sql` en el SQL Editor (o `supabase db push` con la CLI).
3. Copia `.env.example` a `.env.local` y completa las llaves de Supabase, CarVector y MarketCheck.
4. Inicia la app: `npx expo start`

## Notas

- **Llaves de API:** las variables `EXPO_PUBLIC_*` se incrustan en el bundle. Antes de publicar,
  mueve las llamadas a CarVector y MarketCheck a una Supabase Edge Function.
- **Precio:** el endpoint de predicción de MarketCheck requiere VIN; como la app navega por
  año/marca/modelo, se usa la mediana y el rango de los anuncios activos
  (`/v2/search/car/active?stats=price`).
- **Top:** un vehículo necesita al menos 2 reseñas para aparecer (`TOP_MIN_REVIEWS` en
  `src/services/reviews.ts`).
