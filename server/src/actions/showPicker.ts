import { EpisodeRepository, getRandomPicker } from "#modules/episodes";
import { getDaysFromLastPlayed } from "#modules/episodes/lastPlayed";
import { streamWithHistoryListToHistoryList } from "#modules/historyLists/models/adapters";
import { SerieWithEpisodesRepository, SerieWithEpisodesService } from "#modules/seriesWithEpisodes";
import { StreamWithHistoryListRepository } from "#modules/streamsWithHistoryList";
import { assertFound } from "#utils/http/validation";
import { Request, Response } from "express";

export default async function f(req: Request, res: Response) {
  const serieWithEpisodesRepository = new SerieWithEpisodesRepository();
  const streamWithHistoryListRepository = new StreamWithHistoryListRepository();
  const episodeRepository = new EpisodeRepository( {
    serieWithEpisodesRepository,
  } );
  const serieService = new SerieWithEpisodesService( {
    serieWithEpisodesRepository,
    episodeRepository,
  } );
  const { streamId } = getParams(req, res);
  const streamWithHistoryList = await streamWithHistoryListRepository.getOneById(streamId);

  if (streamWithHistoryList) {
    const seriePromise = serieWithEpisodesRepository.findOneFromGroupId(streamWithHistoryList.group);
    const lastEpPromise = serieService.findLastEpisodeInStreamWithHistoryList(streamWithHistoryList);

    await Promise.all([seriePromise, lastEpPromise]);
    const serie = await seriePromise;
    const lastEp = await lastEpPromise;

    console.log(`Received serie=${serie?.id} and lastEp=${lastEp?.episodeId}`);

    assertFound(serie);

    const historyList = streamWithHistoryListToHistoryList(streamWithHistoryList);
    const picker = await getRandomPicker( {
      serie,
      lastEp,
      stream: streamWithHistoryList,
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
