import express, { Router } from "express";
import errorHandler from "../errorHandler";

export function RouterApp(router: Router): Router {
  const app = express();

  app.use(router);

  app.use(errorHandler);

  return app;
}