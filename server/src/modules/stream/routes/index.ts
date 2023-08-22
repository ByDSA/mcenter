/* eslint-disable import/prefer-default-export */
import { Express } from "express";
import showStreamFunc from "./showStream";

export function addStreamRoutes(app: Express) {
  // Old

  app.get("/api/crud/streams/:id", showStreamFunc);

  // New
}