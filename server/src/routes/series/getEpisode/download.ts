import { Episode, getEpisodeFullPath, SerieInterface } from "@app/db/models/resources/serie";
import download from "@routes/download";
import { Response } from "express";

type Params = {
  serie: SerieInterface;
  episode: Episode;
  res: Response;
};

export default function downloadEpisode( { episode, serie, res }: Params) {
  const fullPath = getEpisodeFullPath( {
    episode,
    serie,
  } );

  download( {
    fullPath,
    res,
  } );
}
