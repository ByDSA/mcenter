import { createMockClass } from "#tests/jest/mocking";
import { EpisodeFileInfoRepository } from "../Repository";

class EpisodeFileInfoRepositoryMock extends createMockClass(EpisodeFileInfoRepository) { }

export const episodeFileInfoRepositoryMockProvider = {
  provide: EpisodeFileInfoRepository,
  useClass: EpisodeFileInfoRepositoryMock,
};
