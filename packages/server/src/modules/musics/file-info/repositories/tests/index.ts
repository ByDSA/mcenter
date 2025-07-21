import { createMockClass } from "#tests/jest/mocking";
import { MusicFileInfoRepository } from "../repository";

class MusicFileInfoRepositoryMock extends createMockClass(MusicFileInfoRepository) { }

export const musicFileInfoRepositoryMockProvider = {
  provide: MusicFileInfoRepository,
  useClass: MusicFileInfoRepositoryMock,
};
