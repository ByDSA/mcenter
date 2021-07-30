/* eslint-disable import/prefer-default-export */
import App from "@app/app";
import config from "@app/config";
import { VideoInterface } from "@app/db/models/resources/video";
import { getFullUrl as _getFullUrl } from "../multimedia/misc";

type Params = {
  video: VideoInterface;
  app: App;
};
export function getFullUrl( { video, app }: Params) {
  return _getFullUrl(video, ROUTE_GET, app);
}

export const VIDEO = `${config.routes.api}/video`;

export const MUSIC_GET = `${VIDEO}/get`;

export const CREATE = `${VIDEO}/create`;

export const UPDATE = `${VIDEO}/update`;

export const ROUTE_GET = `${VIDEO}/get`;

export const ROUTE_GET_ALL = `${VIDEO}/getAll`;
