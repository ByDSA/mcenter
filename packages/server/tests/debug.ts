import { INestApplication } from "@nestjs/common";
import { Application, Router } from "express";

export function getRoutes(expressApp: Application) {
  const routes: string[] = [];

  ((expressApp as any).router as Router).stack.forEach((middleware: any) => {
    if (middleware.route) {
      // Rutas definidas directamente en `app`
      const method = Object.keys(middleware.route.methods)[0].toUpperCase();
      const { path } = middleware.route;

      routes.push(`${method} ${path}`);
    } else if (middleware.name === "router" && middleware.handle.stack) {
      // Rutas en routers montados
      middleware.handle.stack.forEach((handler: any) => {
        const method = Object.keys(handler.route.methods)[0].toUpperCase();
        const { path } = handler.route;

        routes.push(`${method} ${path}`);
      } );
    }
  } );

  return routes;
}

export function printRoutes(nestApp: INestApplication) {
  const expressApp = nestApp.getHttpAdapter().getInstance() as Application;
  const routes = getRoutes(expressApp);

  console.log(routes);
}
