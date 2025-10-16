import { createMockClass } from "$sharedTests/jest/mocking";
import { Provider } from "@nestjs/common";
import { RemotePlayersRepository } from "../repository";

export class MockRemotePlayersRepository extends createMockClass(RemotePlayersRepository) {
  constructor() {
    super();
    this.getAllViewersOf
      .mockResolvedValue([]);
  }
}

export const mockRemotePlayersRepositoryProvider: Provider = {
  provide: RemotePlayersRepository,
  useClass: MockRemotePlayersRepository,
};
