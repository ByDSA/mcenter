import { createMockClass } from "$sharedTests/jest/mocking";
import { fixtureMusics } from "#musics/tests";
import { MusicsRepository } from "../repository";

class MusicsRepositoryMock extends createMockClass(MusicsRepository) {
  constructor() {
    super();
    // eslint-disable-next-line require-await
    this.getAll.mockImplementation(async (_, criteria)=> {
      if (criteria?.expand?.includes("userInfo"))
        return fixtureMusics.Disk.WithUserInfo.List;

      return fixtureMusics.Disk.List;
    } );

    // eslint-disable-next-line require-await
    this.getManyByQuery.mockImplementation(async (_userId, _params, criteria) => {
      if (criteria?.expand?.includes("userInfo"))
        return fixtureMusics.Disk.WithUserInfo.List;

      return fixtureMusics.Disk.List;
    } );
  }
}

export const musicsRepoMockProvider = {
  provide: MusicsRepository,
  useClass: MusicsRepositoryMock,
};
