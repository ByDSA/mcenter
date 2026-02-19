---
name: server-tests-crudsuite
description: |
  Creación de tests unitarios declarativos para controladores CRUD en NestJS.
  Úsalo para controladores estándar con operaciones getOne, patchOne, deleteOne, getManyCriteria, getAll.
  No usar para controladores con lógica de negocio compleja (usar controller.unit.test.ts manual).
  Suite basada en packages/server/tests/suites/crud-suite.ts
---

# Tests CRUD Suite (NestJS)

Utiliza `crudTestsSuite` para generar tests declarativos que mapean operaciones HTTP a métodos de repositorio. Utiliza <skill-path>/references/controller-crud.test.ts como prototipo.

## Cuándo Usar

**Sí usar**:
- Controladores con `@GetOneById`, `@UserPatchOne`, `@AdminDeleteOne`, `@GetManyCriteria`, `@GetAll`
- Operaciones CRUD estándar

**No usar**:
- Lógica de negocio compleja o custom en el controlador. Usar `controller.unit.test.ts` manual en esos casos

## Utilidades

- **Suite**: `packages/server/tests/suites/crud-suite.ts`
- **Helper de mocks**: `#utils/nestjs/tests` → `getOrCreateMockProvider()`
- **Auth**: `auth: { repositories: "mock", cookies: "mock" }`

## Configuración

### appModule

```typescript
appModule: [
  {
    controllers: [ControllerClass],
    providers: [getOrCreateMockProvider(RepositoryClass)],
  },
  { auth: { repositories: "mock", cookies: "mock" } }
]
```

### testsConfig

Mapea cada operación del controlador:

```typescript
testsConfig: {
  getOne: {
    repoConfig: (ctx) => ({
      getFn: () => ctx.beforeExecution().repo.getOneById,
      expected: { params: { id: mockMongoId } }
    }),
  },
  patchOne: { /* ... */ },
  getManyCriteria: { /* ... */ },
  deleteOne: { /* ... */ },
  getAll: { /* ... */ },
}
```

### Estructura de repoConfig

```typescript
repoConfig: (ctx) => ({
  getFn: () => ctx.beforeExecution().repo.methodName,
  expected: {
    params: { /* parámetros que debe recibir el método */ },
    body: { /* cuerpo de la petición */ },
    query: { /* query params */ },
  },
  auth: { /* roles con acceso: admin, user, guest */ },
  url: "/path/:id",
})
```

## Ejemplo Completo

```typescript
import { crudTestsSuite } from "#tests/suites/crud-suite";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { MusicsController } from "./controller";
import { MusicsRepository } from "./repository";
import { SAMPLE_MUSIC } from "./tests/repository.globalmock";

const mockMongoId = "507f1f77bcf86cd799439011";

crudTestsSuite({
  name: MusicsController.name,
  appModule: [
    {
      controllers: [MusicsController],
      providers: [getOrCreateMockProvider(MusicsRepository)],
    },
    { auth: { repositories: "mock", cookies: "mock" } }
  ],
  repositoryClass: MusicsRepository,
  testsConfig: {
    getOne: {
      repoConfig: (ctx) => ({
        getFn: () => ctx.beforeExecution().repo.getOneById,
        expected: {
          params: { id: mockMongoId },
        },
        auth: { roles: ["admin", "user", "guest"] },
        url: `/${mockMongoId}`,
        returned: SAMPLE_MUSIC,
      }),
    },
    patchOne: {
      repoConfig: (ctx) => ({
        getFn: () => ctx.beforeExecution().repo.patchOneByIdAndGet,
        expected: {
          params: { id: mockMongoId },
          body: { title: "New Title" },
        },
        auth: { roles: ["admin", "user"] },
        url: `/${mockMongoId}`,
        returned: { ...SAMPLE_MUSIC, title: "New Title" },
      }),
    },
    getManyCriteria: {
      repoConfig: (ctx) => ({
        getFn: () => ctx.beforeExecution().repo.getManyByCriteria,
        expected: {
          query: { page: 1, limit: 10 },
        },
        auth: { roles: ["admin", "user"] },
        url: "/",
        returned: [SAMPLE_MUSIC],
      }),
    },
  },
});
```

## Sample Data

Importa `SAMPLE_ENTITY` desde el `repository.globalmock.ts` del módulo:

```typescript
import { SAMPLE_MUSIC } from "./tests/repository.globalmock";
```

## Validación

El suite verifica automáticamente:
- El controlador llama al repositorio con los parámetros correctos
- La autenticación y autorización funcionan
- Los parámetros de request coinciden con la firma del método del repositorio
