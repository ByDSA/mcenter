import { createMockClass } from "$sharedTests/jest/mocking";
import { Types } from "mongoose";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { EpisodeDependencyEntity } from "#episodes/dependencies/models";
import { EpisodeDependenciesRepository } from "../repository";

const SAMPLE_EPISODE_DEPENDENCY = {
  id: new Types.ObjectId().toString(),
  lastEpisodeId: new Types.ObjectId().toString(),
  nextEpisodeId: new Types.ObjectId().toString(),
} satisfies EpisodeDependencyEntity;

class EpisodeDependenciesRepositoryMock extends createMockClass(EpisodeDependenciesRepository) {
  constructor() {
    super();

    this.createOne.mockResolvedValue(undefined);

    this.getAll.mockResolvedValue([SAMPLE_EPISODE_DEPENDENCY]);

    this.getNextByEpisodeId.mockResolvedValue(SAMPLE_EPISODE_DEPENDENCY);

    this.getManyByCriteria.mockResolvedValue([SAMPLE_EPISODE_DEPENDENCY]);

    this.deleteOneByIdAndGet.mockResolvedValue(SAMPLE_EPISODE_DEPENDENCY);
  }
}

registerMockProviderInstance(
  EpisodeDependenciesRepository,
  new EpisodeDependenciesRepositoryMock(),
);
