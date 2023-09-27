import { Episode, EpisodeRepository } from "#modules/episodes";
import { genPickerWithData } from "#modules/episodes/EpisodePicker/EpisodePickerRandom";
import LastTimePlayedService from "#modules/episodes/LastTimePlayedService";
import { Model } from "#modules/episodes/models";
import { HistoryListRepository } from "#modules/historyLists";
import { SerieRelationshipWithStreamFixer, SerieRepository } from "#modules/series";
import SerieService from "#modules/series/SerieService";
import { StreamRepository } from "#modules/streams";
import { asyncMap } from "#shared/utils/arrays";
import { assertIsDefined } from "#shared/utils/validation";
import { Controller, SecureRouter } from "#utils/express";
import { assertFound } from "#utils/http/validation";
import express, { Request, Response } from "express";

type ResultType = Episode & {
  percentage: number;
  days: number;
};
export default class PickerController implements Controller {
  getRouter(): express.Router {
    const router = SecureRouter();

    router.get("/:streamId", this.#showPicker.bind(this));

    return router;
  }

  async #showPicker(req: Request, res: Response) {
    const streamRepository = new StreamRepository();
    const serieRelationshipWithStreamFixer = new SerieRelationshipWithStreamFixer( {
      streamRepository,
    } );
    const serieRepository = new SerieRepository( {
      relationshipWithStreamFixer: serieRelationshipWithStreamFixer,
    } );
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
    const picker = await genPickerWithData( {
      serie,
      episodes,
      lastEp: lastEp ?? undefined,
      stream,
      historyList,
    } );
    const pickerWeight = picker.weight;
    const lastTimePlayedService = new LastTimePlayedService();
    const ret = (await asyncMap(picker.data.filter((e) => e.end < 100), async(e: Model) => {
      const selfWeight = picker.getWeight(e);

      assertIsDefined(selfWeight);
      const percentage = (selfWeight * 100) / pickerWeight;
      const days = Math.floor(await lastTimePlayedService.getDaysFromLastPlayed(e, historyList));

      return {
        ...e,
        percentage,
        days,
      } as ResultType;
    } )).sort((a: ResultType, b: ResultType) => b.percentage - a.percentage);

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