import App from "@app/app";
import config from "@app/config";
import { VideoInterface } from "@app/db/models/resources/video";
import { getFullUrl as _getFullUrl } from "../multimedia/misc";

export const SERIE = `${config.routes.api}/serie`;

export const SERIE_PLAY_EPISODE = `${SERIE}/play/:urlSerie/:urlEpisode`;

export const SERIE_GET = `${SERIE}/get`;

export const SERIE_GET_EPISODE = `${SERIE_GET}/:serieUrl/:episodeUrl`;

export const ROUTE_GET_ALL = `${SERIE_GET}/all`;

export function getFullUrlEpisode(serieName: string, episode: VideoInterface, app: App) {
  return _getFullUrl(episode, `${SERIE_GET}/${serieName}`, app);
}
