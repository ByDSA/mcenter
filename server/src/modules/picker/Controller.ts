import { EpisodeRepository, getRandomPicker } from "#modules/episodes";
import { getDaysFromLastPlayed } from "#modules/episodes/lastPlayed";
import { streamWithHistoryListToHistoryList } from "#modules/historyLists";
import { SerieRepository } from "#modules/series";
import SerieService from "#modules/series/SerieService";
import { StreamWithHistoryListRepository } from "#modules/streamsWithHistoryList";
import { SecureRouter } from "#utils/express";
import { assertFound } from "#utils/http/validation";
import express, { Request, Response } from "express";

export default class PickerController {
  getPickerRouter(): express.Router {
    const router = SecureRouter();

    router.get("/:streamId", this.#showPicker.bind(this));

    return router;
  }

  async #showPicker(req: Request, res: Response) {
    const serieRepository = new SerieRepository();
    const streamWithHistoryListRepository = new StreamWithHistoryListRepository();
    const episodeRepository = new EpisodeRepository();
    const serieService = new SerieService( {
      serieRepository,
      episodeRepository,
    } );
    const { streamId } = getParams(req, res);
    const streamWithHistoryList = await streamWithHistoryListRepository.getOneById(streamId);

    assertFound(streamWithHistoryList);

    const seriePromise = serieRepository.findOneFromGroupId(streamWithHistoryList.group);
    const lastEpPromise = serieService.findLastEpisodeInStreamWithHistoryList(streamWithHistoryList);

    await Promise.all([seriePromise, lastEpPromise]);
    const serie = await seriePromise;
    const lastEp = await lastEpPromise;

    console.log(`Received serie=${serie?.id} and lastEp=${lastEp?.episodeId}`);

    assertFound(serie);

    const episodes = await episodeRepository.getManyBySerieId(serie.id);
    const historyList = streamWithHistoryListToHistoryList(streamWithHistoryList);
    const picker = await getRandomPicker( {
      serie,
      episodes,
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
  }
}

function getParams(req: Request, res: Response) {
  const { streamId } = req.params;

  if (!streamId)
    res.sendStatus(400);

  return {
    streamId,
  };
}