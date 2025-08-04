import { createMockInstance } from "#tests/jest/mocking";
import { StreamsRepository } from "..";

export const streamsRepositoryMockProvider = {
  provide: StreamsRepository,
  useValue: createMockInstance(StreamsRepository),
};
