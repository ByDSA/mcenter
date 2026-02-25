import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { movieFileInfoEntitySchema } from "$shared/models/movies/file-info";
import { MovieFileInfoCrudDtos } from "$shared/models/movies/file-info/dto/transport";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { fixtureMovies } from "$shared/models/movies/tests/fixtures";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { mockMongoId } from "#tests/mongo";
import { expectControllerFinishRequest, testFailValidation, testManyAuth } from "#core/auth/strategies/token/tests";
import { MovieFileInfoController } from "./controller";
import { MovieFileInfoRepository } from "./repository";

// Fixture de file-info de ejemplo
const SAMPLE_FILE_INFO = fixtureMovies.FileInfos.Samples.Inception;

describe("movieFileInfoController", () => {
  let testingSetup: TestingSetup;
  let router: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;
  const validId = mockMongoId;
  const invalidId = "invalidId";
  const baseUrl = "/";

  async function initMocks() {
    const ret = {
      fileInfoRepo: testingSetup.getMock(MovieFileInfoRepository),
    };

    ret.fileInfoRepo.patchOneByIdAndGet.mockResolvedValue(SAMPLE_FILE_INFO);
    ret.fileInfoRepo.deleteOneById.mockResolvedValue(SAMPLE_FILE_INFO);
    ret.fileInfoRepo.getAllByMovieId.mockResolvedValue([SAMPLE_FILE_INFO]);

    await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        imports: [],
        controllers: [MovieFileInfoController],
        providers: [
          getOrCreateMockProvider(MovieFileInfoRepository),
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

  describe("getMany (POST /get-many)", () => {
    const url = `${baseUrl}get-many`;

    beforeEach(async () => {
      await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);
      mocks.fileInfoRepo.getAllByMovieId.mockResolvedValue([SAMPLE_FILE_INFO]);
    } );

    it("valid request with movieId filter returns list", async () => {
      const res = await request(router)
        .post(url)
        .send( {
          filter: {
            movieId: mockMongoId,
          },
        } );

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.data).toHaveLength(1);
    } );

    it("returns empty array when no movieId filter provided", async () => {
      const res = await request(router)
        .post(url)
        .send( {} );

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.data).toEqual([]);
    } );
  } );

  describe("patchOneByIdAndGet (PATCH /:id)", () => {
    const validUrl = `${baseUrl}${validId}`;
    const invalidUrl = `${baseUrl}${invalidId}`;
    const payload = {
      entity: {
        path: "movies/inception-v2.mkv",
      },
    } satisfies MovieFileInfoCrudDtos.PatchOne.Body;

    beforeEach(async () => {
      await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);
    } );

    it("valid request-response", async () => {
      const res = await request(router).patch(validUrl)
        .send(payload);

      expectControllerFinishRequest();

      const data = movieFileInfoEntitySchema.parse(res.body.data);

      expect(data).toEqual(SAMPLE_FILE_INFO);
      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("auth", () => {
      testManyAuth( {
        request: ()=>request(router).patch(validUrl)
          .send(payload),
        list: [
          {
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

    it("should call repository", async () => {
      await request(router).patch(validUrl)
        .send(payload);

      expect(mocks.fileInfoRepo.patchOneByIdAndGet).toHaveBeenCalled();
    } );
  } );

  describe("deleteOne (DELETE /:id)", () => {
    const validUrl = `${baseUrl}${validId}`;
    const invalidUrl = `${baseUrl}${invalidId}`;

    beforeEach(async () => {
      await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);
    } );

    it("valid request-response", async () => {
      const res = await request(router).delete(validUrl);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("auth", () => {
      testManyAuth( {
        request: ()=>request(router).delete(validUrl),
        list: [
          {
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
      request: () => request(router).delete(invalidUrl),
    } );

    it("should call repository", async () => {
      await request(router).delete(validUrl);

      expect(mocks.fileInfoRepo.deleteOneById).toHaveBeenCalled();
    } );
  } );
} );
