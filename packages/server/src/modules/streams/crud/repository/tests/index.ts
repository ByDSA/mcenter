import { createMockInstance } from "$sharedTests/jest/mocking";
import { StreamsRepository } from "..";

export const streamsRepositoryMockProvider = {
  provide: StreamsRepository,
  useValue: createMockInstance(StreamsRepository),
};
