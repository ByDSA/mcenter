import { Express } from "express";
import getSerie from "./get";
import { playEpisode } from "./play";
import { SERIE_GET, SERIE_PLAY } from "./urls";

export default function apiRoutes(app: Express) {
  app.get(`${SERIE_PLAY}/:urlSerie/:urlEpisode`, playEpisode);

  app.get(`${SERIE_GET}/:url`, getSerie);
}
