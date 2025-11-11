/* eslint-disable require-await */
import { createMockClass } from "$sharedTests/jest/mocking";
import { Provider } from "@nestjs/common";
import { fixtureEpisodes } from "#episodes/tests";
import { EpisodesUsersRepository } from "../repository";

class MockEpisodeUserInfosRepository extends createMockClass(EpisodesUsersRepository) {
  constructor() {
    super();

    this.getOneById.mockImplementation(async (key) => {
      return fixtureEpisodes.Simpsons.ListForUser.NormalUser
        .find(e=>e.id === key.episodeId && e.userInfo.userId === key.userId)?.userInfo ?? null;
    } );
  }
}

export const episodeUserInfosRepositoryMockProvider = {
  provide: EpisodesUsersRepository,
  useClass: MockEpisodeUserInfosRepository,
} satisfies Provider;
