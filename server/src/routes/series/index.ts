import { Express } from "express";
import { SERIE_GET, SERIE_PLAY } from "./config";
import getSerie from "./get";
import playFunc, { playSerieFunc } from "./play";
import showPickerFunc from "./showPicker";

export default function apiRoutes(app: Express) {
  app.get(`${SERIE_PLAY}/:name/:id`, playSerieFunc);
  app.get("/api/play/:type/:id", playFunc);

  app.get(`${SERIE_GET}/:url`, getSerie);
  app.get("/api/picker/:streamId", showPickerFunc);
}
