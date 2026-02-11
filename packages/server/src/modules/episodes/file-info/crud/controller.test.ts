import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { episodeFileInfoEntitySchema } from "$shared/models/episodes/file-info";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { mockMongoId } from "#tests/mongo";
import { expectControllerCalled, expectControllerNotCalled } from "#core/auth/strategies/token/tests";
import { fixtureEpisodeFileInfos } from "#episodes/file-info/tests";
import { EpisodeFileInfosCrudController } from "./controller";
import { EpisodeFileInfoRepository } from "./repository";
import { EpisodeFileInfoCrudDtos } from "$shared/models/episodes/file-info/dto/transport";

const SAMPLE = fixtureEpisodeFileInfos.SampleSeries.Samples.EP1x01;

describe("episodeFileInfosCrudController", () => {
  let testingSetup: TestingSetup;
  let router: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;
  const validId = mockMongoId;
  const invalidId = "invalidId";
  const baseUrl = "/";

  async function initMocks(setup: TestingSetup) {
    const ret = {
      fileInfoRepo: setup.getMock(EpisodeFileInfoRepository),
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

    mocks = await initMocks(testingSetup);
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
      }
    } satisfies EpisodeFileInfoCrudDtos.Patch.Body;

    beforeEach(async()=> {
      testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);
    })

    it("valid request-response", async () => {
      const res = await request(router).patch(validUrl)
        .send(payload);

        expectControllerCalled(testingSetup);

        const data = episodeFileInfoEntitySchema.parse(res.body.data);

        expect(data).toEqual(SAMPLE);
        expect(res.statusCode).toBe(HttpStatus.OK);
      } );

      it(`normal user should not request`, async () => {
        testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);
        const res = await request(router).patch(validUrl)
        .send(payload);
        expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it("invalid id", async () => {
      const res = await request(router).patch(invalidUrl)
        .send(payload);

      expectControllerNotCalled(testingSetup);

      expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    } );

    it("invalid payload", async () => {
      const res = await request(router).patch(validUrl)
        .send( {
          invalid: "x",
        } );

      expectControllerNotCalled(testingSetup);

      expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
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
