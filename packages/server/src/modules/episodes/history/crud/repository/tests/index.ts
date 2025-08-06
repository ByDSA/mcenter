import { createMockProvider } from "#utils/nestjs/tests";
import { EpisodeHistoryRepository } from "../repository";
import { LastTimePlayedService } from "../../../last-time-played.service";

export const episodeHistoryRepositoryMockProvider = createMockProvider(EpisodeHistoryRepository);

export const lastTimePlayedServiceMockProvider = createMockProvider(LastTimePlayedService);
