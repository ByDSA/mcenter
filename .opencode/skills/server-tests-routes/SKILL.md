---
name: server-tests-routes
description: |
  Creación de tests de rutas para NestJS. Usa cuando necesitas verificar el enrutamiento
  (existencia de endpoints y métodos HTTP correctos) y asegurar la cobertura total de
  las rutas definidas en un controlador. Aplica a archivos routes.test.ts en packages/server.
---

# Creación de Tests de Rutas (NestJS)

Esta skill define el procedimiento estándar para generar archivos `routes.test.ts` para cualquier controlador NestJS del proyecto. Estos tests comprueban que cada ruta HTTP declarada en el controlador existe realmente en la aplicación, y que su cobertura está completa.

IMPORTANTE: seguir el prototipo de código y sus indicaciones: `<skill-path>/references/routes.test.ts`.

## Referencias

- Helpers de testing: `src/core/routing/test/routing.ts`

## Workflow

Al solicitarse la creación o actualización de un archivo `routes.test.ts`, el agente debe seguir estos pasos:

### 1. Identificar el Controlador

Analiza el archivo `controller.ts` adyacente para identificar:
- La clase del controlador.
- La ruta base definida en el decorador `@Controller('ruta')`.
- Los métodos HTTP (`@Get`, `@Post`, `@Patch`, `@Delete`, etc.) y sus sub-rutas.

### 2. Identificar PATH_ROUTES

Busca en `$shared/routing` (o imports existentes) la constante `PATH_ROUTES` correspondiente al módulo. Los tests siempre deben usar `PATH_ROUTES` en lugar de strings "hardcodeados" cuando sea posible.

### 4. Cobertura Obligatoria

Al final del archivo, siempre debe incluirse la llamada a `verifyRoutesCoverage`. Esto garantiza que no se olvide ninguna ruta del controlador.