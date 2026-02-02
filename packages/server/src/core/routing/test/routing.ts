/* eslint-disable jest/no-export */
import path from "node:path";
import { Logger, RequestMethod, Type } from "@nestjs/common";
import { Routes } from "@nestjs/core";
import { neverCase } from "$shared/utils/validation";
import { GET_MANY_CRITERIA_PATH, GET_ONE_CRITERIA_PATH } from "$shared/routing";
import { directImports, routeModules, routes } from "#core/routing/routes";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { mockMongoId } from "#tests/mongo";
import { getExpressRoutes, GotRoute, HttpMethod } from "./get";

let testingSetup: TestingSetup;
let allAppRoutes: GotRoute[] = [];
const localTestedKeys = new Set<string>();

type Options = {
  method?: HttpMethod;
  exactMatch?: boolean;
};

/**
 * Verifica que TODAS las rutas asociadas a un controlador hayan sido ejecutadas
 * mediante la función `testRoute` en el contexto actual.
 *
 * Esta función extrae los metadatos (Path y Método) directamente de la clase del controlador.
 *
 * @param controller La clase del controlador (ej: UsersController)
 * @param excludePaths Array de paths completos a excluir (ej: '/api/users/:id/debug')
 */
type VerifyRoutesCoverageProps = {
  excludePaths?: string[];
  controller: Type<any>;
  controllerRoute?: string;
};
export function verifyRoutesCoverage(
  props: VerifyRoutesCoverageProps,
) {
  const { controller, controllerRoute } = props;

  // eslint-disable-next-line jest/expect-expect
  it(`Coverage Check: Todas las rutas de ${controller.name} deben estar testeadas`, async () => {
    if (!testingSetup)
      await init();

    // 1. Obtener path base del controlador
    const controllerPath = Reflect.getMetadata("path", controller) || "/";
    const missingRoutes: string[] = [];
    // 2. Iterar sobre los métodos del prototipo del controlador
    const proto = controller.prototype;
    const methodNames = Object.getOwnPropertyNames(proto).filter(
      prop => prop !== "constructor" && typeof proto[prop] === "function",
    );

    for (const methodName of methodNames) {
      const handler = proto[methodName];
      // Obtener metadatos del método
      const method = Reflect.getMetadata("method", handler); // RequestMethod enum
      const pathMetadata = Reflect.getMetadata("path", handler);

      // Si no tiene decorador HTTP o Path, lo ignoramos
      if (method === undefined || pathMetadata === undefined)
        continue;

      // Nest permite que el path sea un string o un array de strings
      const paths = Array.isArray(pathMetadata) ? pathMetadata : [pathMetadata];

      for (const p of paths) {
        // Construimos el path completo esperado
        let fullPath = path.join(controllerRoute ?? "", fixPath(controllerPath, p));

        fullPath = sanitizePath(fullPath);

        // Chequeo de exclusión
        if (props.excludePaths?.includes(fullPath))
          continue;

        const methodStr = requestMethodToString(method);
        const key = `${methodStr}:${fullPath}`;

        // Verificamos si esta clave fue registrada por testRoute
        if (!localTestedKeys.has(key))
          missingRoutes.push(`${methodStr} ${fullPath}`);
      }
    }

    // 3. Aserción final
    if (missingRoutes.length > 0) {
      const msg = `
        \n🛑 Faltan tests para las siguientes rutas en ${controller.name}:\n${missingRoutes
  .map(r => `   - ${r}`)
  .join("\n")}`;

      throw new Error(msg);
    }
  } );
}

/**
 * Registra y verifica la existencia de una ruta en el módulo actual.
 */
export function testRoute(url: string, options?: Options) {
  const httpMethod: HttpMethod = options?.method ?? "GET";

  it(`should exists route: ${httpMethod} ${url}`, async () => {
    if (!testingSetup)
      await init();

    const matchedRoute = findMatchingRoute(url, httpMethod, options?.exactMatch);

    try {
      expect(matchedRoute).toBeDefined();

      if (matchedRoute) {
        const sanitizedPath = sanitizePath(matchedRoute.path);
        const key = `${matchedRoute.method}:${sanitizedPath}`;

        localTestedKeys.add(key);
      }
    } catch (e) {
      new Logger().error(
        `Ruta no encontrada: ${httpMethod} ${url} (exactMatch: ${!!options?.exactMatch})`,
      );
      throw e;
    }
  } );
}

type CrudEndpoint = "create-many" | "create" | "delete-many" | "delete" | "get-all" |
  "get-many-criteria" | "get-one-criteria" | "get" | "patch";

export function testCrudRoutes(baseUrl: string, endpoints: CrudEndpoint[]) {
  const urlWithId = baseUrl + "/" + mockMongoId;

  for (const endpoint of endpoints) {
    switch (endpoint) {
      case "get":
        testRoute(urlWithId);
        break;
      case "create":
        testRoute(baseUrl, {
          method: "POST",
          exactMatch: true,
        } );
        break;
      case "create-many":
        testRoute(baseUrl + "/create-many", {
          method: "POST",
          exactMatch: true,
        } );
        break;
      case "delete":
        testRoute(urlWithId, {
          method: "DELETE",
        } );
        break;
      case "patch":
        testRoute(urlWithId, {
          method: "PATCH",
        } );
        break;
      case "get-one-criteria":
        testRoute(baseUrl + "/" + GET_ONE_CRITERIA_PATH, {
          method: "POST",
          exactMatch: true,
        } );
        break;
      case "get-many-criteria":
        testRoute(baseUrl + "/" + GET_MANY_CRITERIA_PATH, {
          method: "POST",
          exactMatch: true,
        } );
        break;
      case "get-all":
        testRoute(baseUrl, {
          method: "GET",
          exactMatch: true,
        } );
        break;
      case "delete-many":
        testRoute(baseUrl, {
          method: "DELETE",
          exactMatch: true,
        } );
        break;
      default: neverCase(endpoint);
    }
  }
}

// --- INIT & EXTRACTION LOGIC ---
async function init() {
  if (testingSetup)
    return;

  const modulesInRoutes = getModulesFromRoutes(routes);
  const indirectRoutingModules = modulesInRoutes.filter(m => !directImports.includes(m));

  testingSetup = await createTestingAppModuleAndInit( {
    imports: [
      ...routeModules,
      ...indirectRoutingModules],
  } );

  const expressApp = (testingSetup as any).routerApp || (testingSetup as any).app;

  // Obtenemos solo las rutas reales de Express (La verdad del servidor)
  // Ya no intentamos asignar controladores aquí.
  allAppRoutes = getExpressRoutes(expressApp);
}

function fixPath(base: string, p: string): string {
  const safeBase = base ?? "";
  const safePath = p ?? "";
  let combined = `/${safeBase}/${safePath}`;

  combined = combined.replace(/\/+/g, "/");

  if (combined.length > 1 && combined.endsWith("/"))
    combined = combined.slice(0, -1);

  return combined;
}

const findMatchingRoute = (
  targetUrl: string,
  targetMethod: HttpMethod,
  exactMatch?: boolean,
) => {
  return allAppRoutes.find(route => {
    if (route.method !== targetMethod)
      return false;

    if (exactMatch)
      return route.path === targetUrl;

    return route.regex.test(targetUrl);
  } );
};

function requestMethodToString(method: RequestMethod): string {
  const map: Record<number, string> = {
    0: "GET",
    1: "POST",
    2: "PUT",
    3: "DELETE",
    4: "PATCH",
    5: "ALL",
    6: "OPTIONS",
    7: "HEAD",
  };

  return map[method] || "UNKNOWN";
}

function sanitizePath(p: string): string {
  if (p.endsWith("/") && p.length > 1)
    return p.slice(0, -1);

  return p;
}

function getModulesFromRoutes(rs: Routes): Type<any>[] {
  const modules: Type<any>[] = [];
  const recurse = (r: Routes) => {
    r.forEach(route => {
      if (route.module)
        modules.push(route.module);

      if (route.children) {
        recurse(
          Array.isArray(route.children) ? route.children : [route.children as any],
        );
      }
    } );
  };

  recurse(rs);

  return Array.from(new Set(modules));
}
