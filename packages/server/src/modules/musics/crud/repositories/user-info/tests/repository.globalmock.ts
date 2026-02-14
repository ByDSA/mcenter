import { createMockClass } from "$sharedTests/jest/mocking";
import { Types } from "mongoose";
import { MusicUserInfoEntity } from "$shared/models/musics";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { MusicsUsersRepository } from "../repository";

const SAMPLE_MUSIC_USER_INFO = {
  createdAt: new Date(),
  updatedAt: new Date(),
  id: new Types.ObjectId().toString(),
  musicId: new Types.ObjectId().toString(),
  userId: new Types.ObjectId().toString(),
  weight: 5,
  tags: ["test"],
  lastTimePlayed: Date.now(),
} satisfies MusicUserInfoEntity;

class MusicsUsersRepositoryMock extends createMockClass(MusicsUsersRepository) {
  constructor() {
    super();

    this.getOneById.mockResolvedValue(SAMPLE_MUSIC_USER_INFO);

    this.patchOneByIdAndGet.mockResolvedValue( {
      ...SAMPLE_MUSIC_USER_INFO,
      updatedAt: new Date(),
    } );

    this.createOneAndGet.mockImplementation((entity) => Promise.resolve( {
      ...entity,
      id: new Types.ObjectId().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } ));
  }
}

registerMockProviderInstance(MusicsUsersRepository, new MusicsUsersRepositoryMock());
