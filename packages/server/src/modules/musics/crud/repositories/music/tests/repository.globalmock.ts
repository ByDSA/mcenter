import { createMockClass } from "$sharedTests/jest/mocking";
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
        return fixtureMusics.Musics.FullList;

      return fixtureMusics.Musics.List;
    } );

    // eslint-disable-next-line require-await
    this.getManyByQuery.mockImplementation(async (_params, props) => {
      if (props?.criteria?.expand?.includes("userInfo"))
        return fixtureMusics.Musics.FullList;

      return fixtureMusics.Musics.List;
    } );

    this.createOneFromPath.mockImplementation((path: string) => {
      const musicFileInfo = fixtureMusics.FileInfos.List.find((m) => m.path === path)!;
      const music = fixtureMusics.Musics.List.find(m => m.id === musicFileInfo.musicId);

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

registerMockProviderInstance(MusicsRepository, new MusicsRepositoryMock());
