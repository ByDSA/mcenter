import { createMockProvider } from "#utils/nestjs/tests";
import { EpisodeDependenciesRepository } from "../repository";

export const episodeDependenciesRepositoryMockProvider = createMockProvider(
  EpisodeDependenciesRepository,
);
