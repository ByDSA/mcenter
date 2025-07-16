import { Provider } from "@nestjs/common";
import { createMockInstance } from "#tests/jest/mocking";
import { EpisodeHistoryEntriesRepository } from "../repository";
import { LastTimePlayedService } from "../../last-time-played.service";

const episodeHistoryEntriesRepositoryMock = createMockInstance(EpisodeHistoryEntriesRepository);

export const episodeHistoryEntriesRepositoryMockProvider: Provider = {
  provide: EpisodeHistoryEntriesRepository,
  useValue: episodeHistoryEntriesRepositoryMock,
};

const lastTimePlayedServiceMock = createMockInstance(LastTimePlayedService);

export const lastTimePlayedServiceMockProvider: Provider = {
  provide: LastTimePlayedService,
  useValue: lastTimePlayedServiceMock,
};
