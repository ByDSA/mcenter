import { streamWithHistoryListToHistoryList } from "#modules/historyLists";
import HistoryList from "#modules/historyLists/models/HistoryList";
import { Serie, SerieRepository } from "#modules/series";
import { StreamMode } from "#modules/streams";
import { StreamWithHistoryList, StreamWithHistoryListRepository } from "#modules/streamsWithHistoryList";
import { throwErrorPopStack } from "#utils/errors";
import { assertFound } from "#utils/http/validation";
import { assertIsDefined, neverCase } from "#utils/validation";
import { Picker, newPicker } from "rand-picker";
import { Model } from "../models";
import { Repository } from "../repositories";
import { filter } from "./EpisodeFilter";
import fixWeight from "./EpisodeWeight";

export default async function f(streamId: string) {
  const streamRepository = new StreamWithHistoryListRepository();
  const stream = await streamRepository.getOneById(streamId);

  if (!stream)
    return null;

  const nextEpisodeId = await calculateNextEpisode(stream);

  return nextEpisodeId;
}

type FuncGeneratorParams = {
  serie: Serie;
  episodes: Model[];
  lastEp: Model | null;
  stream: StreamWithHistoryList;
  historyList: HistoryList;
};
type FuncGenerator = (params: FuncGeneratorParams)=> Promise<Model>;
export async function calculateNextEpisode(streamWithHistoryList: StreamWithHistoryList) {
  const serieRepository = new SerieRepository();
  const episodeRepository = new Repository();

  console.log("Calculating next episode...");
  const groupId: string = streamWithHistoryList.group;
  const serie = await serieRepository.findOneFromGroupId(groupId);

  assertFound(serie, `Cannot get serie from group '${groupId}'`);

  let nextEpisodeFunc: FuncGenerator;

  switch (streamWithHistoryList.mode) {
    case StreamMode.SEQUENTIAL:
      nextEpisodeFunc = getNextEpisodeSequential;
      break;
    case StreamMode.RANDOM:
      nextEpisodeFunc = getNextEpisodeRandom;
      break;
    default:
      neverCase(streamWithHistoryList.mode);
  }

  const historyList = streamWithHistoryListToHistoryList(streamWithHistoryList);

  assertFound(historyList, `Cannot get history list from stream '${streamWithHistoryList.id}'`);
  const lastEp = await episodeRepository.findLastEpisodeInHistoryList(historyList);
  const episodes = await episodeRepository.getManyBySerieId(serie.id);

  return nextEpisodeFunc( {
    serie,
    episodes,
    lastEp,
    stream: streamWithHistoryList,
    historyList,
  } );
}

// eslint-disable-next-line require-await
async function getNextEpisodeSequential( {episodes, lastEp}: FuncGeneratorParams): Promise<Model> {
  let i = 0;

  if (lastEp) {
    i = episodes.findIndex((e) => e.episodeId === lastEp.episodeId) + 1;

    if (i >= episodes.length)
      i = 0;
  }

  return episodes[i];
}

export async function getRandomPicker( {serie, episodes, lastEp, stream, historyList}: FuncGeneratorParams) {
  console.log("Getting random picker...");

  const picker: Picker<Model> = newPicker(episodes, {
    weighted: true,
  } );

  filter(picker, serie, episodes, lastEp, stream, historyList);
  assertPickerHasData(picker);
  await fixWeight(picker, serie, episodes, lastEp, stream, historyList);

  return picker;
}

function assertPickerHasData(picker: Picker<Model>) {
  for (const d of picker.data) {
    if (d)
      return;
  }

  throwErrorPopStack(new Error("Picker has no data"));
}

async function getNextEpisodeRandom( {serie,
  episodes,
  lastEp,
  stream,
  historyList}: FuncGeneratorParams,
): Promise<Model> {
  const picker = await getRandomPicker( {
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
