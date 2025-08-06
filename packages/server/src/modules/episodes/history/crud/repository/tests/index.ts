import { Provider } from "@nestjs/common";
import { createMockInstance } from "$sharedTests/jest/mocking";
import { EpisodeHistoryRepository } from "../repository";
import { LastTimePlayedService } from "../../../last-time-played.service";

const episodeHistoryRepositoryMock = createMockInstance(EpisodeHistoryRepository);

export const episodeHistoryRepositoryMockProvider = {
  provide: EpisodeHistoryRepository,
  useValue: episodeHistoryRepositoryMock,
} satisfies Provider;

const lastTimePlayedServiceMock = createMockInstance(LastTimePlayedService);

export const lastTimePlayedServiceMockProvider = {
  provide: LastTimePlayedService,
  useValue: lastTimePlayedServiceMock,
} satisfies Provider;
