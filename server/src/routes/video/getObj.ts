import App from "@app/app";
import { VideoInterface } from "@app/db/models/resources/video";
import { ResourceFileObjType } from "../ResourceObjType";
import { getFullUrl } from "./urls";

export type VideoObjType = ResourceFileObjType;
type Params = {
  video: VideoInterface;
  app: App;
};
export default function getObj( { video, app }: Params): VideoObjType {
  const fullRawUrl = getFullRawUrl( {
    video,
    app,
  } );
  const fullUrl = getFullUrl( {
    video,
    app,
  } );

  return {
    hash: video.hash,
    name: video.name,
    raw: fullRawUrl,
    url: fullUrl,
  };
}

function getFullRawUrl( { video, app }: Params) {
  return `${getFullUrl( {
    video,
    app,
  } )}?raw=1`;
}
