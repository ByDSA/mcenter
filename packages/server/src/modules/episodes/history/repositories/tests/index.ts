import { Provider } from "@nestjs/common";
import { createMockInstance } from "#tests/jest/mocking";
import { EpisodeHistoryEntriesRepository } from "../repository";
import { LastTimePlayedService } from "../../last-time-played.service";

const episodeHistoryEntriesRepositoryMock = createMockInstance(EpisodeHistoryEntriesRepository);

export const episodeHistoryEntriesRepositoryMockProvider = {
  provide: EpisodeHistoryEntriesRepository,
  useValue: episodeHistoryEntriesRepositoryMock,
} satisfies Provider;

const lastTimePlayedServiceMock = createMockInstance(LastTimePlayedService);

export const lastTimePlayedServiceMockProvider = {
  provide: LastTimePlayedService,
  useValue: lastTimePlayedServiceMock,
} satisfies Provider;
