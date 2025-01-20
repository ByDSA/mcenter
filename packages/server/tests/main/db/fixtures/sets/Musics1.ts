import { MusicDocOdm, MusicModelOdm } from "#modules/musics";
import { musicModelToDocOdm } from "#modules/musics/repositories/adapters";
import { Music } from "#shared/models/musics";
import { MUSICS_WITH_TAGS_SAMPLES } from "../models/music";

// eslint-disable-next-line require-await
export default async () => {
  const musicsOdm: MusicDocOdm[] = MUSICS_WITH_TAGS_SAMPLES.map((music: Music) => musicModelToDocOdm(music));

  await MusicModelOdm.insertMany(musicsOdm);
};