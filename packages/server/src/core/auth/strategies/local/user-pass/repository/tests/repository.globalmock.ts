import { createMockClass } from "$sharedTests/jest/mocking";
import { Types } from "mongoose";
import { UserPassEntity } from "$shared/models/auth";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { UserPassesRepository } from "../repository";

const SAMPLE_USER_PASS = {
  id: new Types.ObjectId().toString(),
  userId: fixtureUsers.Normal.User.id,
  username: "testuser",
  passwordHash: "hashed_password",
  createdAt: new Date(),
} satisfies UserPassEntity;

class UserPassesRepositoryMock extends createMockClass(UserPassesRepository) {
  constructor() {
    super();

    this.deleteOneByIdAndGet.mockResolvedValue(SAMPLE_USER_PASS);

    this.getOneById.mockResolvedValue(SAMPLE_USER_PASS);

    this.getOneByUserId.mockResolvedValue(SAMPLE_USER_PASS);

    this.getOneByVerificationToken.mockResolvedValue(SAMPLE_USER_PASS);

    this.getOneByUsername.mockResolvedValue(SAMPLE_USER_PASS);

    this.patchOneByIdAndGet.mockResolvedValue(SAMPLE_USER_PASS);

    this.createOneAndGet.mockImplementation((userPass) => Promise.resolve( {
      ...userPass,
      id: new Types.ObjectId().toString(),
      createdAt: new Date(),
    } ));

    this.deleteOneByUserId.mockResolvedValue(SAMPLE_USER_PASS);
  }
}

registerMockProviderInstance(UserPassesRepository, new UserPassesRepositoryMock());
