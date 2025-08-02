import { createMockInstance } from "#tests/jest/mocking";
import { EpisodesRepository } from "../repository";

export const episodeRepositoryMockProvider = {
  provide: EpisodesRepository,
  useValue: createMockInstance(EpisodesRepository),
};
