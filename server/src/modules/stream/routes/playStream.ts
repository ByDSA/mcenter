import { HistoryRepository } from "#modules/history";
import { PlayService, VLCService } from "#modules/play";
import { Serie, SerieRepository } from "#modules/series/serie";
import { StreamRepository } from "#modules/stream";
import { assertFound } from "#modules/utils/base/http/asserts";
import { Request, Response } from "express";
import StreamService from "../StreamService";

export default async function f(req: Request, res: Response) {
  console.log("playStream");
  const { id, number, force } = parseParams(req, res);
  const streamService = new StreamService();
  const vlcService = new VLCService();
  const streamRepository = StreamRepository.getInstance<StreamRepository>();
  const serieRepository = SerieRepository.getInstance<SerieRepository>();
  const historyRepository = HistoryRepository.getInstance<HistoryRepository>();
  const playService = new PlayService( {
    vlcService,
    streamRepository,
    historyRepository,
  } );
  const stream = await streamRepository.findOneById(id);

  assertFound(stream);

  const episodes = await streamService.pickNextEpisode(stream, number);
  const serieWithEpisodes = await serieRepository.findOneById(stream.id);

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
