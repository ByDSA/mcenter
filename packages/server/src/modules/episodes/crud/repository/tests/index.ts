import { createMockInstance } from "$sharedTests/jest/mocking";
import { EpisodesRepository } from "../repository";

export const episodeRepositoryMockProvider = {
  provide: EpisodesRepository,
  useValue: createMockInstance(EpisodesRepository),
};
