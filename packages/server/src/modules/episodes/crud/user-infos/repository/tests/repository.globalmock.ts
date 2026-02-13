/* eslint-disable require-await */
import { createMockClass } from "$sharedTests/jest/mocking";
import { Types } from "mongoose";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { fixtureEpisodes } from "#episodes/tests";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { EpisodesUsersRepository } from "../repository";

export const SAMPLE_USER_INFO = {
  createdAt: new Date(),
  updatedAt: new Date(),
  episodeId: fixtureEpisodes.SampleSeries.Samples.EP1x01.id,
  id: new Types.ObjectId().toString(),
  lastTimePlayed: new Date(0),
  userId: fixtureUsers.Normal.User.id,
  weight: 5,
};

class MockEpisodeUserInfosRepository extends createMockClass(EpisodesUsersRepository) {
  constructor() {
    super();

    this.getOneById.mockImplementation(async (key) => {
      return fixtureEpisodes.Simpsons.ListForUser.NormalUser
        .find(e=>e.id === key.episodeId && e.userInfo.userId === key.userId)?.userInfo ?? null;
    } );

    this.patchOneByIdAndGet.mockResolvedValue(SAMPLE_USER_INFO);
  }
}

registerMockProviderInstance(EpisodesUsersRepository, new MockEpisodeUserInfosRepository());
