import { HistoryListRepository } from "#modules/historyLists";
import { SerieRepository } from "#modules/series";
import { StreamRepository } from "#modules/streams";
import { asyncMap } from "#shared/utils/arrays";
import { assertFound } from "#shared/utils/http/validation";
import { assertIsDefined } from "#shared/utils/validation";
import { Controller, SecureRouter } from "#utils/express";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import express, { Request, Response } from "express";
import { Picker } from "rand-picker";
import LastTimePlayedService from "../../historyLists/LastTimePlayedService";
import { genRandomPickerWithData } from "../../picker/ResourcePicker/ResourcePickerRandom";
import { genEpisodeFilterApplier, genEpisodeWeightFixerApplier } from "../EpisodePicker/appliers";
import { dependencies } from "../EpisodePicker/appliers/Dependencies";
import { Model } from "../models";
import { Repository as EpisodeRepository } from "../repositories";

type ResultType = Model & {
  percentage: number;
  days: number;
};

const DepsMap = {
  streamRepository: StreamRepository,
  episodeRepository: EpisodeRepository,
  historyListRepository: HistoryListRepository,
  serieRepository: SerieRepository,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class PickerController implements Controller {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = (deps as Deps);
  }

  getRouter(): express.Router {
    const router = SecureRouter();

    router.get("/:streamId", this.#showPicker.bind(this));

    return router;
  }

  async #showPicker(req: Request, res: Response) {
    const {serieRepository, historyListRepository, episodeRepository} = this.#deps;
    const { streamId } = getParams(req, res);
    const stream = await this.#deps.streamRepository.getOneById(streamId);

    assertFound(stream);
    const historyList = await historyListRepository.getOneByIdOrCreate(streamId);

    assertFound(historyList);

    const seriePromise = serieRepository.getOneById(stream.group.origins[0].id);
    const lastEpId = historyList.entries.at(-1)?.episodeId;
    const lastEpPromise = lastEpId ? this.#deps.episodeRepository.getOneById(lastEpId) : Promise.resolve(null) ;

    await Promise.all([seriePromise, lastEpPromise]);
    const serie = await seriePromise;
    const lastEp = await lastEpPromise;

    console.log(`Received serie=${serie?.id} and lastEp=${lastEp?.id.innerId}`);

    assertFound(serie);

    const episodes: Model[] = await episodeRepository.getManyBySerieId(serie.id);
    const picker = await genRandomPickerWithData( {
      resources: episodes,
      lastEp: lastEp ?? undefined,
      filterApplier: genEpisodeFilterApplier(episodes, dependencies, lastEp ?? undefined),
      weightFixerApplier: genEpisodeWeightFixerApplier(),
    } );
    const pickerWeight = picker.weight;
    const lastTimePlayedService = new LastTimePlayedService();
    const ret = (await asyncMap(
      "end" in picker.data[0]
        ? (picker as Picker<Model>).data.filter(
          (e) => e.end === undefined || e.end < 100,
        )
        : picker.data,
      async(e: Model) => {
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