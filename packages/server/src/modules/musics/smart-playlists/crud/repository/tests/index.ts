import { createMockClass } from "$sharedTests/jest/mocking";
import { MusicSmartPlaylistEntity } from "$shared/models/musics/smart-playlists";
import { Types } from "mongoose";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { MusicSmartPlaylistsRepository } from "..";

export const MUSIC_SMART_PLAYLIST_SAMPLE: MusicSmartPlaylistEntity = {
  id: new Types.ObjectId().toString(),
  visibility: "public",
  ownerUserId: fixtureUsers.Normal.User.id,
  createdAt: new Date(),
  updatedAt: new Date(),
  slug: "slug",
  name: "Name",
  query: "query",
};

class MusicSmartPlaylistsRepositoryMock extends createMockClass(MusicSmartPlaylistsRepository) {
  constructor() {
    super();

    this.getOneById.mockResolvedValue(MUSIC_SMART_PLAYLIST_SAMPLE);
    this.patchOneByIdAndGet.mockResolvedValue(MUSIC_SMART_PLAYLIST_SAMPLE);
    this.createOneAndGet.mockResolvedValue(MUSIC_SMART_PLAYLIST_SAMPLE);
    this.deleteOneByIdAndGet.mockResolvedValue(MUSIC_SMART_PLAYLIST_SAMPLE);
    this.getOneByCriteria.mockResolvedValue(MUSIC_SMART_PLAYLIST_SAMPLE);
    this.getManyByCriteria.mockResolvedValue([
      MUSIC_SMART_PLAYLIST_SAMPLE,
    ]);
  }
}

export function createAndRegisterMusicSmartPlaylistsRepositoryMockClass() {
  registerMockProviderInstance(
    MusicSmartPlaylistsRepository,
    new MusicSmartPlaylistsRepositoryMock(),
  );
}
