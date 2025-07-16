import { EpisodesRepository } from "../repository";
import { createMockInstance } from "#tests/jest/mocking";

export const episodeRepositoryMockProvider = {
  provide: EpisodesRepository,
  useValue: createMockInstance(EpisodesRepository),
};
