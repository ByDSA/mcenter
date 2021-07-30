/* eslint-disable import/prefer-default-export */
import { MusicInterface } from "@models/resources/music";
import { getFullUrl as _getFullUrl } from "../multimedia/misc";
import { ROUTE_GET } from "./config";

export function getFullUrl(music: MusicInterface) {
  return _getFullUrl(music, ROUTE_GET);
}
