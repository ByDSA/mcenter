import { EpisodeFileInfoRepository } from "../Repository";
import { createMockClass } from "#tests/jest/mocking";

class EpisodeFileInfoRepositoryMock extends createMockClass(EpisodeFileInfoRepository) { }

export const episodeFileInfoRepositoryMockProvider = {
  provide: EpisodeFileInfoRepository,
  useClass: EpisodeFileInfoRepositoryMock,
};
