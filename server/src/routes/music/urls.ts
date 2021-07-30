/* eslint-disable import/prefer-default-export */
import App from "@app/app";
import config from "@app/config";
import { MusicInterface } from "@models/resources/music";
import { getFullUrl as _getFullUrl } from "../multimedia/misc";

type Params = {
  music: MusicInterface;
  app: App;
};
export function getFullUrl( { music, app }: Params) {
  return _getFullUrl(music, ROUTE_GET, app);
}

export const MUSIC = `${config.routes.api}/music`;

export const MUSIC_GET = `${MUSIC}/get`;

export const CREATE = `${MUSIC}/create`;

export const UPDATE = `${MUSIC}/update`;

export const FIX = `${UPDATE}/fix`;

export const ROUTE_GET = `${MUSIC}/get`;

export const ROUTE_GET_ALL = `${MUSIC}/getAll`;

export const ROUTE_CREATE_YT = `${CREATE}/yt`;

export const ROUTE_FIX_ALL = `${FIX}/all`;

export const ROUTE_FIX_ONE = `${FIX}/one`;
