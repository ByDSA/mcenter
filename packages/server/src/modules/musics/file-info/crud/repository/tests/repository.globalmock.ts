import { fixtureMusics } from "$sharedSrc/models/musics/tests/fixtures";
import { createMockClass } from "$sharedTests/jest/mocking";
import { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { MusicFileInfoRepository } from "../repository";

class MusicFileInfoRepositoryMock extends createMockClass(MusicFileInfoRepository) {
  constructor() {
    super();

    this.upsertOneByPathAndGet.mockImplementation((path: string) => {
      const musicFileInfos = fixtureMusics.FileInfos.List.find((m) => m.path === path)!;

      return Promise.resolve(musicFileInfos);
    } );

    this.getAllByMusicId.mockImplementation((musicId)=> {
      const musicFileInfos: MusicFileInfoEntity[] = fixtureMusics.FileInfos.List
        .filter((m) => m.musicId === musicId);

      return Promise.resolve(musicFileInfos);
    } );
    this.getOneByHash.mockResolvedValue(fixtureMusics.FileInfos.Samples.DK);
    this.getOneById.mockResolvedValue(fixtureMusics.FileInfos.Samples.DK);
    this.getOneByMusicId.mockResolvedValue(fixtureMusics.FileInfos.Samples.DK);
    this.getOneByPath.mockResolvedValue(fixtureMusics.FileInfos.Samples.DK);
    this.deleteOneById.mockResolvedValue(fixtureMusics.FileInfos.Samples.DK);
  }
}

registerMockProviderInstance(MusicFileInfoRepository, new MusicFileInfoRepositoryMock());
