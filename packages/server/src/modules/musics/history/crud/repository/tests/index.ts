import { createMockClass } from "$sharedTests/jest/mocking";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { MusicHistoryRepository } from "../repository";

class MusicHistoryRepositoryMock extends createMockClass(MusicHistoryRepository) {
  constructor() {
    super();

    this.getManyByCriteria.mockImplementation(async ()=>await []);
  }
}

export function createAndRegisterMusicHistoryRepositoryMockClass() {
  registerMockProviderInstance(MusicHistoryRepository, new MusicHistoryRepositoryMock());
}
