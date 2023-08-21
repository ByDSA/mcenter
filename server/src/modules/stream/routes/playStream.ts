import { HistoryRepository, HistoryService } from "#modules/history";
import { PlayService, VLCService } from "#modules/play";
import { EpisodeRepository } from "#modules/series";
import { Serie, SerieRepository } from "#modules/series/serie";
import { StreamRepository } from "#modules/stream";
import { assertFound } from "#utils/http/validation";
import { Request, Response } from "express";
import StreamService from "../StreamService";

export default async function f(req: Request, res: Response) {
  console.log("playStream");
  const { id, number, force } = parseParams(req, res);
  const streamService = new StreamService();
  const vlcService = new VLCService();
  const serieRepository = new SerieRepository();
  const streamRepository = new StreamRepository( {
    serieRepository,
  } );
  const episodeRepository = new EpisodeRepository( {
    serieRepository,
  } );
  const historyRepository = new HistoryRepository( {
    episodeRepository,
  } );
  const historyService = new HistoryService( {
    episodeRepository,
    historyRepository,
  } );
  const playService = new PlayService( {
    vlcService,
    streamRepository,
    historyService,
    historyRepository,
  } );
  const stream = await streamRepository.getOneByIdOrCreateFromSerie(id);

  assertFound(stream);

  const episodes = await streamService.pickNextEpisode(stream, number);
  const serieWithEpisodes = await serieRepository.getOneById(stream.id);

  assertFound(serieWithEpisodes);

  const serie: Serie = {
    id: serieWithEpisodes.id,
    name: serieWithEpisodes.name,
  };
  const episodeWithSerie = episodes.map((episode) => ( {
    ...episode,
    serie,
  } ));

  await playService.play( {
    episodes: episodeWithSerie,
    force,
  } );

  res.send(episodes);
}

function parseParams(req: Request, res: Response) {
  const forceStr = req.query.force;
  const force = !!forceStr;
  const { id } = req.params;
  const number = +(req.params.number ?? 1);

  if (!id)
    res.sendStatus(400);

  return {
    id,
    number,
    force,
  };
}
