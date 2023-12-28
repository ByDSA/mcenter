/* eslint-disable class-methods-use-this */
/* eslint-disable require-await */
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { EpisodeRepository } from "#modules/episodes";
import { HistoryList } from "#modules/historyLists";
import { WeightFixer, WeightFixerParams } from "#modules/picker";
import LastTimeWeightFixer from "#modules/picker/ResourcePicker/weight-fixers/LastTime";
import { Pickable } from "#shared/models/resource";
import { isDefined } from "#shared/utils/validation";
import { DateTime } from "luxon";
import LastTimePlayed from "../../LastTimePlayedService";
import { Model } from "../../models";

const SECONDS_IN_DAY = 24 * 60 * 60;

type Params = {
  historyList: HistoryList;
  domainMessageBroker: DomainMessageBroker;
  episodeRepository: EpisodeRepository;
};
export default class CalculatorWeightFixer implements WeightFixer<Model> {
  #historyList: HistoryList;

  #domainMessageBroker: DomainMessageBroker;

  #episodeRepository: EpisodeRepository;

  constructor( {historyList, domainMessageBroker, episodeRepository}: Params) {
    this.#historyList = historyList;
    this.#domainMessageBroker = domainMessageBroker;
    this.#episodeRepository = episodeRepository;
  }

  #getLastTimePicked = async (self: Model): Promise<number> => {
    let lastTimePicked: number | undefined;

    lastTimePicked = self.lastTimePlayed;

    if (!isDefined(lastTimePicked)) {
      const lastTimePlayedService = new LastTimePlayed( {
        episodeRepository: this.#episodeRepository,
        domainMessageBroker: this.#domainMessageBroker,
      } );

      lastTimePicked = DateTime.now().toSeconds() - await lastTimePlayedService.getDaysFromLastPlayed(self, this.#historyList) * SECONDS_IN_DAY;
    }

    if (!isDefined(lastTimePicked))
      lastTimePicked = Number.MAX_SAFE_INTEGER;

    if (lastTimePicked < 0 || Number.isNaN(lastTimePicked))
      throw new Error(`Invalid secondsFromLastTime: ${lastTimePicked}`);

    return lastTimePicked;
  };

  async fixWeight( { resource, currentWeight }: WeightFixerParams<Model>): Promise<number> {
    const lastTimePicked = await this.#getLastTimePicked(resource);
    const fx = (r: Pickable, x: number): number => {
      const daysFromLastTime = x / SECONDS_IN_DAY;
      let reinforcementFactor = 1;
      const {weight} = r;

      if (weight < -1)
        reinforcementFactor = 1.0 / (-weight);
      else if (weight > 1)
        reinforcementFactor = weight;

      return reinforcementFactor * daysFromLastTime;
    };
    const lastTimeWeightFixer = new LastTimeWeightFixer( {
      lastTimePicked,
      fx,
    } );
    const ret = await lastTimeWeightFixer.fixWeight( {
      resource,
      currentWeight,
    } );

    return ret;
  }
}