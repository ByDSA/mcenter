import App from "@app/app";
import getSerie from "./get";
import getEpisodeApp, { getEpisodeObj } from "./getEpisode";
import { playEpisode } from "./play";
import { getFullUrlEpisode, SERIE_GET, SERIE_GET_EPISODE, SERIE_PLAY_EPISODE } from "./urls";

export default function apiRoutes(app: App) {
  const { expressApp } = app;

  if (!expressApp)
    throw new Error();

  expressApp.get(`${SERIE_PLAY_EPISODE}`, playEpisode);
  expressApp.get(`${SERIE_GET_EPISODE}`, getEpisodeApp(app));
  expressApp.get(`${SERIE_GET}/:url`, getSerie);
}

export {
  getFullUrlEpisode,
  getEpisodeObj,
};
