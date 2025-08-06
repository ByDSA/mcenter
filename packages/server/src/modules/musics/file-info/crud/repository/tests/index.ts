import { createMockClass } from "$sharedTests/jest/mocking";
import { MusicFileInfoRepository } from "../repository";

class MusicFileInfoRepositoryMock extends createMockClass(MusicFileInfoRepository) { }

export const musicFileInfoRepositoryMockProvider = {
  provide: MusicFileInfoRepository,
  useClass: MusicFileInfoRepositoryMock,
};
