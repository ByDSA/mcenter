import { INestApplication, Logger, RequestMethod } from "@nestjs/common";
import { Application } from "express";

export type GotRoute = {
  path: string;
  regex: RegExp;
  httpMethod: RequestMethod;
  params: string[];
};

function stringToRequestMethod(method: string): RequestMethod {
  if (!method || typeof method !== "string")
    throw new Error("Method must be a non-empty string");

  const upperMethod = method.trim().toUpperCase();
  const methodMap: Record<string, RequestMethod> = {
    GET: RequestMethod.GET,
    POST: RequestMethod.POST,
    PUT: RequestMethod.PUT,
    DELETE: RequestMethod.DELETE,
    PATCH: RequestMethod.PATCH,
    OPTIONS: RequestMethod.OPTIONS,
    HEAD: RequestMethod.HEAD,
    ALL: RequestMethod.ALL,
  };
  const requestMethod = methodMap[upperMethod];

  if (requestMethod === undefined)
    throw new Error(`Unsupported HTTP method: ${method}`);

  return requestMethod;
}

const pathToRegex = (path: string) => {
  const regexPattern = path.replace(/:[^/]+/g, "[^/]+");

  return new RegExp(`^${regexPattern}$`);
};

export function getRoutes(expressApp: Application): GotRoute[] {
  const routes: GotRoute[] = [];
  // eslint-disable-next-line no-underscore-dangle
  const { router } = (expressApp as any)._events.request;

  router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      // Rutas definidas directamente en `app`
      const httpMethod = Object.keys(middleware.route.methods)[0].toUpperCase();
      const { path } = middleware.route;
      const params = extractParamsFromPath(path);

      routes.push( {
        httpMethod: stringToRequestMethod(httpMethod),
        path,
        regex: pathToRegex(path),
        params,
      } );
    } else if (middleware.name === "router" && middleware.handle.stack) {
      // Rutas en routers montados
      middleware.handle.stack.forEach((handler: any) => {
        const httpMethod = Object.keys(handler.route.methods)[0].toUpperCase();
        const { path } = handler.route;
        const params = extractParamsFromPath(path);

        routes.push( {
          httpMethod: stringToRequestMethod(httpMethod),
          regex: pathToRegex(path),
          path,
          params,
        } );
      } );
    }
  } );

  return routes;
}

// Versión alternativa que también maneja parámetros opcionales y wildcards
function extractParamsFromPath(path: string): string[] {
  const params: string[] = [];
  // Regex más completa que maneja:
  // :param - parámetros normales
  // :param? - parámetros opcionales
  // :param* - parámetros con wildcard
  // :param+ - parámetros con wildcard requerido
  const paramRegex = /:([a-zA-Z_$][a-zA-Z0-9_$]*)([?*+]?)/g;
  let match;

  // eslint-disable-next-line no-cond-assign
  while ((match = paramRegex.exec(path)) !== null) {
    const paramName = match[1];
    const modifier = match[2] || "";

    // Puedes incluir el modificador si lo necesitas
    params.push(modifier ? `${paramName}${modifier}` : paramName);
  }

  return params;
}

export function printRoutes(nestApp: INestApplication) {
  const expressApp = nestApp.getHttpAdapter().getInstance() as Application;
  const routes = getRoutes(expressApp);

  nestApp.get(Logger).log(routes);
}
