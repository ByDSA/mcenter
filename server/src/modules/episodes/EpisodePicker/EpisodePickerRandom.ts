/* eslint-disable class-methods-use-this */
/* eslint-disable no-await-in-loop */
import { HistoryList, createHistoryEntryByEpisodeFullId } from "#modules/historyLists";
import { Serie } from "#modules/series";
import { Stream } from "#modules/streams";
import { throwErrorPopStack } from "#shared/utils/errors";
import { assertIsDefined, isDefined } from "#shared/utils/validation";
import { DateTime } from "luxon";
import { Picker, newPicker } from "rand-picker";
import { Model, compareFullId } from "../models";
import EpisodePicker from "./EpisodePicker";
import { PickerFilter } from "./filters";
import { PickerWeightFixer } from "./weight-fixers";

type FuncGeneratorParams = {
  serie: Serie;
  episodes: Model[];
  lastEp?: Model;
  stream: Stream;
  historyList: HistoryList;
};

type Params = {
  episodes: Model[];
  lastEp?: Model;
  serie: Serie;
  stream: Stream;
  historyList: HistoryList;
};
export default class RandomPicker implements EpisodePicker {
  #episodes: Model[];

  #lastEp: Model | undefined;

  #serie: Serie;

  #stream: Stream;

  #historyList: HistoryList;

  constructor( {episodes,historyList, serie,stream,lastEp}: Params) {
    this.#episodes = episodes;
    this.#historyList = historyList;
    this.#serie = serie;
    this.#stream = stream;
    this.#lastEp = lastEp;
  }

  async pick(n: number): Promise<Model[]> {
    const episodes: Model[] = [];

    for (let i = 0; i < n; i++) {
      const episode = await this.#getNextEpisodeRandom( {
        serie: this.#serie,
        episodes: this.#episodes,
        lastEp: this.#lastEp,
        stream: this.#stream,
        historyList: this.#historyList,
      } );

      if (i < n - 1) {
        episode.lastTimePlayed = Math.floor(DateTime.now().toSeconds());
        // replace episode in allEpisodesInSerie
        this.#episodes.splice(this.#episodes.findIndex((e) => compareFullId(e, episode)), 1, episode);
        this.#historyList.entries.push(createHistoryEntryByEpisodeFullId(episode));
        this.#lastEp = episode;
      }

      episodes.push(episode);
    }

    return episodes;
  }

  async #getNextEpisodeRandom( {serie,
    episodes,
    lastEp,
    stream,
    historyList}: FuncGeneratorParams,
  ): Promise<Model> {
    const picker = await genPickerWithData( {
      serie,
      episodes,
      lastEp,
      stream,
      historyList,
    } );

    console.log("Picking one ...");
    const ret = picker.pickOne();

    assertIsDefined(ret, "Picker has no data");

    return ret;
  }
}

export async function genPickerWithData( {serie, episodes, lastEp, stream, historyList}: FuncGeneratorParams) {
  console.log("Getting random picker...");

  const picker: Picker<Model> = newPicker(episodes, {
    weighted: true,
  } );

  await new PickerFilter(serie, episodes, lastEp ?? null, stream, historyList).filter(picker);
  assertPickerHasData(picker);
  await new PickerWeightFixer( {
    historyList,
  } ).weightFix(picker);

  return picker;
}

function assertPickerHasData(picker: Picker<Model>) {
  for (const d of picker.data) {
    if (isDefined(d))
      return;
  }

  throwErrorPopStack(new Error("Picker has no data"));
}