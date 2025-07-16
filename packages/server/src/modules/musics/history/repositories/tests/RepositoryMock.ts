import { MusicHistoryRepository } from "../Repository";
import { createMockClass } from "#tests/jest/mocking";

class MusicHistoryRepositoryMock extends createMockClass(MusicHistoryRepository) {
}

export const musicHistoryRepoMockProvider = {
  provide: MusicHistoryRepository,
  useClass: MusicHistoryRepositoryMock,
};
