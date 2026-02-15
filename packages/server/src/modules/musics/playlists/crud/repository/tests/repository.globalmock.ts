import { createMockClass } from "$sharedTests/jest/mocking";
import { Types } from "mongoose";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { MusicPlaylistEntity } from "$shared/models/musics/playlists";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { fixtureMusics } from "#musics/tests";
import { MusicPlaylistsRepository } from "../repository";

const SAMPLE_MUSIC = fixtureMusics.Musics.Samples.DK;

export const SAMPLE_PLAYLIST = {
  id: new Types.ObjectId().toString(),
  name: "Test Playlist",
  visibility: "public",
  ownerUserId: fixtureUsers.Normal.User.id,
  list: [{
    addedAt: new Date(),
    musicId: SAMPLE_MUSIC.id,
    id: new Types.ObjectId().toString(),
  }],
  createdAt: new Date(),
  updatedAt: new Date(),
  slug: "slug",
} satisfies MusicPlaylistEntity;

class MusicPlaylistsRepositoryMock extends createMockClass(MusicPlaylistsRepository) {
  constructor() {
    super();

    this.getOneByCriteria.mockResolvedValue(SAMPLE_PLAYLIST);
    this.getOneById.mockResolvedValue(SAMPLE_PLAYLIST);
    this.getOneById.mockResolvedValue(SAMPLE_PLAYLIST);
    this.patchOneByIdAndGet.mockResolvedValue(SAMPLE_PLAYLIST);
    this.createOneAndGet.mockResolvedValue(SAMPLE_PLAYLIST);
    this.deleteOneByIdAndGet.mockResolvedValue(SAMPLE_PLAYLIST);
    this.moveMusic.mockResolvedValue(SAMPLE_PLAYLIST);
    this.getOneBySlug.mockResolvedValue(SAMPLE_PLAYLIST);

    // Tracks
    this.addManyTracks.mockResolvedValue(SAMPLE_PLAYLIST);
    this.addOneTrack.mockResolvedValue(SAMPLE_PLAYLIST);
    this.removeManyMusics.mockResolvedValue(SAMPLE_PLAYLIST);
    this.removeManyTracks.mockResolvedValue(SAMPLE_PLAYLIST);
    this.findOneTrackByPosition.mockResolvedValue(
      SAMPLE_MUSIC,
    );
    this.findOneTrackByPosition.mockResolvedValue(SAMPLE_MUSIC);
  }
}

registerMockProviderInstance(MusicPlaylistsRepository, new MusicPlaylistsRepositoryMock());
