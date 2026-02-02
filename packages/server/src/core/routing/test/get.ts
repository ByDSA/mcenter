import { INestApplication, Logger } from "@nestjs/common";
import { Application } from "express";

export type HttpMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export type GotRoute = {
  path: string;
  regex: RegExp;
  method: HttpMethod;
  params: string[];
};

const pathToRegex = (path: string) => {
  const regexPattern = path.replace(/:[^/]+/g, "[^/]+");

  return new RegExp(`^${regexPattern}$`);
};

export function getExpressRoutes(expressApp: Application): GotRoute[] {
  const routes: GotRoute[] = [];
  // eslint-disable-next-line no-underscore-dangle
  const { router } = (expressApp as any)._events.request;

  router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      // Rutas definidas directamente en `app`
      const httpMethod = Object.keys(middleware.route.methods)[0].toUpperCase() as HttpMethod;
      const { path } = middleware.route;
      const params = extractParamsFromPath(path);

      routes.push( {
        method: httpMethod,
        path,
        regex: pathToRegex(path),
        params,
      } );
    } else if (middleware.name === "router" && middleware.handle.stack) {
      // Rutas en routers montados
      middleware.handle.stack.forEach((handler: any) => {
        const httpMethod = Object.keys(handler.route.methods)[0].toUpperCase() as HttpMethod;
        const { path } = handler.route;
        const params = extractParamsFromPath(path);

        routes.push( {
          method: httpMethod,
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
  const routes = getExpressRoutes(expressApp);

  nestApp.get(Logger).log(routes);
}
