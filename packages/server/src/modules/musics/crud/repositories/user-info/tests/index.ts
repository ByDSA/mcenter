import { createMockClass } from "$sharedTests/jest/mocking";
import { Provider } from "@nestjs/common";
import { MusicsUsersRepository } from "../repository";

class MusicsUsersRepositoryMock extends createMockClass(MusicsUsersRepository) {
  constructor() {
    super();
  }
}

export const musicsUsersRepoMockProvider = {
  provide: MusicsUsersRepository,
  useClass: MusicsUsersRepositoryMock,
} satisfies Provider;
