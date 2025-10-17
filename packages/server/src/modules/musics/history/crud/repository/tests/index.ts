import { createMockClass } from "$sharedTests/jest/mocking";
import { MusicHistoryRepository } from "../repository";

class MusicHistoryRepositoryMock extends createMockClass(MusicHistoryRepository) {
  constructor() {
    super();

    this.getManyByCriteria.mockImplementation(async ()=>await []);
  }
}

export const musicHistoryRepoMockProvider = {
  provide: MusicHistoryRepository,
  useClass: MusicHistoryRepositoryMock,
};
