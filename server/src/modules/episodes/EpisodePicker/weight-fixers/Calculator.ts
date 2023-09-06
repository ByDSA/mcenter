/* eslint-disable class-methods-use-this */
/* eslint-disable require-await */
import { HistoryList } from "#modules/historyLists";
import { isDefined } from "#shared/utils/validation";
import { daysBetween } from "date-ops";
import { DateTime } from "luxon";
import LastTimePlayed from "../../LastTimePlayedService";
import { Model } from "../../models";
import WeightFixer, { WeightFixerParams } from "./WeightFixer";

type Params = {
  historyList: HistoryList;
};
export default class CalculatorWeightFixer implements WeightFixer<Model> {
  #historyList: HistoryList;

  constructor( {historyList}: Params) {
    this.#historyList = historyList;
  }

  #getDaysFromLastPlayed = async (self: Model): Promise<number> => {
    const lastTimePlayedService = new LastTimePlayed();
    let daysFromLastTime: number | undefined;

    if (self.lastTimePlayed) {
      const nowDateTime = DateTime.now();
      const lastTimePlayedDateTime = DateTime.fromSeconds(self.lastTimePlayed);

      daysFromLastTime = daysBetween(lastTimePlayedDateTime, nowDateTime);
    }

    if (!isDefined(daysFromLastTime))
      daysFromLastTime = await lastTimePlayedService.getDaysFromLastPlayed(self, this.#historyList);

    if (!isDefined(daysFromLastTime))
      daysFromLastTime = Number.MAX_SAFE_INTEGER;

    if (daysFromLastTime < 0 || Number.isNaN(daysFromLastTime))
      throw new Error(`Invalid daysFromLastTime: ${daysFromLastTime}`);

    return daysFromLastTime;
  };

  async fixWeight( { resource }: WeightFixerParams<Model>): Promise<number> {
    const self = resource;
    const daysFromLastTime = await this.#getDaysFromLastPlayed(self);
    let reinforcementFactor = 1;
    const weight = self && self.weight ? self.weight : 0;

    if (weight < -1)
      reinforcementFactor = 1.0 / (-weight);
    else if (weight > 1)
      reinforcementFactor = weight;

    return reinforcementFactor * daysFromLastTime;
  }
}