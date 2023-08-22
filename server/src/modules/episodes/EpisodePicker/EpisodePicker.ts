import { streamWithHistoryListToHistoryList } from "#modules/historyLists";
import HistoryList from "#modules/historyLists/models/HistoryList";
import { SerieWithEpisodes, SerieWithEpisodesRepository } from "#modules/seriesWithEpisodes";
import { StreamMode } from "#modules/streams";
import { StreamWithHistoryList, StreamWithHistoryListRepository } from "#modules/streamsWithHistoryList";
import { throwErrorPopStack } from "#utils/errors";
import { assertFound } from "#utils/http/validation";
import { assertIsDefined, neverCase } from "#utils/validation";
import { Picker, newPicker } from "rand-picker";
import { Episode } from "../models";
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
  serie: SerieWithEpisodes;
  lastEp: Episode | null;
  stream: StreamWithHistoryList;
  historyList: HistoryList;
};
type FuncGenerator = (params: FuncGeneratorParams)=> Promise<Episode>;
export async function calculateNextEpisode(streamWithHistoryList: StreamWithHistoryList) {
  const serieWithEpisodesRepository = new SerieWithEpisodesRepository();
  const episodeRepository = new Repository( {
    serieWithEpisodesRepository,
  } );

  console.log("Calculating next episode...");
  const groupId: string = streamWithHistoryList.group;
  const serie = await serieWithEpisodesRepository.findOneFromGroupId(groupId);

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

  return nextEpisodeFunc( {
    serie,
    lastEp,
    stream: streamWithHistoryList,
    historyList,
  } );
}

// eslint-disable-next-line require-await
async function getNextEpisodeSequential( {serie, lastEp}: FuncGeneratorParams): Promise<Episode> {
  const { episodes } = serie;
  let i = 0;

  if (lastEp) {
    i = episodes.findIndex((e) => e.episodeId === lastEp.episodeId) + 1;

    if (i >= episodes.length)
      i = 0;
  }

  return episodes[i];
}

export async function getRandomPicker( {serie, lastEp, stream, historyList}: FuncGeneratorParams) {
  console.log("Getting random picker...");
  const { episodes } = serie;
  const picker: Picker<Episode> = newPicker(episodes, {
    weighted: true,
  } );

  filter(picker, serie, lastEp, stream, historyList);
  assertPickerHasData(picker);
  await fixWeight(picker, serie, lastEp, stream, historyList);

  return picker;
}

function assertPickerHasData(picker: Picker<Episode>) {
  for (const d of picker.data) {
    if (d)
      return;
  }

  throwErrorPopStack(new Error("Picker has no data"));
}

async function getNextEpisodeRandom( {serie,
  lastEp,
  stream,
  historyList}: FuncGeneratorParams,
): Promise<Episode> {
  const picker = await getRandomPicker( {
    serie,
    lastEp,
    stream,
    historyList,
  } );

  console.log("Picking one ...");
  const ret = picker.pickOne();

  assertIsDefined(ret, "Picker has no data");

  return ret;
}
