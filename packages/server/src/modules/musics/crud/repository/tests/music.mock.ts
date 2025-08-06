import { createMockClass } from "#tests/jest/mocking";
import { MusicsRepository } from "../repository";

class MusicsRepositoryMock extends createMockClass(MusicsRepository) {
}

export const musicsRepoMockProvider = {
  provide: MusicsRepository,
  useClass: MusicsRepositoryMock,
};
