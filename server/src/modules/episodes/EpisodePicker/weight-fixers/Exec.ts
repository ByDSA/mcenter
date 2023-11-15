import { DomainMessageBroker } from "#modules/domain-message-broker";
import { EpisodeRepository } from "#modules/episodes";
import { Model } from "#modules/episodes/models";
import { HistoryList } from "#modules/historyLists";
import { Picker } from "rand-picker";
import CalculatorWeightFixer from "./Calculator";
import LimiterWeightFixer from "./Limiter";
import TagWeightFixer from "./Tag";
import WeightFixer from "./WeightFixer";

type Params = {
  historyList: HistoryList;
  domainMessageBroker: DomainMessageBroker;
  episodeRepository: EpisodeRepository;
};
export default class Exec {
  #historyList: HistoryList;

  #episodeRepository: EpisodeRepository;

  #domainMessageBroker: DomainMessageBroker;

  constructor( {historyList, domainMessageBroker, episodeRepository}: Params) {
    this.#historyList = historyList;
    this.#domainMessageBroker = domainMessageBroker;
    this.#episodeRepository = episodeRepository;
  }

  getWeightFixers(picker: Picker<Model>): WeightFixer<Model>[] {
    const ret: WeightFixer<Model>[] = [];

    ret.push(new CalculatorWeightFixer( {
      historyList: this.#historyList,
      domainMessageBroker: this.#domainMessageBroker,
      episodeRepository: this.#episodeRepository,
    } ));
    ret.push(new TagWeightFixer());
    ret.push(new LimiterWeightFixer(Number.MAX_SAFE_INTEGER / picker.data.length));

    return ret;
  }

  async weightFix(picker: Picker<Model>): Promise<void> {
    console.log("Fixing weight...");

    const weightFixers = this.getWeightFixers(picker);

    for (const self of picker.data) {
      let currentWeight: number = picker.getWeight(self) ?? 1;

      for (const weightFixer of weightFixers) {
        // eslint-disable-next-line no-await-in-loop
        currentWeight = await weightFixer.fixWeight( {
          resource: self,
          currentWeight,
        } );
      }

      picker.put(self, currentWeight);
    }

    console.log("Fixed weight!");
  }
}