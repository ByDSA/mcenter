# Project
mcenter (Multimedia Center) es una aplicación de gestión y reproducción de medios (músicas, episodios, series) con un player remoto que controla VLC.

## Estructura del proyecto
Tiene tres packages principales:
- packages/shared
- packages/front
- packages/server

Cosas comunes a todos los packages: pnpm, jest, eslint.

## Estructura general del monorepo

El código está en `packages/` y tiene cuatro packages principales:

```
packages/
├── shared/     # Tipos, modelos Zod, rutas API, utilidades compartidas
├── front/      # Aplicación Next.js (frontend)
├── server/     # API NestJS (backend)
└── vlc/        # Agente independiente que controla VLC localmente
```

Cosas comunes: TypeScript 5.8, ESLint 9, Jest.

## Packages: información general

### `packages/shared`
- Zod para definición de modelos y DTOs
- Playwright (tests e2e compartidos)

**Todas las rutas de la API están definidas en `packages/shared/src/routing/routes.ts`**, en el objeto exportado `PATH_ROUTES`. Tanto el server como el front consumen esta misma fuente de verdad.

Rutas principales de la API:
```
/api/musics             → CRUD de músicas
/api/musics/file-info   → Metadatos de archivo de música
/api/musics/history     → Historial de reproducción de músicas
/api/musics/playlists   → Playlists de músicas
/api/musics/smart-playlists → Smart playlists
/api/musics/random      → Selector/picker aleatorio
/api/musics/slug        → Acceso por slug
/api/musics/admin       → Operaciones admin (fix-info, duplicados, update-remote)
/api/episodes           → CRUD de episodios
/api/episodes/series    → CRUD de series
/api/episodes/history   → Historial de episodios
/api/episodes/file-info → Metadatos de archivo de episodio
/api/episodes/dependencies → Dependencias entre episodios
/api/episodes/admin     → Tareas admin de episodios
/api/streams            → Streams (reproducciones activas)
/api/player             → Control del player remoto
/api/tasks              → Sistema de tareas async (BullMQ)
/api/auth               → Autenticación (local, google)
/api/users              → Gestión de usuarios
/api/image-covers       → Portadas de imágenes
/api/youtube/import     → Importación desde YouTube
/config                 → Configuración de la app
/api/logs               → Logs (streaming)
```

Cuando añadas rutas nuevas, añádelas siempre primero en `PATH_ROUTES` en shared.

### `packages/front`
Stack:
- **Next.js 16** (output `standalone`), **React 19**
- **MUI v5** (componentes UI)
- **Zustand** (estado global)
- **TanStack Query v5** (fetching/caché de datos)
- **React Hook Form + Zod** (formularios)
- **Socket.io client** (WebSockets con el server)
- **DnD Kit** (drag & drop en playlists)
- CSS Modules para estilos locales
- SVGR para SVGs como componentes React
- Node >= 24

Alias path:
```
$shared    → ../shared/build   (producción)
$sharedSrc → ../shared/src     (dev, tipos)
```

### `packages/server`
Stack:
- **NestJS 11** sobre Express 5
- **MongoDB** via Mongoose 7 (ODM principal)
- **BullMQ** (colas de tareas asíncronas) con Redis
- **Meilisearch** (búsqueda full-text, especialmente para músicas)
- **Socket.io** (comunicación realtime con front y con el agente VLC)
- **Passport** (autenticación: JWT cookie, local email/password, Google OAuth, token)
- **nestjs-zod** (validación de DTOs en requests y serialización de responses con Zod)
- **Winston** (logging)
- **fluent-ffmpeg**, **node-id3** (metadata de audio)
- **React/React-DOM** (renderizado de emails con TSX en el server)
- **Chevrotain** (parser de queries de búsqueda de músicas — custom DSL)

Path Alias:
```
#core      → src/core
#core/*    → src/core/*
#modules/* → src/modules/*
#musics/*  → src/modules/musics/*
#episodes/* → src/modules/episodes/*
#series/*  → src/modules/episodes/series/*
#utils     → src/utils
#utils/*   → src/utils/*
$shared/*  → ../shared/src/*   (solo en dev/tests, en producción usa el build)
```


### `packages/vlc`
- App Node.js independiente (no NestJS, arquitectura más simple)
- Controla VLC via su HTTP interface local
- Se conecta al server via WebSockets para recibir comandos y enviar estado


## Arquitectura del servidor

### Patrón de capas (por módulo)

Cada módulo del servidor sigue esta estructura de capas consistente:

```
modules/musics/crud/
├── controller.ts         # Endpoints HTTP (@Get, @Post, etc.)
├── module.ts             # NestJS Module
└── repositories/
    └── music/
        ├── repository.ts       # Implementación del repositorio (lógica de negocio)
        ├── events.ts           # Eventos de dominio que emite
        ├── index.ts            # Re-exports del repositorio
        └── odm/
            ├── odm.ts          # Mongoose Model + Schema
            ├── adapters.ts     # Conversión DB ↔ dominio
            ├── criteria-pipeline.ts  # Pipelines de agregación MongoDB
            └── index.ts
```

**No hay una capa `Service` intermediaria en todos los casos** — algunos controladores llaman directamente a los repositorios. En los módulos más complejos (admin, picker, file-info/upload) sí existe un `service.ts`.

### Domain Event Emitter

Los módulos se comunican entre sí mediante eventos de dominio (no llamadas directas entre servicios). Cada repositorio tiene un `events.ts` que declara los eventos que emite. Se configura en `core/domain-event-emitter/`.

### Sistema de tareas (BullMQ)

Las operaciones costosas (sync disk→DB, update file-info, importar de YouTube, etc.) son tareas asíncronas:
- Se registran handlers con el decorador `@TaskHandler()`
- El controlador `core/tasks/controller.ts` expone endpoints para lanzar tareas y consultar su estado
- El estado se puede recibir como SSE stream (`/api/tasks/:id/status/stream`)

### App Module

El `AppModule` (en `core/app/app.module.ts`) carga dinámicamente el `DevModule` solo en desarrollo. Los módulos de features se cargan via `routeModules` definidos en `core/routing/routes.ts`.

### Autenticación

- **Global**: `OptionalJwtGuard` aplicado a todos los endpoints. Lee el JWT de la cookie.
- **Rutas protegidas**: usar `@UseGuards(AuthenticatedGuard)`.
- **Rutas solo admin**: usar `@UseGuards(RolesGuard)` con `@Roles(Role.Admin)`.
- **Rutas públicas** (accesibles sin JWT): usar `@Public()` + `@PublicCors()` para los endpoints de slug/stream.

---

## Estructura del Frontend

### App routes (`packages/front/app/`)
```
app/
├── layout.tsx                  # Layout raíz (providers, navegación)
├── @customMain/                # Slot de layout paralelo (música)
│   └── musics/                 # Vista de músicas en modo paralelo
├── musics/                     # Sección principal de músicas
│   ├── [musicId]/              # Detalle de música
│   ├── history/                # Historial de reproducción
│   ├── playlists/[playlistId]/ # Detalle de playlist
│   ├── playlists/slug/...      # Acceso por slug a playlist
│   ├── play/random/            # Reproducción aleatoria
│   └── search/                 # Búsqueda
├── auth/                       # Login, registro, verificación, logout
├── admin/                      # Panel de administración
│   └── task-manager/           # Gestión de tareas BullMQ
├── player/                     # Control del player
├── series/                     # Series de episodios
├── user/                       # Perfil de usuario
└── manifest/                   # PWA install & manifest
```

### Módulos del front (`packages/front/modules/`)
```
modules/
├── core/         # Configuración global, providers
├── musics/       # Lógica de dominio de músicas (hooks, stores, fetching)
├── episodes/     # Lógica de episodios
├── player/       # Estado y control del player (Zustand)
├── remote-player/ # Player remoto (WebSockets con server)
├── tasks/        # Cliente del sistema de tareas
├── image-covers/ # Gestión de portadas
├── history/      # Historial compartido
├── resources/    # Recursos genéricos
├── fetching/     # Utilidades de fetching (wrappers de TanStack Query)
├── ui-kit/       # Componentes UI reutilizables
└── utils/        # Utilidades generales del front
```

**La lógica de negocio va en `modules/`, las páginas en `app/`.**

---

## Shared package — modelos y utilidades

### Modelos (`packages/shared/src/models/`)
Cada entidad tiene su propia carpeta con:
- `*.ts` — tipo de dominio TypeScript
- `dto/transport.ts` — Zod schema para serialización HTTP (lo que va por la red)
- `dto/domain.ts` (deprecated) — Zod schema del dominio interno
- `tests/fixtures.ts` — fixtures para tests. Un único archivo por módulo

Entidades principales: `musics`, `episodes` (con `file-info`, `history`, `dependencies`), `player`, `resources`, `tasks`, `auth`.

### Utilidades (`packages/shared/src/utils/`)
- `validation/` — helpers de Zod, `assertIsDefined`, `never`, etc.
- `errors/` — clases de error tipadas, conversiones, `safeError`
- `objects/` — deep merge, deep copy, remove undefined, etc.
- `time/` — `date-diff`, `date-type` (manejo de fechas)
- `trees/` — estructuras de árbol
- `http/responses/` — formato estándar de respuesta HTTP (`DataResponse`)
- `fs/` — operaciones de filesystem con errores tipados
- `criteria/` — helpers para criterios de búsqueda/paginación

---

## Convenciones de naming y estructura

### Archivos de servidor
- `*.module.ts` — NestJS Module
- `*.controller.ts` — NestJS Controller (HTTP)
- `*.service.ts` — NestJS Service (lógica de negocio)
- `*.repository.ts` / `repository.ts` — Repositorio
- `odm.ts` — Mongoose Schema + Model
- `adapters.ts` — Conversión entre capa ODM y dominio
- `events.ts` — Declaración de eventos de dominio del módulo
- `*.guard.ts` — NestJS Guards (autenticación/autorización)
- `*.decorator.ts` — Decoradores personalizados
- `*.interceptor.ts` — Interceptores NestJS
- `*.test.ts` — Tests (Jest)
- `*.unit.test.ts` — Tests unitario donde se prueba un controller/service/repository y se mockea todo lo demás
- `*.db.test.ts` — Tests de integración con base de datos
- `*.int.test.ts` — Tests de integración
- `*.e2e.spec.ts` — Tests E2E

### Archivos de front
- `page.tsx` — Página de ruta Next.js (Server Component por defecto)
- `ClientPage.tsx` — Parte cliente de una página
- `*.module.css` — Estilos CSS locales al componente
- `layout.tsx` — Layout de sección

### Commits
El proyecto usa **Conventional Commits** (commitlint configurado). Formato: `type(scope): message`. Tipos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`. El scope es opcional, pero de tenerlo puede ser back o front.

---

## Puntos de atención importantes

- **PATH_ROUTES es la fuente de verdad**: nunca hardcodees rutas de API en el front o el server. Usa siempre `PATH_ROUTES` de shared.

- **Zod en todas partes**: los DTOs HTTP (tanto request como response) se validan con Zod via `nestjs-zod`. Los schemas de transport están en `packages/shared/src/models/*/dto/transport.ts`.

- **El server ya tiene un guard JWT global** (`OptionalJwtGuard`): no añadas guards JWT a nivel de módulo salvo que quieras comportamiento específico. Para proteger un endpoint, usa `@UseGuards(AuthenticatedGuard)`.

- **Parser de queries de músicas**: la búsqueda de músicas usa un DSL propio parseado con Chevrotain (`modules/musics/crud/repositories/music/queries/`). Es distinto de Meilisearch — Meilisearch se usa para la búsqueda full-text general, el DSL para filtros estructurados.

- **VLC es un proceso separado**: el package `vlc` no es un módulo del server. Se despliega independientemente en el dispositivo con VLC instalado.

- **Emails con React/TSX**: los templates de email (`VerificationEmail.tsx`, `WelcomeEmail.tsx`) son componentes React renderizados a HTML en el server. Están en `core/auth/strategies/local/`.