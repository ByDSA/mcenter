import { createMockClass } from "$sharedTests/jest/mocking";
import { Types } from "mongoose";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { MusicUserListEntity } from "$shared/models/musics/users-lists";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { MusicUsersListsRepository } from "../repository";
import { MUSIC_SMART_PLAYLIST_SAMPLE } from "$shared/models/musics/smart-playlists/tests/fixtures";

export const MUSIC_USER_LIST_SAMPLE: MusicUserListEntity = {
  id: new Types.ObjectId().toString(),
  list: [{
    id: new Types.ObjectId().toString(),
    type: "smart-playlist",
    resourceId: MUSIC_SMART_PLAYLIST_SAMPLE.id,
  }],
  ownerUserId: fixtureUsers.Normal.User.id,
};

class MusicUsersListsRepositoryMock extends createMockClass(
  MusicUsersListsRepository,
) {
  constructor() {
    super();

    this.getOneByUserId.mockResolvedValue(MUSIC_USER_LIST_SAMPLE);
    this.patchOneByUserIdAndGet.mockResolvedValue(MUSIC_USER_LIST_SAMPLE);
    this.getAllResourcesSorted.mockResolvedValue(MUSIC_USER_LIST_SAMPLE);
    this.moveOneList.mockResolvedValue(MUSIC_USER_LIST_SAMPLE);
  }
}

registerMockProviderInstance(
  MusicUsersListsRepository,
  new MusicUsersListsRepositoryMock(),
);
