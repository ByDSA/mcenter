import { createMockClass } from "$sharedTests/jest/mocking";
import { EpisodeFileInfosRepository } from "../repository";

class EpisodeFileInfoRepositoryMock extends createMockClass(EpisodeFileInfosRepository) { }

export const episodeFileInfoRepositoryMockProvider = {
  provide: EpisodeFileInfosRepository,
  useClass: EpisodeFileInfoRepositoryMock,
};
