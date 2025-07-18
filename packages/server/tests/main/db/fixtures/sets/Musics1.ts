import { MusicDocOdm, MusicModelOdm } from "#musics/index";
import { Music } from "#musics/models";
import { musicToDocOdm } from "#musics/repositories/adapters";
import { MUSICS_WITH_TAGS_SAMPLES } from "../models/music";

export const loadFixtureMusicsWithTags = async () => {
  const musicsOdm: MusicDocOdm[] = MUSICS_WITH_TAGS_SAMPLES
    .map((music: Music) => musicToDocOdm(music));

  await MusicModelOdm.insertMany(musicsOdm);
};
