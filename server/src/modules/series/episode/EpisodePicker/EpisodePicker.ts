/* eslint-disable require-await */
import { SerieRepository, SerieWithEpisodes } from "#modules/series/serie";
import { Stream, StreamMode, StreamRepository } from "#modules/stream";
import { assertFound } from "#modules/utils/base/http/asserts";
import { assertIsDefined } from "#modules/utils/built-in-types/errors";
import { neverCase } from "#modules/utils/built-in-types/never";
import { throwErrorPopStack } from "#modules/utils/others";
import { Picker, newPicker } from "rand-picker";
import { Episode, EpisodeRepository } from "../model";
import { filter } from "./EpisodeFilter";
import fixWeight from "./EpisodeWeight";

export default async function f(streamId: string) {
  const serieRepository = new SerieRepository();
  const streamRepository = new StreamRepository( {
    serieRepository,
  } );
  const stream = await streamRepository.findOneByIdOrCreateFromSerie(streamId);

  if (!stream)
    return null;

  //   const lastEp = await getlastEp(stream);
  //   console.log(`current: ${lastEp}`);
  //   console.log(`stream: ${stream}`);
  const nextEpisodeId = await calculateNextEpisode(stream);

  //   console.log(`next: ${nextEpisodeId}`);

  return nextEpisodeId;
}

type FuncGenerator = (serie: SerieWithEpisodes, lastEp: Episode | null, stream: Stream)=> Promise<Episode>;
export async function calculateNextEpisode(stream: Stream) {
  const serieRepository = new SerieRepository();
  const episodeRepository = new EpisodeRepository( {
    serieRepository,
  } );

  console.log("Calculating next episode...");
  const groupId: string = stream.group;
  const serie = await serieRepository.findOneFromGroupId(groupId);

  assertFound(serie, `Cannot get serie from group '${groupId}'`);

  let nextEpisodeFunc: FuncGenerator;

  switch (stream.mode) {
    case StreamMode.SEQUENTIAL:
      nextEpisodeFunc = getNextEpisodeSequential;
      break;
    case StreamMode.RANDOM:
      nextEpisodeFunc = getNextEpisodeRandom;
      break;
    default:
      neverCase(stream.mode);
  }

  const lastEp = await episodeRepository.findLastEpisodeInStream(stream);

  return nextEpisodeFunc(serie, lastEp, stream);
}

async function getNextEpisodeSequential(serie: SerieWithEpisodes, lastEp: Episode | null): Promise<Episode> {
  const { episodes } = serie;
  let i = 0;

  if (lastEp) {
    i = episodes.findIndex((e) => e.innerId === lastEp.innerId) + 1;

    if (i >= episodes.length)
      i = 0;
  }

  return episodes[i];
}

export async function getRandomPicker(serie: SerieWithEpisodes, lastEp: Episode | null, stream: Stream) {
  console.log("Getting random picker...");
  const { episodes } = serie;
  const picker: Picker<Episode> = newPicker(episodes, {
    weighted: true,
  } );

  filter(picker, serie, lastEp, stream);
  assertPickerHasData(picker);
  await fixWeight(picker, serie, lastEp, stream);

  return picker;
}

function assertPickerHasData(picker: Picker<Episode>) {
  for (const d of picker.data) {
    if (d)
      return;
  }

  throwErrorPopStack(new Error("Picker has no data"));
}

async function getNextEpisodeRandom(
  serie: SerieWithEpisodes,
  lastEp: Episode | null,
  stream: Stream,
): Promise<Episode> {
  const picker = await getRandomPicker(serie, lastEp, stream);

  console.log("Picking one ...");
  const ret = picker.pickOne();

  assertIsDefined(ret, "Picker has no data");

  return ret;
}
