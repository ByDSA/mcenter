/* eslint-disable import/prefer-default-export */
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { EpisodeRepository, compareEpisodeFullId } from "#modules/episodes";
import { HistoryList } from "#modules/historyLists";
import { DependencyFilter, Filter, PreventDisabledFilter, PreventRepeatInDaysFilter, PreventRepeatLastFilter, RemoveWeightLowerOrEqualThanFilter } from "#modules/picker";
import { Serie, SerieId } from "#modules/series";
import { Stream } from "#modules/streams";
import { asyncFilter } from "#shared/utils/arrays";
import { Picker } from "rand-picker";
import { Model, ModelFullId, ModelId, fullIdOf } from "../../models";

const compareResourceId = (episode: Model, id: ModelFullId) =>compareEpisodeFullId(episode, id);

type Params = {
  domainMessageBroker: DomainMessageBroker;
  episodeRepository: EpisodeRepository;
};
export default class PickerFilter {
  #serie: Serie;

  #episodes: Model[];

  #lastEp: Model | null;

  #historyList: HistoryList;

  #domainMessageBroker: DomainMessageBroker;

  #episodeRepository: EpisodeRepository;

  constructor(
    serie: Serie,
    episodes: Model[],
    lastEp: Model | null,
    stream: Stream,
    historyList: HistoryList, {domainMessageBroker,episodeRepository}: Params) {
    this.#serie = serie;
    this.#episodes = episodes;
    this.#lastEp = lastEp;
    this.#historyList = historyList;

    this.#domainMessageBroker = domainMessageBroker;
    this.#episodeRepository = episodeRepository;
  }

  // eslint-disable-next-line require-await
  async getFilters(): Promise<Filter<Model>[]> {
    const { PICKER_MIN_WEIGHT, PICKER_MIN_DAYS } = process.env;
    const filters: Filter<Model>[] = [ ];
    const dependencies: {[key: SerieId]: [ModelId, ModelId][]} = {
      simpsons: [
        ["6x25", "7x01"],
	      ["31x19", "31x20"],
      ],
      fguy: [
        ["6x04", "6x05"],
        ["4x28", "4x29"],
        ["4x29", "4x30"],
        ["12x06", "12x07"],
        ["12x07", "12x08"],
      ],
    };

    if (this.#serie.id in dependencies && this.#lastEp) {
      const serieDependencies = dependencies[this.#serie.id];
      const dependency = serieDependencies.find(([a]) => a === (this.#lastEp as Model).episodeId);

      if (dependency) {
        const dependencyFullId: [ModelFullId, ModelFullId] = dependency.map((episodeId) => ( {
          episodeId,
          serieId: this.#serie.id,
        } )) as [ModelFullId, ModelFullId];

        filters.push(new DependencyFilter( {
          lastId: fullIdOf(this.#lastEp),
          firstId: dependencyFullId[0],
          secondId: dependencyFullId[1],
          compareId: compareEpisodeFullId,
          compareResourceId,
        } ));

        return filters;
      }
    }

    filters.push(new PreventDisabledFilter());

    if (this.#lastEp)
    {filters.push(new PreventRepeatLastFilter(
      {
        lastId: fullIdOf(this.#lastEp),
        compareResourceId,
      } ));}

    filters.push(new RemoveWeightLowerOrEqualThanFilter(+(PICKER_MIN_WEIGHT ?? -99)));

    filters.push(new PreventRepeatInDaysFilter( {
      minDays: +(PICKER_MIN_DAYS ?? 0),
      lastTimePlayed: this.#lastEp?.lastTimePlayed ?? 0,
    } ));

    return filters;
  }

  async filter(picker: Picker<Model>): Promise<void> {
    console.log("Filtering...");
    const filters = await this.getFilters();
    const newData = await asyncFilter(picker.data, async (self: Model) => {
      for (const f of filters) {
        // eslint-disable-next-line no-await-in-loop
        if (!await f.filter(self))
          return false;
      }

      return true;
    } );

    // picker.setData
    for (let i = 0; i < picker.data.length; i++) {
      const episode = picker.data[i];

      if (!newData.includes(episode)) {
        picker.remove(episode);
        i--;
      }
    }

    // default case
    if (picker.data.length === 0)
      picker.put(this.#episodes[0]);
  }
}