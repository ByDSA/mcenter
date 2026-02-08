import { fixtureMusicFileInfos } from "$shared/models/musics/file-info/tests/fixtures";
import { createMockClass } from "$sharedTests/jest/mocking";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { MusicFileInfoRepository } from "../repository";

class MusicFileInfoRepositoryMock extends createMockClass(MusicFileInfoRepository) {
  constructor() {
    super();

    this.upsertOneByPathAndGet.mockImplementation((path: string) => {
      const musicFileInfo = fixtureMusicFileInfos.Disk.List.find((m) => m.path === path)!;

      return Promise.resolve(musicFileInfo);
    } );
  }
}

export function registerMusicFileInfoRepositoryMockClass() {
  registerMockProviderInstance(MusicFileInfoRepository, new MusicFileInfoRepositoryMock());
}
