/* eslint-disable import/prefer-default-export */
import { Express } from "express";
import playStreamFunc from "./playStream";
import showStreamFunc from "./showStream";

export function addStreamRoutes(app: Express) {
  // Old
  app.get("/api/play/stream/:id/:number?", playStreamFunc);
  app.get("/api/crud/streams/:id", showStreamFunc);

  // New
}