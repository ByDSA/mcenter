import { fixtureMusicFileInfos } from "$shared/models/musics/file-info/tests/fixtures";
import { createMockClass } from "$sharedTests/jest/mocking";
import { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { MusicFileInfoRepository } from "../repository";

class MusicFileInfoRepositoryMock extends createMockClass(MusicFileInfoRepository) {
  constructor() {
    super();

    this.upsertOneByPathAndGet.mockImplementation((path: string) => {
      const musicFileInfos = fixtureMusicFileInfos.Disk.List.find((m) => m.path === path)!;

      return Promise.resolve(musicFileInfos);
    } );

    this.getAllByMusicId.mockImplementation((musicId)=> {
      const musicFileInfos: MusicFileInfoEntity[] = fixtureMusicFileInfos.Disk.List
        .filter((m) => m.musicId === musicId);

      return Promise.resolve(musicFileInfos);
    } );
    this.getOneByHash.mockResolvedValue(fixtureMusicFileInfos.Disk.Samples.DK);
    this.getOneById.mockResolvedValue(fixtureMusicFileInfos.Disk.Samples.DK);
    this.getOneByMusicId.mockResolvedValue(fixtureMusicFileInfos.Disk.Samples.DK);
    this.getOneByPath.mockResolvedValue(fixtureMusicFileInfos.Disk.Samples.DK);
    this.deleteOneById.mockResolvedValue(fixtureMusicFileInfos.Disk.Samples.DK);
  }
}

export function createAndRegisterMusicFileInfoRepositoryMockClass() {
  registerMockProviderInstance(MusicFileInfoRepository, new MusicFileInfoRepositoryMock());
}
