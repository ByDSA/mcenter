---
name: server-tests-repository-globalmock
description: |
  Creación de archivos repository.globalmock.ts para tests de integración en NestJS.
  Úsalo cuando necesites crear mocks de repositorios que se inyectan automáticamente en los tests.
  Basado en el patrón existente en ./references/repository.globalmock.ts
---

# Global Repository Mocks (NestJS)

Crea archivos `repository.globalmock.ts` que definen el comportamiento base de los mocks inyectados automáticamente en los tests. Utiliza <skill-path>/references/repository.globalmock.ts como prototipo.

## Estructura

```
repository.globalmock.ts  → tests/ (junto al repository.ts)
```

## Utilidades

- **Mocking**: `$sharedTests/jest/mocking.ts` → `createMockClass()`
- **Registro**: `#utils/nestjs/tests` → `registerMockProviderInstance()`

## Generación

### Paso 1: Importaciones

```typescript
import { createMockClass } from "$sharedTests/jest/mocking";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { Types } from "mongoose";
import { RepositoryClass } from "../repository";
import { fixtureEntity } from "$sharedSrc/models/*/tests/fixtures";
```

### Paso 2: Sample Data

Define `SAMPLE_ENTITY` con datos válidos mínimos:

```typescript
const SAMPLE_ENTITY = fixtureEntity.Normal.Entity;
```

### Paso 3: Clase Mock

```typescript
class MockRepositoryClass extends createMockClass(RepositoryClass) {
  constructor() {
    super();

    // Happy path: simula comportamiento exitoso
    this.getOneById.mockResolvedValue(SAMPLE_ENTITY);
    this.getAll.mockResolvedValue([SAMPLE_ENTITY]);
    this.createOneAndGet.mockImplementation(async (data) => ({
      ...data,
      id: new Types.ObjectId().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    // ... otros métodos del repositorio
  }
}
```

### Paso 4: Registro (CRÍTICO)

```typescript
registerMockProviderInstance(RepositoryClass, new MockRepositoryClass());
```

## Ejemplo Completo

```typescript
import { createMockClass } from "$sharedTests/jest/mocking";
import { Types } from "mongoose";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { UsersRepository } from "../repository";

const SAMPLE_USER = fixtureUsers.Normal.User;

class UsersRepositoryMock extends createMockClass(UsersRepository) {
  constructor() {
    super();

    this.deleteOneByIdAndGet.mockResolvedValue(SAMPLE_USER);
    this.getOneById.mockResolvedValue(SAMPLE_USER);
    this.isPublicUsernameAvailable.mockResolvedValue(true);
    this.getOneByEmail.mockResolvedValue(SAMPLE_USER);
    this.patchOneByIdAndGet.mockResolvedValue({
      ...SAMPLE_USER,
      updatedAt: new Date(),
    });
    this.getOne.mockResolvedValue(SAMPLE_USER);
    this.getAll.mockResolvedValue([SAMPLE_USER]);
    this.createOneAndGet.mockImplementation((user) => Promise.resolve({
      ...user,
      id: new Types.ObjectId().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    this.deleteOneByPath.mockResolvedValue(SAMPLE_USER);
  }
}

registerMockProviderInstance(UsersRepository, new UsersRepositoryMock());
```

## Notas

- No usar `@Injectable()` en la clase mock
- El mock simula "Happy Path" por defecto
- Usar `new Types.ObjectId().toString()` para IDs simulados
- Importar fixtures desde `$sharedSrc/models/*/tests/fixtures`
