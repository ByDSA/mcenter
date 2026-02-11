import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { EpisodeInfoCrudDtos } from "$shared/models/episodes/user-info/dto/transport";
import { Types } from "mongoose";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { mockMongoId } from "#tests/mongo";
import { expectControllerCalled, expectControllerNotCalled } from "#core/auth/strategies/token/tests";
import { fixtureEpisodes } from "#episodes/tests";
import { episodeUserInfoEntitySchema } from "#episodes/models";
import { EpisodesUserInfoCrudController } from "./controller";
import { EpisodesUsersRepository } from "./repository";

const SAMPLE_USER_INFO = {
  createdAt: new Date(),
  updatedAt: new Date(),
  episodeId: fixtureEpisodes.SampleSeries.Samples.EP1x01.id,
  id: new Types.ObjectId().toString(),
  lastTimePlayed: new Date(0),
  userId: fixtureUsers.Normal.User.id,
  weight: 5,

};

describe("EpisodesUserInfoCrudController", () => {
  let testingSetup: TestingSetup;
  let router: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;
  const validId = mockMongoId;
  const baseUrl = "/";

  async function initMocks(setup: TestingSetup) {
    const ret = {
      episodesUserInfoRepo: setup.getMock(EpisodesUsersRepository),
    };

    ret.episodesUserInfoRepo.patchOneByIdAndGet.mockResolvedValue(SAMPLE_USER_INFO);

    await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        imports: [],
        controllers: [EpisodesUserInfoCrudController],
        providers: [
          getOrCreateMockProvider(EpisodesUsersRepository),
        ],
      },
      {
        auth: {
          repositories: "mock",
          cookies: "mock",
        },
      },
    );

    router = testingSetup.routerApp;

    mocks = await initMocks(testingSetup);
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  describe("patchOneUserInfoByKeyAndGet (PATCH /:id/user-info)", () => {
    const validUrl = `${baseUrl}${validId}/user-info`;
    const payload = {
      entity: {
        weight: 5,
      },
    } satisfies EpisodeInfoCrudDtos.Patch.Body;

    beforeEach(async ()=> {
      await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);
    } );

    it("valid request-response", async () => {
      const res = await request(router)
        .patch(validUrl)
        .send(payload);

      expectControllerCalled(testingSetup);

      const data = episodeUserInfoEntitySchema.parse(res.body.data);

      expect(data).toEqual(SAMPLE_USER_INFO);
      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    it("invalid id", async () => {
      const res = await request(router).patch(`${baseUrl}invalidId/user-info`)
        .send(payload);

      expectControllerNotCalled(testingSetup);

      expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    } );

    it("should call episodesUserInfoRepo", async () => {
      await request(router).patch(validUrl)
        .send(payload);

      expect(mocks.episodesUserInfoRepo.patchOneByIdAndGet).toHaveBeenCalled();
    } );
  } );
} );
