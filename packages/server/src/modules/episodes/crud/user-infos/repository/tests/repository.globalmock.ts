/* eslint-disable require-await */
import { createMockClass } from "$sharedTests/jest/mocking";
import { Types } from "mongoose";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { fixtureEpisodes } from "#episodes/tests";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { episodeEntityWithUserInfoSchema, EpisodeUserInfoEntity } from "#episodes/models";
import { EpisodesUsersRepository } from "../repository";

export const SAMPLE_USER_INFO = {
  createdAt: new Date(),
  updatedAt: new Date(),
  episodeId: fixtureEpisodes.SampleSeries.Episodes.Samples.EP1x01.id,
  id: new Types.ObjectId().toString(),
  lastTimePlayed: new Date(0),
  userId: fixtureUsers.Normal.User.id,
  weight: 5,
};

class MockEpisodeUserInfosRepository extends createMockClass(EpisodesUsersRepository) {
  constructor() {
    super();

    this.getOneById.mockImplementation(async (key) => {
      return fixtureEpisodes.Simpsons.UserInfo
        .find(
          (e: { episodeId: string;
userId: string; } )=>e.episodeId === key.episodeId
            && e.userId === key.userId,
        ) ?? null;
    } );

    this.patchOneByIdAndGet.mockResolvedValue(SAMPLE_USER_INFO);

    this.getFullSerieForUser.mockImplementation(async (seriesId, options) => {
      let episodes = fixtureEpisodes.Episodes.List
        .filter(e=> e.seriesId === seriesId);

      episodes = episodes.map(e=>{
        const gotFileInfo = fixtureEpisodes.UserInfo.List.find(
          u=>u.episodeId === e.id && e.userInfo?.userId === options.requestingUserId,
        );
        const userInfo = gotFileInfo ?? {
          id: new Types.ObjectId().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          episodeId: e.id,
          lastTimePlayed: null,
          weight: 0,
          userId: options.requestingUserId,
        } as EpisodeUserInfoEntity;

        return {
          ...e,
          userInfo,
        };
      } );

      return episodeEntityWithUserInfoSchema.array().parse(episodes);
    } );
  }
}

registerMockProviderInstance(EpisodesUsersRepository, new MockEpisodeUserInfosRepository());
