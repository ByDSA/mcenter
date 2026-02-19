/**
 * PROTOTYPE: routes.test.ts
 *
 * Este archivo muestra todos los patrones posibles para crear un `routes.test.ts`
 * en el proyecto. Sirve de referencia para un AI-Agent que genere estos archivos.
 *
 * PROPÓSITO DE routes.test.ts:
 * - Verificar que cada ruta HTTP declarada en un controlador NestJS existe realmente
 *   en el módulo de la aplicación.
 * - Garantizar cobertura total de rutas: si se añade una ruta al controlador y no
 *   se registra aquí, el test de coverage fallará.
 *
 * REGLAS GENERALES:
 * - Siempre terminar con `verifyRoutesCoverage(...)`.
 * - Cada ruta del controlador debe aparecer en al menos un `testRoute(...)` o
 *   `testCrudRoutes(...)`.
 * - Si una ruta no debe testearse (p.ej. ruta interna/debug), usar `excludePaths`.
 * - El archivo se ubica junto al controlador, o en una subcarpeta `tests/`.
 */
import { PATH_ROUTES } from "$shared/routing";
import { testCrudRoutes, testRoute, verifyRoutesCoverage } from "#core/routing/test";
// Importar el controlador que se está testeando
import { ExampleController } from "./controller";

// ----------------------------------------------------------------------
// CASO 1: Controlador CRUD Estándar
// Usar cuando el controlador implementa métodos estándar de repositorio
// (get, create, patch, delete, get-many-criteria, etc.)
// ----------------------------------------------------------------------
testCrudRoutes(PATH_ROUTES.myModule.path, [
  "get",                // GET /:id
  "create",             // POST /
  "patch",              // PATCH /:id
  "delete",             // DELETE /:id
  "get-all",            // GET /
  "get-many-criteria",  // POST /search (o ruta configurada para criterios)
  "get-one-criteria",   // POST /search/one
  "create-many",        // POST /create-many
  "delete-many",        // DELETE /
]);

// ----------------------------------------------------------------------
// CASO 2: Rutas Individuales Simples
// Usar para endpoints personalizados que no encajan en el CRUD estándar.
// ----------------------------------------------------------------------

// GET básico
testRoute(PATH_ROUTES.myModule.customAction.path);

// POST, PATCH, DELETE, PUT explícitos
testRoute(PATH_ROUTES.myModule.otherAction.path, {
  method: "POST",
});

// Coincidencia exacta (útil para ignorar url params como /:id)
testRoute(PATH_ROUTES.myModule.root.path, {
  method: "GET", // Opcional. "GET" por defecto.
  exactMatch: true,
});

// ----------------------------------------------------------------------
// CASO 3: Rutas con Parámetros Dinámicos
// Usar .withParams() si está disponible en el objeto PATH_ROUTES,
// o construir la cadena manualmente si es necesario para matchear la definición del controller.
// ----------------------------------------------------------------------

// Ejemplo: GET /users/:userId/playlist/:playlistId
testRoute(
  PATH_ROUTES.myModule.subResource.withParams("userId", "playlistId")
);

// Ejemplo con parámetros nombrados (si la definición de ruta lo soporta)
testRoute(
  PATH_ROUTES.myModule.detail.withParams({
    id: "someId",
    slug: "someSlug"
  })
);

// ----------------------------------------------------------------------
// CASO 4: Verificación de Cobertura (MANDATORIO)
// Esto asegura que todos los métodos del controlador con decoradores de ruta
// (@Get, @Post, etc.) hayan sido testeados arriba. Si falta uno, el test fallará.
// ----------------------------------------------------------------------
verifyRoutesCoverage({
  controller: ExampleController,
  // La ruta base que tiene el controlador en su decorador @Controller('ruta-base')
  // Generalmente coincide con PATH_ROUTES.modulo.path
  controllerRoute: PATH_ROUTES.myModule.path,
  excludePaths: [
    "/musics/debug",
    "/musics/:id/internal-only",
  ], // Opcional, sólo si hay paths a excluir
});

// =============================================================================
// NOTAS PARA EL AI-AGENT
// =============================================================================
//
// ① CUÁNDO CREAR routes.test.ts:
//    - Siempre que exista un controlador NestJS nuevo o se modifiquen sus rutas.
//    - Si el controlador no tiene routes.test.ts, el CI fallará en coverage.
//
// ② CÓMO DETERMINAR QUÉ PATRONES USAR:
//    - Leer el controlador y extraer sus decoradores @Get/@Post/@Patch/@Delete.
//    - Si todos son CRUD estándar → usar testCrudRoutes.
//    - Si hay rutas extra → combinar con testRoute.
//    - Si las rutas tienen params → usar withParams(string | object).
//    - Usar exactMatch cuando el path base (sin parámetros) podría coincidir
//      accidentalmente con una ruta dinámica (e.g., GET / vs GET /:id).
//
// ③ UBICACIÓN DEL ARCHIVO:
//    - Preferiblemente junto al controlador: `./routes.test.ts`
//    - Si el módulo organiza tests en subcarpeta: `./tests/routes.test.ts`
//
// ④ IMPORT PATH DEL CONTROLADOR:
//    - Relativo al archivo routes.test.ts, apuntando al controlador:
//      `import { XxxController } from "./controller"` (o "../controller")
//
// ⑤ IMPORT DE UTILIDADES:
//    - `#core/routing/test` ← módulos bajo src/core/
//    - `#core/routing/test/routing` ← módulos bajo src/modules/
//    (Ambos exponen las mismas funciones; revisar cuál resuelve en el contexto)
//
// ⑥ NO USAR routes.test.ts PARA:
//    - Testear la lógica de negocio (usar *.spec.ts o *.unit.test.ts).
//    - Testear autenticación o permisos (usar controller.int.test.ts o e2e).
//    - Testear el body/response de los endpoints (usar e2e o integration tests).
//    - Rutas de providers internos de NestJS que no están expuestos al exterior.
