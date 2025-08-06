import { createMockProvider } from "#utils/nestjs/tests";
import { EpisodesRepository } from "../repository";

export const episodeRepositoryMockProvider = createMockProvider(EpisodesRepository);
