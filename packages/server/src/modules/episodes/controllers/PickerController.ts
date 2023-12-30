import { DomainMessageBroker } from "#modules/domain-message-broker";
import { Episode, EpisodeRepository } from "#modules/episodes";
import { genEpisodeFilterApplier, genEpisodeWeightFixerApplier } from "#modules/episodes/EpisodePicker/appliers";
import { dependencies } from "#modules/episodes/EpisodePicker/appliers/Dependencies";
import LastTimePlayedService from "#modules/episodes/LastTimePlayedService";
import { Model } from "#modules/episodes/models";
import { HistoryListRepository } from "#modules/historyLists";
import { SerieRelationshipWithStreamFixer, SerieRepository } from "#modules/series";
import SerieService from "#modules/series/SerieService";
import { StreamRepository } from "#modules/streams";
import { asyncMap } from "#shared/utils/arrays";
import { assertFound } from "#shared/utils/http/validation";
import { assertIsDefined } from "#shared/utils/validation";
import { Controller, SecureRouter } from "#utils/express";
import express, { Request, Response } from "express";
import { Picker } from "rand-picker";
import { genRandomPickerWithData } from "../../picker/ResourcePicker/ResourcePickerRandom";

type ResultType = Episode & {
  percentage: number;
  days: number;
};

type Params = {
  domainMessageBroker: DomainMessageBroker;
};
export default class PickerController implements Controller {
  #domainMessageBroker: DomainMessageBroker;

  constructor( {domainMessageBroker}: Params) {
    this.#domainMessageBroker = domainMessageBroker;
  }

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
    const episodeRepository = new EpisodeRepository( {
      domainMessageBroker: this.#domainMessageBroker,
    } );
    const serieService = new SerieService( {
      serieRepository,
      episodeRepository,
    } );
    const { streamId } = getParams(req, res);
    const stream = await streamRepository.getOneById(streamId);

    assertFound(stream);
    const historyList = await historyListRepository.getOneByIdOrCreate(streamId);

    assertFound(historyList);

    const seriePromise = serieRepository.getOneById(stream.group.origins[0].id);
    const lastEpPromise = serieService.findLastEpisodeInHistoryList(historyList);

    await Promise.all([seriePromise, lastEpPromise]);
    const serie = await seriePromise;
    const lastEp = await lastEpPromise;

    console.log(`Received serie=${serie?.id} and lastEp=${lastEp?.id.innerId}`);

    assertFound(serie);

    const episodes: Episode[] = await episodeRepository.getManyBySerieId(serie.id);
    const picker = await genRandomPickerWithData( {
      resources: episodes,
      lastEp: lastEp ?? undefined,
      filterApplier: genEpisodeFilterApplier(episodes, dependencies, lastEp ?? undefined),
      weightFixerApplier: genEpisodeWeightFixerApplier(),
    } );
    const pickerWeight = picker.weight;
    const lastTimePlayedService = new LastTimePlayedService( {
      episodeRepository,
      domainMessageBroker: this.#domainMessageBroker,
    } );
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