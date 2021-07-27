import { Express } from "express";
import { SERIE_GET, SERIE_PLAY } from "./config";
import getSerie from "./get";
import { playEpisode } from "./play";
import showPickerFunc from "./showPicker";

export default function apiRoutes(app: Express) {
  app.get(`${SERIE_PLAY}/:urlSerie/:urlEpisode`, playEpisode);

  app.get(`${SERIE_GET}/:url`, getSerie);
  app.get("/api/picker/:streamId", showPickerFunc);
}
