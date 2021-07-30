import App from "@app/app";
import { Episode, SerieInterface } from "@app/db/models/resources/serie";
import { ResourceFileObjType } from "@app/routes/ResourceObjType";
import { getFullUrlEpisode } from "../urls";

type Params = {
  serie: SerieInterface;
  episode: Episode;
  app: App;
};
export type EpisodeObjType = ResourceFileObjType;

export default function getObj( { episode, serie, app }: Params): EpisodeObjType {
  const fullRawUrl = getFullRawUrl( {
    serie,
    episode,
    app,
  } );
  const fullUrl = getFullUrl( {
    serie,
    episode,
    app,
  } );

  return {
    hash: episode.hash,
    name: episode.name,
    raw: fullRawUrl,
    url: fullUrl,
  };
}

function getFullRawUrl( { serie, episode, app }: Params) {
  return `${getFullUrl( {
    serie,
    episode,
    app,
  } )}?raw=1`;
}

function getFullUrl( { serie, episode, app }: Params) {
  return `${getFullUrlEpisode(serie.url, episode, app)}`;
}
