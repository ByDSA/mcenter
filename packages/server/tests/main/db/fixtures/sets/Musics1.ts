import { MusicOdm } from "#musics/repositories/odm";
import { Music } from "#musics/models";
import { fixtureMusics } from "#musics/tests/fixtures";

export const loadFixtureMusicsInDisk = async () => {
  const musicsOdm: MusicOdm.Doc[] = fixtureMusics.Disk.List
    .map((music: Music) => MusicOdm.toDocOdm(music));

  await MusicOdm.Model.insertMany(musicsOdm);
};
