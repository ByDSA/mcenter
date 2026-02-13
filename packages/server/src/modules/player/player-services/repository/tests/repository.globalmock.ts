import { createMockClass } from "$sharedTests/jest/mocking";
import { fixturesRemotePlayers } from "#modules/player/tests/fixtures";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { RemotePlayersRepository } from "../repository";

export class MockRemotePlayersRepository extends createMockClass(RemotePlayersRepository) {
  constructor() {
    super();
    this.getAllViewersOf
      .mockResolvedValue([]);

    this.getOneById.mockImplementation(
      // eslint-disable-next-line require-await
      async id=>id === fixturesRemotePlayers.valid.id ? fixturesRemotePlayers.valid : null,
    );
  }
}

registerMockProviderInstance(RemotePlayersRepository, new MockRemotePlayersRepository());
