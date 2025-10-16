import { MusicOdm } from "#musics/crud/repositories/music/odm";
import { MusicEntity } from "#musics/models";
import { fixtureMusics } from "#musics/tests";

export const loadFixtureMusicsInDisk = async () => {
  const musicsOdm: MusicOdm.Doc[] = fixtureMusics.Disk.List
    .map((music: MusicEntity) => MusicOdm.toFullDoc(music));

  await MusicOdm.Model.insertMany(musicsOdm);
};
