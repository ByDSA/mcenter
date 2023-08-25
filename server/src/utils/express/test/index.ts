import express, { Application, Router } from "express";
import errorHandler from "../errorHandler";

export function RouterApp(router: Router): Application {
  const app = express();

  app.use(router);

  app.use(errorHandler);

  return app;
}