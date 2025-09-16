import { createMockClass } from "$sharedTests/jest/mocking";
import { MusicPlaylistsRepository } from "../repository";

class MusicsRepositoryMock extends createMockClass(MusicPlaylistsRepository) {
}

export const musicsRepoMockProvider = {
  provide: MusicPlaylistsRepository,
  useClass: MusicsRepositoryMock,
};
