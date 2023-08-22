import { HistoryRepository } from "#modules/history";
import { EpisodeRepository, getRandomPicker } from "#modules/series/episode";
import { getDaysFromLastPlayed } from "#modules/series/episode/lastPlayed";
import { SerieRepository } from "#modules/series/serie";
import SerieService from "#modules/series/serie/SerieService";
import { StreamRepository } from "#modules/stream";
import { assertFound } from "#utils/http/validation";
import { Request, Response } from "express";

export default async function f(req: Request, res: Response) {
  const serieRepository = new SerieRepository();
  const streamRepository = new StreamRepository( {
    serieRepository,
  } );
  const episodeRepository = new EpisodeRepository( {
    serieRepository,
  } );
  const serieService = new SerieService( {
    serieRepository,
    episodeRepository,
  } );
  const historyRepository = new HistoryRepository();
  const { streamId } = getParams(req, res);
  const stream = await streamRepository.getOneById(streamId);

  if (stream) {
    const seriePromise = serieRepository.findOneFromGroupId(stream.group);
    const lastEpPromise = serieService.findLastEpisodeInStream(stream);

    await Promise.all([seriePromise, lastEpPromise]);
    const serie = await seriePromise;
    const lastEp = await lastEpPromise;

    console.log(`Received serie=${serie?.id} and lastEp=${lastEp?.episodeId}`);

    assertFound(serie);

    const historyList = await historyRepository.findByStream(stream);
    const picker = await getRandomPicker( {
      serie,
      lastEp,
      stream,
      historyList,
    } );
    const pickerWeight = picker.weight;
    let weightAcc = 0;
    const ret = picker.data.map((e) => {
      const id = e.episodeId;
      const selfWeight = picker.getWeight(e) || 1;
      const weight = Math.round((selfWeight / pickerWeight) * 100 * 100) / 100;
      const days = Math.floor(getDaysFromLastPlayed(e, historyList));

      return [id, weight, selfWeight, days];
    } ).sort((a: any, b: any) => b[1] - a[1])
      .filter((e) => {
        weightAcc += +e[1];

        return weightAcc <= 80;
      } );

    res.send(ret);
  } else
    res.sendStatus(404);
}

function getParams(req: Request, res: Response) {
  const { streamId } = req.params;

  if (!streamId)
    res.sendStatus(400);

  return {
    streamId,
  };
}
