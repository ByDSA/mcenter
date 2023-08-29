import { Episode, EpisodeRepository, getRandomPicker } from "#modules/episodes";
import { getDaysFromLastPlayed } from "#modules/episodes/lastPlayed";
import { HistoryListRepository } from "#modules/historyLists";
import { SerieRepository } from "#modules/series";
import SerieService from "#modules/series/SerieService";
import { StreamRepository } from "#modules/streams";
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
    const streamRepository = new StreamRepository();
    const historyListRepository = new HistoryListRepository();
    const episodeRepository = new EpisodeRepository();
    const serieService = new SerieService( {
      serieRepository,
      episodeRepository,
    } );
    const { streamId } = getParams(req, res);
    const stream = await streamRepository.getOneById(streamId);

    assertFound(stream);
    const historyList = await historyListRepository.getOneById(streamId);

    assertFound(historyList);

    const seriePromise = serieRepository.getOneById(stream.group.origins[0].id);
    const lastEpPromise = serieService.findLastEpisodeInHistoryList(historyList);

    await Promise.all([seriePromise, lastEpPromise]);
    const serie = await seriePromise;
    const lastEp = await lastEpPromise;

    console.log(`Received serie=${serie?.id} and lastEp=${lastEp?.episodeId}`);

    assertFound(serie);

    const episodes: Episode[] = await episodeRepository.getManyBySerieId(serie.id);
    const picker = await getRandomPicker( {
      serie,
      episodes,
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