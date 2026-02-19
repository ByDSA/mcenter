/**
 * PROTOTIPO PARA `controller.crud.unit.test.ts`
 * * PROPÓSITO:
 * Testear controladores que usan los decoradores y patrones CRUD estándar del proyecto
 * (GetOneById, UserPatchOne, AdminDeleteOne, etc.) usando la utilidad `crudTestsSuite`.
 */

import { crudTestsSuite } from "#tests/suites/crud-suite";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { mockMongoId } from "#tests/mongo";

// Importar controlador y repositorio
import { MyController } from "./controller";
import { MyRepository } from "./repository";
// Importar sample data si es necesario (o usar la del globalmock)
import { SAMPLE_ENTITY } from "./repository/tests/repository.globalmock";

crudTestsSuite({
  name: MyController.name,

  // 1. Configuración del Módulo de Testing
  appModule: [
    {
      imports: [], // Módulos adicionales si hacen falta
      controllers: [MyController],
      providers: [
        // Usar getOrCreateMockProvider cargará el Mock definido en repository.globalmock.ts
        getOrCreateMockProvider(MyRepository),
      ],
    },
    {
      auth: {
        repositories: "mock", // Mockear repositorios de auth internamente
        cookies: "mock",      // Mockear sistema de cookies/jwt
      },
    },
  ],

  // 2. Clase del Repositorio Principal
  repositoryClass: MyRepository,

  // 3. Configuración de Tests por Operación
  testsConfig: {

    // Test: GET One By ID
    getOne: {
      repoConfig: (ctx) => ({
        // Función del repositorio que se espera que llame el controller
        getFn: () => ctx.beforeExecution().repo.getOneById,
        // Valor que devolverá el mock (opcional, si difiere del globalmock)
        returned: SAMPLE_ENTITY,
        // Parámetros esperados en la llamada al repo
        expected: {
          params: [mockMongoId],
        }
      }),
      // URL a llamar (relative to controller base)
      url: "/" + mockMongoId,
    },

    // Test: PATCH One
    patchOne: {
      auth: {
        // Definir matriz de permisos esperada
        roles: {
          admin: true,  // Admin puede
          user: false,  // User normal no puede (ejemplo)
          guest: false, // Guest no puede
        },
      },
      repoConfig: (ctx) => ({
        getFn: () => ctx.beforeExecution().repo.patchOneByIdAndGet,
        expected: {
          params: [
            mockMongoId,
            {
              // El body que envía el test suite automáticamente o custom
              entity: { name: "new title" },
            },
          ],
        },
        // Si el controlador transforma la respuesta, aquí definimos qué devuelve el repo
        returned: { ...SAMPLE_ENTITY, name: "new title" },
      }),
      url: "/" + mockMongoId,
      // Datos para enviar en el body (si se requiere algo específico)
      data: {
        validInput: { entity: { name: "new title" } },
      }
    },

    // Test: DELETE One
    deleteOne: {
      auth: {
        roles: { admin: true, user: false, guest: false },
      },
      repoConfig: (ctx) => ({
        getFn: () => ctx.beforeExecution().repo.deleteOneByIdAndGet,
        expected: { params: [mockMongoId] },
      }),
    },

    // Test: Create One
    // Nota: 'createOne' no está explícito en la interfaz TestsConfig del ejemplo,
    // pero si el helper lo soporta se añade aquí. Si no, se pueden añadir custom tests.

    // Test: Get Many Criteria (Búsqueda)
    getManyCriteria: {
      repoConfig: (ctx) => ({
        getFn: () => ctx.beforeExecution().repo.getManyByCriteria,
      }),
      // auth por defecto suele ser public o user, ajustar según controlador
    }
  },
});