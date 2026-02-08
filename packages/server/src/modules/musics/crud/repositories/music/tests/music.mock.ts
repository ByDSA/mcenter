import { createMockClass } from "$sharedTests/jest/mocking";
import { fixtureMusicFileInfos } from "$shared/models/musics/file-info/tests/fixtures";
import { assertIsDefined } from "$shared/utils/validation";
import { fixtureMusics } from "#musics/tests";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { MusicsRepository } from "../repository";

class MusicsRepositoryMock extends createMockClass(MusicsRepository) {
  constructor() {
    super();
    // eslint-disable-next-line require-await
    this.getAll.mockImplementation(async (props)=> {
      if (props?.criteria?.expand?.includes("userInfo"))
        return fixtureMusics.Disk.WithUserInfo.List;

      return fixtureMusics.Disk.List;
    } );

    // eslint-disable-next-line require-await
    this.getManyByQuery.mockImplementation(async (_params, props) => {
      if (props?.criteria?.expand?.includes("userInfo"))
        return fixtureMusics.Disk.WithUserInfo.List;

      return fixtureMusics.Disk.List;
    } );

    this.createOneFromPath.mockImplementation((path: string) => {
      const musicFileInfo = fixtureMusicFileInfos.Disk.List.find((m) => m.path === path)!;
      const music = fixtureMusics.Disk.List.find(m => m.id === musicFileInfo.musicId);

      assertIsDefined(music);

      return Promise.resolve( {
        music: {
          ...music,
          id: "id",
        },
        fileInfo: musicFileInfo,
      } );
    } );
  }
}

export function createAndRegisterMusicRepositoryMockClass() {
  registerMockProviderInstance(MusicsRepository, new MusicsRepositoryMock());
}
