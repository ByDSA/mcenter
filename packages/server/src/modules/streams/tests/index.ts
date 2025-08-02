import { createMockInstance } from "#tests/jest/mocking";
import { StreamsRepository } from "../repositories";

export const streamsRepositoryMockProvider = {
  provide: StreamsRepository,
  useValue: createMockInstance(StreamsRepository),
};
