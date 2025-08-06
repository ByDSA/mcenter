import { createMockClass } from "$sharedTests/jest/mocking";
import { MusicHistoryRepository } from "../repository";

class MusicHistoryRepositoryMock extends createMockClass(MusicHistoryRepository) {
}

export const musicHistoryRepoMockProvider = {
  provide: MusicHistoryRepository,
  useClass: MusicHistoryRepositoryMock,
};
