/* eslint-disable require-await */
import { createMockClass } from "$sharedTests/jest/mocking";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { fixtureEpisodes } from "#episodes/tests";
import { EpisodeDependenciesRepository } from "../repository";

class EpisodeDependenciesRepositoryMock extends createMockClass(EpisodeDependenciesRepository) {
  constructor() {
    super();

    this.createOne.mockResolvedValue(undefined);

    this.getAll.mockResolvedValue(fixtureEpisodes.Dependencies.List);

    this.getNextByEpisodeId.mockImplementation(async (lastId) => {
      const dep = fixtureEpisodes.Dependencies.List.find(d=>d.lastEpisodeId === lastId);

      return dep ?? null;
    } );

    this.getManyByCriteria.mockResolvedValue(fixtureEpisodes.Dependencies.List);

    this.deleteOneByIdAndGet.mockResolvedValue(fixtureEpisodes.Dependencies.List[0]);
  }
}

registerMockProviderInstance(
  EpisodeDependenciesRepository,
  new EpisodeDependenciesRepositoryMock(),
);
