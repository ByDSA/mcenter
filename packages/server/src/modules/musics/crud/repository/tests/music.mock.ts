import { createMockClass } from "#tests/jest/mocking";
import { MusicsRepository } from "../repository";

class MusicRepositoryMock extends createMockClass(MusicsRepository) {
}

export const musicRepoMockProvider = {
  provide: MusicsRepository,
  useClass: MusicRepositoryMock,
};
