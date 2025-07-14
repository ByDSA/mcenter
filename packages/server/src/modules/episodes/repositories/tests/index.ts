import { createMockClass } from "#tests/jest/mocking";
import { EpisodesRepository } from "../Repository";

class EpisodeRepositoryMock extends createMockClass(EpisodesRepository) { }

export const episodeRepositoryMockProvider = {
  provide: EpisodesRepository,
  useClass: EpisodeRepositoryMock,
};
