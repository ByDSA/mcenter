import { createMockClass } from "#tests/jest/mocking";
import { MusicRepository } from "../repository";

class MusicRepositoryMock extends createMockClass(MusicRepository) {
}

export const musicRepoMockProvider = {
  provide: MusicRepository,
  useClass: MusicRepositoryMock,
};
