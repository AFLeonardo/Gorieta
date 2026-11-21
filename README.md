# Gorieta

Facilita la toma de decisiones al adquirir un vehículo automotor y proporciona información
detallada del vehículo con base en la experiencia de otros usuarios.

App móvil hecha con **Expo (SDK 58) + React Native**, para Android, iOS y web.

## Alcance

| Incluye                                                            | No incluye                    |
| ------------------------------------------------------------------ | ----------------------------- |
| Información general del vehículo (CarVector)                       | Compra/venta directa de autos |
| Precio de mercado y fotos reales (MarketCheck)                     | Diagramas                     |
| Reseñas y valoraciones de usuarios, con fotos (Supabase)           | Orientación técnica eléctrica |
| Autos similares al modelo seleccionado                             |                               |
| Top de vehículos según reseñas                                     |                               |
| Fallas comunes _(pendiente; hoy solo conteos de quejas/boletines)_ |                               |

## Funcionalidades

- **Inicio:** barra de acceso a búsqueda, carrusel del Top de vehículos (mínimo 2 reseñas para
  entrar) y reseñas recientes.
- **Búsqueda:** texto libre ("Toyota Corolla 2020", "crv", "chevy"), filtro por año y por tipo
  (SUV, sedán, pickup, hatchback, deportivo, van, eléctrico, híbrido).
- **Ficha del vehículo:** foto real, especificaciones en mosaicos, precio de mercado, fallas
  comunes, autos similares, reseñas y barra flotante con _Guardar_ / _Escribir reseña_.
- **Contribuir:** escribir una reseña (calificación, título, texto, pros, contras, kilometraje y
  hasta 5 fotos con la cámara o la galería).
- **Reseñas propias:** editar y eliminar (con confirmación; al borrar se eliminan sus fotos).
- **Guardados:** lista de vehículos guardados; se pueden quitar desde la misma lista.
- **Perfil:** inicio de sesión / registro, mis reseñas y preferencias:
  - **Sonidos** de la interfaz (respetan el modo silencio).
  - **Intensidad de movimiento:** Apagado · Sutil · Normal · Intenso.
  - **Densidad visual:** Compacta · Cómoda · Amplia.
- **Experiencia de uso:** hápticos y sonidos al tocar, skeletons mientras carga, animación de
  entrada en cada pestaña, tema claro/oscuro automático, splash animado.

## Tecnologías y servicios

| Servicio                                   | Uso                                                                                      |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| [Expo](https://expo.dev) / React Native    | Framework de la app                                                                      |
| [Supabase](https://supabase.com)           | Autenticación, base de datos (reseñas, guardados, perfiles) y Storage (fotos de reseñas) |
| [CarVector](https://carvector.io)          | Catálogo y especificaciones de vehículos                                                 |
| [MarketCheck](https://www.marketcheck.com) | Precio de mercado y fotos reales de anuncios activos                                     |
| [EAS](https://expo.dev/eas)                | Compilación del APK en la nube                                                           |

Las APIs de CarVector y MarketCheck se llaman con `fetch` (sin librería).

## Dependencias

### Base

| Paquete                                                  | Para qué                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------ |
| `expo`                                                   | Plataforma base (SDK 58)                                     |
| `react` 19.3 / `react-native` 0.88                       | Framework de la interfaz                                     |
| `react-dom` / `react-native-web`                         | Ejecutar la app en el navegador                              |
| `expo-router`                                            | Navegación basada en archivos (`src/app/`)                   |
| `react-native-screens`, `react-native-safe-area-context` | Pantallas nativas y márgenes seguros (notch, barra inferior) |
| `expo-linking`, `expo-constants`                         | Requeridas por `expo-router` (enlaces y configuración)       |
| `react-native-gesture-handler`                           | Gestos para la navegación                                    |

### Interfaz y animación

| Paquete                                                               | Para qué                                                      |
| --------------------------------------------------------------------- | ------------------------------------------------------------- |
| `react-native-reanimated` + `react-native-worklets`                   | Animaciones (entrada de pestañas, skeletons, aviso de sesión) |
| `expo-image`                                                          | Fotos con caché y transición                                  |
| `expo-linear-gradient`                                                | Degradados sobre las fotos (ficha y búsqueda)                 |
| `expo-glass-effect`                                                   | Efecto vidrio de la barra flotante (iOS 26+)                  |
| `expo-symbols`                                                        | Íconos del sistema (SF Symbols / Material Symbols)            |
| `@expo-google-fonts/inter`, `@expo-google-fonts/manrope`, `expo-font` | Tipografías: Inter (texto) y Manrope (títulos)                |
| `expo-splash-screen`                                                  | Splash nativo                                                 |
| `expo-system-ui`, `expo-status-bar`                                   | Fondo del sistema y barra de estado según el tema             |

### Funciones del dispositivo

| Paquete                  | Para qué                                                         |
| ------------------------ | ---------------------------------------------------------------- |
| `expo-haptics`           | Vibración al tocar                                               |
| `expo-audio`             | Sonidos de la interfaz                                           |
| `expo-camera`            | Tomar fotos para las reseñas                                     |
| `expo-image-picker`      | Elegir fotos de la galería                                       |
| `expo-image-manipulator` | Redimensionar y comprimir fotos antes de subirlas                |
| `expo-keep-awake`        | Evitar que la pantalla se apague mientras se escribe una reseña  |
| `expo-sqlite`            | `localStorage` persistente (sesión, caché de APIs, preferencias) |
| `expo-web-browser`       | Abrir enlaces externos                                           |

### Backend

| Paquete                     | Para qué                                                |
| --------------------------- | ------------------------------------------------------- |
| `@supabase/supabase-js`     | Cliente de Supabase                                     |
| `react-native-url-polyfill` | Polyfill de `URL` que necesita Supabase en React Native |

### Desarrollo

| Paquete                         | Para qué           |
| ------------------------------- | ------------------ |
| `typescript`                    | Tipado estático    |
| `eslint` + `eslint-config-expo` | Revisión de código |
| `@types/react`                  | Tipos de React     |

## Estructura

```
src/
  app/                        Rutas (Expo Router): cada archivo es una pantalla
    _layout.tsx               Stack raíz, fuentes, tema y AuthProvider
    (tabs)/                   Barra de navegación
      _layout.tsx             Pestañas + splash animado (solo al abrir la app)
      index.tsx               1. Inicio: búsqueda, Top (carrusel) y reseñas recientes
      search.tsx              2. Búsqueda por texto, año y tipo
      contribute.tsx          3. Escribir una reseña
      saved.tsx               4. Guardados
      profile.tsx             5. Perfil, sesión, mis reseñas y preferencias
    vehicle/[id].tsx          Ficha del vehículo
    review/[id].tsx           Editar una reseña propia
  components/                 Componentes reutilizables (tarjetas, formularios, Screen, Section…)
    ui/                       Botón, campo de texto, skeletons, selector segmentado, estados vacíos…
  constants/
    theme.ts                  Paleta, radios, elevación, fuentes y espaciado
    vehicle-types.ts          Categorías del filtro "tipo de auto"
  data/
    vehicles.ts               Dataset local de 50 vehículos (respaldo sin API)
  hooks/                      Sesión, tema, carga de datos, guardados…
  lib/
    supabase.ts               Cliente de Supabase
    haptics.ts, sounds.ts     Retroalimentación háptica y sonora
    preferences.ts            Intensidad de movimiento y densidad visual
    confirm.ts                Diálogo de confirmación (nativo y web)
  services/
    carvector.ts              API de CarVector, con caché y respaldo al dataset local
    marketcheck.ts            API de MarketCheck (precio + foto en una sola petición)
    local-vehicles.ts         Búsquedas sobre el dataset local
    vehicle-images.ts         Caché de fotos y precios por año/marca/modelo
    reviews.ts, saved.ts      Reseñas y guardados (Supabase)
    review-photos.ts          Subida y optimización de fotos de reseñas
  types/vehicle.ts            Tipos de datos
assets/
  images/                     Íconos, logo y splash
  sounds/                     Sonidos de la interfaz (generados, sin licencia de terceros)
supabase/migrations/          Esquema SQL: tablas, vista de ranking, políticas RLS y bucket de fotos
```

## Base de datos (Supabase)

- **`profiles`:** usuario y nombre de usuario (se crea solo al registrarse).
- **`reviews`:** reseñas, con un _snapshot_ del vehículo (año, marca, modelo, imagen) y rutas
  de fotos. Una reseña por usuario y vehículo.
- **`saved_vehicles`:** vehículos guardados por usuario.
- **`vehicle_ratings`** (vista): promedio y número de reseñas por vehículo, para el Top.
- **Storage `review-photos`:** fotos de reseñas en `<user_id>/…` (máx. 5 por reseña, 5 MB c/u).
- **RLS:** cada usuario solo puede crear, editar y borrar sus propias reseñas, guardados y fotos.

## Configuración

1. Instala dependencias: `npm install`
2. Crea un proyecto en [Supabase](https://supabase.com) y ejecuta, en orden, los archivos de
   `supabase/migrations/` en el SQL Editor (o `supabase db push` con la CLI).
3. Copia `.env.example` a `.env` y completa las llaves:

   | Variable                                  | Origen                               |
   | ----------------------------------------- | ------------------------------------ |
   | `EXPO_PUBLIC_SUPABASE_URL`                | Supabase → Project Settings → API    |
   | `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`    | Supabase → Project Settings → API    |
   | `EXPO_PUBLIC_CARVECTOR_API_KEY`           | carvector.io                         |
   | `EXPO_PUBLIC_MARKETCHECK_API_KEY`         | marketcheck.com                      |
   | `EXPO_PUBLIC_VEHICLE_SOURCE` _(opcional)_ | `local` = usar solo el dataset local |

4. Inicia la app: `npx expo start` (después de cambiar `.env`, usa `npx expo start -c`).

### Comandos útiles

```bash
npx expo start          # servidor de desarrollo
npx expo lint           # revisión de código
npx tsc --noEmit        # verificación de tipos
npx expo-doctor         # diagnóstico de dependencias
npx expo install <pkg>  # instalar paquetes compatibles con el SDK
```

## Generar el APK (Android)

El perfil `preview` de `eas.json` genera un APK instalable directo.

```bash
npx eas-cli@latest login
npx eas-cli@latest env:push preview --path .env   # el .env no se sube al compilar (está en .gitignore)
npx eas-cli@latest build --platform android --profile preview
```

Al terminar, EAS da un enlace y un QR para descargar el `.apk` en el teléfono. Android pedirá
permiso para instalar apps de origen desconocido.

> En `env:push`, elige visibilidad **plaintext** o **sensitive** (no _secret_): las variables
> `EXPO_PUBLIC_` se incrustan en la app y una variable _secret_ no se puede leer al empaquetar.

## Límites de las APIs y respaldo

Los planes gratuitos permiten **500 llamadas al mes** en CarVector y en MarketCheck. Para no
agotarlas:

- **Caché local:** cada respuesta de CarVector se guarda 30 días, y los vehículos que llegan en
  una búsqueda se reutilizan al abrir su ficha. Los datos de MarketCheck se guardan 24 h.
- **Una petición por ficha:** el precio y la foto salen de la misma consulta a MarketCheck; las
  listas nunca llaman a la API, solo leen la caché.
- **Dataset local:** si CarVector no responde (sin cuota, sin red o sin llave), la app usa
  `src/data/vehicles.ts`: 50 vehículos populares de 19 marcas, con foto y precio reales
  tomados de MarketCheck. Las especificaciones son valores de referencia de fábrica
  (aproximados).

## Notas

- **Llaves de API:** las variables `EXPO_PUBLIC_*` se incrustan en el bundle. Antes de publicar
  en tiendas, mueve las llamadas a CarVector y MarketCheck a una Supabase Edge Function.
- **Precio:** el endpoint de predicción de MarketCheck requiere VIN; como la app navega por
  año/marca/modelo, se usa la mediana y el rango de los anuncios activos
  (`/v2/search/car/active?stats=price`), en USD.
- **Fotos:** se muestran directamente desde los servidores de los concesionarios; revisa los
  términos de MarketCheck antes de publicar.
- **Top:** un vehículo necesita al menos 2 reseñas para aparecer (`TOP_MIN_REVIEWS` en
  `src/services/reviews.ts`).
