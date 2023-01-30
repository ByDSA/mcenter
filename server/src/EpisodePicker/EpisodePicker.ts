/* eslint-disable require-await */
/* eslint-disable import/no-cycle */
import { newPicker, Picker } from "rand-picker";
import { getlastEp } from "../actions/playStream";
import { Episode } from "../db/models/episode";
import { getFromGroupId, Serie } from "../db/models/serie.model";
import { getById, Mode, Stream } from "../db/models/stream.model";
import { filter } from "./EpisodeFilter";
import fixWeight from "./EpisodeWeight";

export default async function f(streamId: string) {
  const stream = await getById(streamId);

  if (!stream)
    return null;

  //   const lastEp = await getlastEp(stream);
  //   console.log(`current: ${lastEp}`);
  //   console.log(`stream: ${stream}`);
  const nextEpisodeId = await calculateNextEpisode(stream);

  //   console.log(`next: ${nextEpisodeId}`);

  return nextEpisodeId;
}

type FuncGenerator = (serie: Serie, lastEp: Episode | null, stream: Stream)=> Promise<Episode>;
export async function calculateNextEpisode(stream: Stream) {
  console.log("Calculating next episode...");
  const groupId: string = stream.group;
  const serie = await getFromGroupId(groupId);

  if (!serie)
    throw new Error(`Cannot get serie frop group '${groupId}'`);

  let nextEpisodeFunc: FuncGenerator;

  switch (stream.mode) {
    case Mode.SEQUENTIAL:
      nextEpisodeFunc = getNextEpisodeSequential;
      break;
    case Mode.RANDOM:
      nextEpisodeFunc = getNextEpisodeRandom;
      break;
    default:
      throw new Error(`Mode invalid: ${stream.mode}.`);
  }

  const lastEp = await getlastEp(stream);

  return nextEpisodeFunc(serie, lastEp, stream);
}

async function getNextEpisodeSequential(serie: Serie, lastEp: Episode | null): Promise<Episode> {
  const { episodes } = serie;
  let i = 0;

  if (lastEp) {
    i = episodes.findIndex((e) => e.id === lastEp.id) + 1;

    if (i >= episodes.length)
      i = 0;
  }

  return episodes[i];
}

export async function getRandomPicker(serie: Serie, lastEp: Episode | null, stream: Stream) {
  console.log("Getting random picker...");
  const { episodes } = serie;
  const picker = newPicker(episodes, {
    weighted: true,
  } );

  await filter(picker, serie, lastEp, stream);
  await fixWeight(picker, serie, lastEp, stream);

  return picker;
}

async function getNextEpisodeRandom(
  serie: Serie,
  lastEp: Episode | null,
  stream: Stream,
): Promise<Episode> {
  const picker = await getRandomPicker(serie, lastEp, stream);
  const ret = picker.pickOne();

  if (!ret)
    throw new Error();

  return ret;
}

export type Params = {
    picker: Picker<Episode>;
    self: Episode;
    serie: Serie;
    lastEp: Episode | null; stream: Stream;
};
