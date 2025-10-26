/* eslint-disable require-await */
import { createMockClass } from "$sharedTests/jest/mocking";
import { Provider } from "@nestjs/common";
import { fixtureEpisodes } from "#episodes/tests";
import { EpisodesRepository } from "../repository";

class MockEpisodesRepository extends createMockClass(EpisodesRepository) {
  constructor() {
    super();

    this.getOneById.mockImplementation(async id => {
      return fixtureEpisodes.Simpsons.List.find(e=>e.id === id) ?? null;
    } );

    this.getManyBySerieKey.mockImplementation(
      async key=>key === "simpsons" ? fixtureEpisodes.Simpsons.List : [],
    );
  }
}

export const episodeRepositoryMockProvider = {
  provide: EpisodesRepository,
  useClass: MockEpisodesRepository,
} satisfies Provider;
