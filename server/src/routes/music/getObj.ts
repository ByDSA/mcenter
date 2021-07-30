import App from "@app/app";
import { MusicInterface } from "@app/db/models/resources/music";
import { ResourceFileObjType } from "../ResourceObjType";
import { getFullUrl } from "./urls";

export type MusicObjType = ResourceFileObjType & {
  artist?: string;
  album?: string;
  name?: string;
};
type Params = {
  music: MusicInterface;
  app: App;
};
export default function getObj( { music, app }: Params): MusicObjType {
  const fullRawUrl = getFullRawUrl( {
    music,
    app,
  } );
  const fullUrl = getFullUrl( {
    music,
    app,
  } );

  return {
    hash: music.hash,
    name: music.name,
    raw: fullRawUrl,
    url: fullUrl,
    artist: music.artist,
    album: music.album,
  };
}

function getFullRawUrl( { music, app }: Params) {
  return `${getFullUrl( {
    music,
    app,
  } )}?raw=1`;
}
