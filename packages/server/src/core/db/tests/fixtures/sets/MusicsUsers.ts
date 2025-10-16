import { MusicsUsersOdm } from "#musics/crud/repositories/user-info/odm";
import { MusicEntityWithUserInfo } from "#musics/models";
import { fixtureMusics } from "#musics/tests";

export const loadFixtureMusicsUsersInDisk = async () => {
  const musicsOdm: MusicsUsersOdm.Doc[] = fixtureMusics.Disk.WithUserInfo.List
    .map((music: MusicEntityWithUserInfo) => MusicsUsersOdm.toDoc(music.userInfo));

  await MusicsUsersOdm.Model.insertMany(musicsOdm);
};
