import { createMockClass } from "$sharedTests/jest/mocking";
import { Types } from "mongoose";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { UsersRepository } from "../repository";

const SAMPLE_USER = fixtureUsers.Normal.User;

class UsersRepositoryMock extends createMockClass(UsersRepository) {
  constructor() {
    super();

    this.deleteOneByIdAndGet.mockResolvedValue(SAMPLE_USER);

    this.getOneById.mockResolvedValue(SAMPLE_USER);

    this.isPublicUsernameAvailable.mockResolvedValue(true);

    this.getOneByEmail.mockResolvedValue(SAMPLE_USER);

    this.patchOneByIdAndGet.mockResolvedValue( {
      ...SAMPLE_USER,
      updatedAt: new Date(),
    } );

    this.getOne.mockResolvedValue(SAMPLE_USER);

    this.getAll.mockResolvedValue([SAMPLE_USER]);

    this.createOneAndGet.mockImplementation((user) => Promise.resolve( {
      ...user,
      id: new Types.ObjectId().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } ));

    this.deleteOneByPath.mockResolvedValue(SAMPLE_USER);
  }
}

registerMockProviderInstance(UsersRepository, new UsersRepositoryMock());
