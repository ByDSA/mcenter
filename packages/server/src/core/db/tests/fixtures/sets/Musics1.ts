import { MusicOdm } from "#musics/crud/repository/odm";
import { Music } from "#musics/models";
import { fixtureMusics } from "#musics/tests";

export const loadFixtureMusicsInDisk = async () => {
  const musicsOdm: MusicOdm.Doc[] = fixtureMusics.Disk.List
    .map((music: Music) => MusicOdm.toDoc(music));

  await MusicOdm.Model.insertMany(musicsOdm);
};
