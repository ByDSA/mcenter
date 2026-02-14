import { createMockClass } from "$sharedTests/jest/mocking";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { UsersMusicPlaylistsRepository } from "../repository";

const SAMPLE_USER = fixtureUsers.Normal.UserWithRoles;

class UsersMusicPlaylistsRepositoryMock extends createMockClass(UsersMusicPlaylistsRepository) {
  constructor() {
    super();

    this.setMusicPlaylistFavorite.mockResolvedValue(SAMPLE_USER);
  }
}

registerMockProviderInstance(
  UsersMusicPlaylistsRepository,
  new UsersMusicPlaylistsRepositoryMock(),
);
