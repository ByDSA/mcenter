/* eslint-disable import/prefer-default-export */
import { Express } from "express";
import showSerie from "./showSerie";

export function addSerieRoutes(app: Express) {
  app.get("/api/crud/series/:id", showSerie);
}