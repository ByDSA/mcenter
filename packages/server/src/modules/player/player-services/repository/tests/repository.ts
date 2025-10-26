import { createMockClass } from "$sharedTests/jest/mocking";
import { Provider } from "@nestjs/common";
import { fixturesRemotePlayers } from "#modules/player/tests/fixtures";
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

export const mockRemotePlayersRepositoryProvider: Provider = {
  provide: RemotePlayersRepository,
  useClass: MockRemotePlayersRepository,
};
