import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { EpisodeInfoCrudDtos } from "$shared/models/episodes/user-info/dto/transport";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { mockMongoId } from "#tests/mongo";
import { expectControllerFinishRequest, testFailValidation } from "#core/auth/strategies/token/tests";
import { episodeUserInfoEntitySchema } from "#episodes/models";
import { EpisodesUserInfoCrudController } from "./controller";
import { EpisodesUsersRepository } from "./repository";
import { SAMPLE_USER_INFO } from "./repository/tests/repository.globalmock";

describe("episodesUserInfoCrudController", () => {
  let testingSetup: TestingSetup;
  let router: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;
  const validId = mockMongoId;
  const baseUrl = "/";

  async function initMocks() {
    const ret = {
      episodesUserInfoRepo: testingSetup.getMock(EpisodesUsersRepository),
    };

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

    mocks = await initMocks();
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

      expectControllerFinishRequest();

      const data = episodeUserInfoEntitySchema.parse(res.body.data);

      expect(data).toEqual(SAMPLE_USER_INFO);
      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    testFailValidation("id param", {
      request: () => request(router).patch(`${baseUrl}invalidId/user-info`)
        .send(payload),
    } );

    it("should call episodesUserInfoRepo", async () => {
      await request(router).patch(validUrl)
        .send(payload);

      expect(mocks.episodesUserInfoRepo.patchOneByIdAndGet).toHaveBeenCalled();
    } );
  } );
} );
