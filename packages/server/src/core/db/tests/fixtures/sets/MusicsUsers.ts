import { MusicsUsersOdm } from "#musics/crud/repositories/user-info/odm";
import { fixtureMusics } from "#musics/tests";

export const loadFixtureMusicsUsersInDisk = async () => {
  const musicsOdm: MusicsUsersOdm.Doc[] = fixtureMusics.UserInfo.List
    .map(MusicsUsersOdm.toDoc);

  await MusicsUsersOdm.Model.insertMany(musicsOdm);
};
