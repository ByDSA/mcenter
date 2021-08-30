import App from "@app/app";
import { getMusicFullPath, MusicInterface } from "@app/db/models/resources/music";
import { ResourceInterface } from "@app/db/models/resources/resource";
import { findSerieById, getEpisodeFullPath } from "@app/db/models/resources/serie";
import { MusicTypeStr, ResourceType } from "@app/db/models/resources/types";
import { VideoInterface } from "@app/db/models/resources/video";
import { getMusicObj } from "@app/routes/music";
import { MusicObjType } from "@app/routes/music/getObj";
import { getEpisodeObj } from "@app/routes/series";
import { EpisodeObjType } from "@app/routes/series/getEpisode/getObj";

type Params = {
  resource: ResourceInterface;
  type: ResourceType;
  app: App;
};
type Ret = {
 fullPath: string;
} & (EpisodeObjType | MusicObjType) | null;
export default async function getObjWithFullPath( { resource, type, app }: Params): Promise<Ret> {
  if (type === MusicTypeStr) {
    const music = <MusicInterface>resource;
    const ret = getMusicObj( {
      music,
      app,
    } );

    return {
      ...ret,
      fullPath: getMusicFullPath(music.path),
    };
  }

  if (typeof type === "object" && "serieId" in type) {
    const serie = await findSerieById(type.serieId);

    if (!serie)
      return null;

    const episode = <VideoInterface>resource;
    const ret = getEpisodeObj( {
      serie,
      episode,
      app,
    } );

    return {
      ...ret,
      fullPath: getEpisodeFullPath( {
        episode,
        serie,
      } ),
    };
  }

  return null;
}
