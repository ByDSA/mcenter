import { MusicRepository } from "#musics/index";
import { createMockClass } from "#tests/jest/mocking";

class MusicRepositoryMock extends createMockClass(MusicRepository) {
}

export const musicRepoMockProvider = {
  provide: MusicRepository,
  useClass: MusicRepositoryMock,
};
