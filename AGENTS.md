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

**IMPORTANTE**: para todo lo relacionado con "server", delgarás en el subagente "server". Para el resto, como no existe subagente especializado, lo realizarás tú.

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

### `packages/vlc`
- App Node.js independiente (no NestJS, arquitectura más simple)
- Controla VLC via su HTTP interface local
- Se conecta al server via WebSockets para recibir comandos y enviar estado

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

### Archivos de front
- `page.tsx` — Página de ruta Next.js (Server Component por defecto)
- `ClientPage.tsx` — Parte cliente de una página
- `*.module.css` — Estilos CSS locales al componente
- `layout.tsx` — Layout de sección

### Commits
El proyecto usa **Conventional Commits** (commitlint configurado). Formato: `type(scope): message`. Tipos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`. El scope es opcional, pero de tenerlo puede ser back, front o shared. Los mensajes de commit son en inglés. No poner scope si afecta a múltiples packages o a fuera de ellos.

---

## Puntos de atención importantes

- **PATH_ROUTES es la fuente de verdad**: nunca hardcodees rutas de API en el front o el server. Usa siempre `PATH_ROUTES` de shared.

- **Zod en todas partes**: los DTOs HTTP (tanto request como response) se validan con Zod via `nestjs-zod`. Los schemas de transport están en `packages/shared/src/models/*/dto/transport.ts`.

- **VLC es un proceso separado**: el package `vlc` no es un módulo del server. Se despliega independientemente en el dispositivo con VLC instalado.

- Si tienes problemas de permisos, lee tu parchivo `.opencode/opencode.json` para no volver intentar comandos que no podrás ejecutar.

- Trata de evitar `as any` siempre que sea posible, especialmente en nuevo código que escribas tú.