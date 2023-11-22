import LastTimePlayedService from "#modules/episodes/LastTimePlayedService";
import { HistoryList } from "#modules/historyLists";
import { Model } from "../../models";
import Filter from "./Filter";

type Params = {
  minDays: number;
  historyList: HistoryList;
  lastTimePlayedService: LastTimePlayedService;
};
export default class PreventRepeatInDaysFilter implements Filter<Model> {
  #minDays: number;

  #historyList: HistoryList;

  #lastTimePlayedService: LastTimePlayedService;

  constructor( {minDays, historyList, lastTimePlayedService}: Params) {
    this.#minDays = minDays;
    this.#historyList = historyList;
    this.#lastTimePlayedService = lastTimePlayedService;
  }

  async filter(self: Model): Promise<boolean> {
    const daysFromLastTime = await this.#lastTimePlayedService.getDaysFromLastPlayed(self, this.#historyList);

    return daysFromLastTime >= this.#minDays;
  }
}