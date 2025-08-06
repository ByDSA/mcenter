import { Provider } from "@nestjs/common";
import { createMockInstance } from "$sharedTests/jest/mocking";
import { EpisodeDependenciesRepository } from "../repository";

export const episodeDependenciesRepositoryMockProvider = {
  provide: EpisodeDependenciesRepository,
  useValue: createMockInstance(EpisodeDependenciesRepository),
} satisfies Provider;
