import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { episodeFileInfoEntitySchema } from "$shared/models/episodes/file-info";
import { EpisodeFileInfoCrudDtos } from "$shared/models/episodes/file-info/dto/transport";
import { EpisodeFileInfosCrudController } from "./controller";
import { EpisodeFileInfoRepository } from "./repository";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { mockMongoId } from "#tests/mongo";
import { expectControllerFinishRequest, testFailValidation, testManyAuth } from "#core/auth/strategies/token/tests";
import { fixtureEpisodes } from "#episodes/tests";

const SAMPLE = fixtureEpisodes.SampleSeries.Episodes.FullSamples.EP1x01.fileInfos[0];

describe("episodeFileInfosCrudController", () => {
  let testingSetup: TestingSetup;
  let router: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;
  const validId = mockMongoId;
  const invalidId = "invalidId";
  const baseUrl = "/";

  async function initMocks() {
    const ret = {
      fileInfoRepo: testingSetup.getMock(EpisodeFileInfoRepository),
    };

    ret.fileInfoRepo.patchOneByIdAndGet.mockResolvedValue(SAMPLE);

    await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        imports: [],
        controllers: [EpisodeFileInfosCrudController],
        providers: [
          getOrCreateMockProvider(EpisodeFileInfoRepository),
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

  describe("patchOneByIdAndGet (PATCH)", () => {
    const validUrl = `${baseUrl}${validId}`;
    const invalidUrl = `${baseUrl}${invalidId}`;
    const payload = {
      entity: {
        path: "new.mp3",
      },
    } satisfies EpisodeFileInfoCrudDtos.Patch.Body;

    beforeEach(async ()=> {
      await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);
    } );

    it("valid request-response", async () => {
      const res = await request(router).patch(validUrl)
        .send(payload);

      expectControllerFinishRequest();

      const data = episodeFileInfoEntitySchema.parse(res.body.data);

      expect(data).toEqual(SAMPLE);
      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("auth", () => {
      testManyAuth( {
        request: ()=>request(router).patch(validUrl)
          .send(payload),
        list: [{
          user: null,
          shouldPass: false,
        },
        {
          user: fixtureUsers.Normal.UserWithRoles,
          shouldPass: false,
        },
        {
          user: fixtureUsers.Admin.UserWithRoles,
          shouldPass: true,
        },
        ],
      } );
    } );

    testFailValidation("id param", {
      request: () => request(router).patch(invalidUrl)
        .send(payload),
    } );

    testFailValidation("payload", {
      request: () => request(router).patch(validUrl)
        .send( {
          invalid: "x",
        } ),
    } );

    it("resource not found", async () => {
      mocks.fileInfoRepo.patchOneByIdAndGet.mockResolvedValueOnce(null as any);

      const res = await request(router).patch(validUrl)
        .send(payload);

      expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    } );

    it("should call repository", async () => {
      await request(router).patch(validUrl)
        .send(payload);

      expect(mocks.fileInfoRepo.patchOneByIdAndGet).toHaveBeenCalled();
    } );
  } );
} );
