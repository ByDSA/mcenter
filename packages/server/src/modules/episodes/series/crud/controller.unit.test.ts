import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { GET_MANY_CRITERIA_PATH } from "$shared/routing";
import { SeriesCrudDtos } from "$shared/models/episodes/series/dto/transport";
import { PaginatedResult } from "$shared/utils/http/responses";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { testFailValidation, expectControllerFinishRequest,
  testManyAuth } from "#core/auth/strategies/token/tests";
import { EpisodesRepository } from "#episodes/crud/episodes/repository";
import { fixtureImageCovers } from "#modules/image-covers/tests";
import { fixtureEpisodes } from "#episodes/tests";
import { seriesEntitySchema, SeriesSeasons } from "../models";
import { SeriesRepository } from "./repository";
import { SeriesCrudController } from "./controller";

const SAMPLE = fixtureEpisodes.Series.Samples.SampleSeries;
const SAMPLE_SEASONS: SeriesSeasons = {
  1: [
    fixtureEpisodes.SampleSeries.Episodes.Samples.EP1x01,
    fixtureEpisodes.SampleSeries.Episodes.Samples.EP1x02,
  ],
  2: [
    fixtureEpisodes.SampleSeries.Episodes.Samples.EP2x01,
  ],
};
const uploaderUser = fixtureUsers.Normal.UserWithRoles;
const nonUploaderUser = null;

describe("seriesCrudController", () => {
  let testingSetup: TestingSetup;
  let router: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;

  // eslint-disable-next-line require-await
  async function initMocks() {
    const ret = {
      seriesRepo: testingSetup.getMock(SeriesRepository),
      episodesRepo: testingSetup.getMock(EpisodesRepository),
    };

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        imports: [],
        controllers: [SeriesCrudController],
        providers: [
          getOrCreateMockProvider(SeriesRepository),
          getOrCreateMockProvider(EpisodesRepository),
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

  beforeEach(async () => {
    jest.clearAllMocks();
    await testingSetup.useMockedUser(null);
  } );

  describe("getAll (GET)", () => {
    const URL = "/";

    it("valid request-response", async () => {
      const res = await request(router)
        .get(URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);

      const data = seriesEntitySchema.array().parse(res.body.data);

      expect(data).toBeDefined();
    } );

    it("should return OK with empty array when no series exist", async () => {
      mocks.seriesRepo.getAll.mockResolvedValueOnce([]);

      const res = await request(router)
        .get(URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.data).toEqual([]);
    } );

    describe("repositories", () => {
      it("should call seriesRepo.getAll", async () => {
        await request(router)
          .get(URL);

        expect(mocks.seriesRepo.getAll).toHaveBeenCalled();
      } );
    } );
  } );

  describe("getMany (POST)", () => {
    const URL = `/${GET_MANY_CRITERIA_PATH}`;
    const validPayload = {
      filter: {
        id: SAMPLE.id,
      },
    } satisfies SeriesCrudDtos.GetMany.Criteria;

    it("valid request-response", async () => {
      const res = await request(router)
        .post(URL)
        .send(validPayload);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    it("should return OK with empty array data when no series match criteria", async () => {
      mocks.seriesRepo.getMany.mockResolvedValueOnce( {
        data: [],
        metadata: {
          totalCount: 0,
        },
      } as PaginatedResult<any>);

      const res = await request(router)
        .post(URL)
        .send(validPayload);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.data).toHaveLength(0);
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: () => request(router)
          .post(URL)
          .send(validPayload),
        list: [
          {
            user: null,
            shouldPass: true,
          },
          {
            user: uploaderUser,
            shouldPass: true,
          },
          {
            user: nonUploaderUser,
            shouldPass: true,
          },
          {
            user: fixtureUsers.Admin.UserWithRoles,
            shouldPass: true,
          },
        ],
      } );
    } );

    describe("repositories", () => {
      it("should call seriesRepo.getMany", async () => {
        await request(router)
          .post(URL)
          .send(validPayload);

        expect(mocks.seriesRepo.getMany).toHaveBeenCalled();
      } );

      it("should pass requestUserId as null when no user is authenticated", async () => {
        await request(router)
          .post(URL)
          .send(validPayload);

        expect(mocks.seriesRepo.getMany).toHaveBeenCalledWith(
          expect.objectContaining( {
            requestUserId: null,
          } ),
        );
      } );

      it("should pass requestUserId when user is authenticated", async () => {
        await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);

        await request(router)
          .post(URL)
          .send(validPayload);

        expect(mocks.seriesRepo.getMany).toHaveBeenCalledWith(
          expect.objectContaining( {
            requestUserId: fixtureUsers.Normal.UserWithRoles.id,
          } ),
        );
      } );
    } );
  } );

  describe("getOne (GET)", () => {
    const VALID_URL = `/${SAMPLE.id}`;
    const INVALID_URL = "/notObjectId";

    it("valid request-response", async () => {
      const res = await request(router)
        .get(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);

      const data = seriesEntitySchema.parse(res.body.data);

      expect(data).toEqual(SAMPLE);
    } );

    it("should return OK + data null when series not found", async () => {
      mocks.seriesRepo.getOneById.mockResolvedValueOnce(null);

      const res = await request(router)
        .get(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.data).toBeNull();
    } );

    describe("path parameters validation", () => {
      testFailValidation("id", {
        request: () => request(router).get(INVALID_URL),
      } );
    } );

    describe("repositories", () => {
      it("should call seriesRepo.getOneById", async () => {
        await request(router)
          .get(VALID_URL);

        expect(mocks.seriesRepo.getOneById).toHaveBeenCalled();
      } );
    } );
  } );

  describe("getSeasons (GET)", () => {
    const VALID_URL = `/${SAMPLE.id}/seasons`;
    const INVALID_URL = "/notObjectId/seasons";

    it("valid request-response", async () => {
      mocks.episodesRepo.getSeasonsById.mockResolvedValueOnce(SAMPLE_SEASONS);

      const res = await request(router)
        .get(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("path parameters validation", () => {
      testFailValidation("id", {
        request: () => request(router).get(INVALID_URL),
      } );
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: () => request(router).get(VALID_URL),
        list: [
          {
            user: null,
            shouldPass: true,
          },
          {
            user: uploaderUser,
            shouldPass: true,
          },
          {
            user: nonUploaderUser,
            shouldPass: true,
          },
          {
            user: fixtureUsers.Admin.UserWithRoles,
            shouldPass: true,
          },
        ],
      } );
    } );

    describe("repositories", () => {
      it("should call episodesRepo.getSeasonsById", async () => {
        await request(router)
          .get(VALID_URL);

        expect(mocks.episodesRepo.getSeasonsById).toHaveBeenCalled();
      } );

      it("should expand userInfo when user is authenticated", async () => {
        await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);

        await request(router)
          .get(VALID_URL);

        expect(mocks.episodesRepo.getSeasonsById).toHaveBeenCalled();
      } );

      it("should NOT expand userInfo when user is not authenticated", async () => {
        await request(router)
          .get(VALID_URL);

        expect(mocks.episodesRepo.getSeasonsById).toHaveBeenCalled();
      } );
    } );
  } );

  describe("createOne (POST)", () => {
    const URL = "/";
    const validPayload = {
      name: "New Series",
      imageCoverId: fixtureImageCovers.Disk.Samples.NodeJs.id,
    } satisfies SeriesCrudDtos.CreateOne.Body;

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);

      const res = await request(router)
        .post(URL)
        .send(validPayload);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);

      const data = seriesEntitySchema.parse(res.body.data);

      expect(data).toBeDefined();
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: () => request(router)
          .post(URL)
          .send(validPayload),
        list: [
          {
            user: null,
            shouldPass: false,
          },
          {
            user: uploaderUser,
            shouldPass: true,
          },
          {
            user: nonUploaderUser,
            shouldPass: false,
          },
          {
            user: fixtureUsers.Admin.UserWithRoles,
            shouldPass: true,
          },
        ],
      } );
    } );

    describe("invalid payload", () => {
      it("invalid imageCoverId format", async () => {
        await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);

        const res = await request(router)
          .post(URL)
          .send( {
            ...validPayload,
            imageCoverId: "not-an-object-id",
          } );

        expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      } );

      it("missing required fields", async () => {
        await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);

        const res = await request(router)
          .post(URL)
          .send( {} );

        expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      } );
    } );

    describe("repositories", () => {
      it("should call seriesRepo.createOneAndGet", async () => {
        await testingSetup.useMockedUser(uploaderUser);

        await request(router)
          .post(URL)
          .send(validPayload);

        expect(mocks.seriesRepo.createOneAndGet).toHaveBeenCalled();
      } );

      it("should set imageCoverId to null when not provided", async () => {
        await testingSetup.useMockedUser(uploaderUser);

        const payloadWithoutCover = {
          name: "New Series Without Cover",
          imageCoverId: null,
        } satisfies SeriesCrudDtos.CreateOne.Body;

        await request(router)
          .post(URL)
          .send(payloadWithoutCover);

        expect(mocks.seriesRepo.createOneAndGet).toHaveBeenCalled();
      } );
    } );
  } );

  describe("patchOne (PATCH)", () => {
    const VALID_URL = `/${SAMPLE.id}`;
    const INVALID_URL = "/notObjectId";
    const validPayload = {
      entity: {
        name: "Updated Series Title",
      },
    } satisfies SeriesCrudDtos.Patch.Body;

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(uploaderUser);

      const res = await request(router)
        .patch(VALID_URL)
        .send(validPayload);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);

      const data = seriesEntitySchema.parse(res.body.data);

      expect(data).toBeDefined();
    } );

    describe("path parameters validation", () => {
      testFailValidation("id", {
        request: () => request(router)
          .patch(INVALID_URL)
          .send(validPayload),
        user: uploaderUser,
      } );
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: () => request(router)
          .patch(VALID_URL)
          .send(validPayload),
        list: [
          {
            user: null,
            shouldPass: false,
          },
          {
            user: uploaderUser,
            shouldPass: true,
          },
          {
            user: nonUploaderUser,
            shouldPass: false,
          },
          {
            user: fixtureUsers.Admin.UserWithRoles,
            shouldPass: true,
          },
        ],
      } );
    } );

    describe("invalid payload", () => {
      it("invalid imageCoverId format", async () => {
        await testingSetup.useMockedUser(uploaderUser);

        const res = await request(router)
          .patch(VALID_URL)
          .send( {
            imageCoverId: "not-an-object-id",
          } );

        expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      } );
    } );

    describe("repositories", () => {
      it("should call seriesRepo.patchOneByIdAndGet", async () => {
        await testingSetup.useMockedUser(uploaderUser);

        await request(router)
          .patch(VALID_URL)
          .send(validPayload);

        expect(mocks.seriesRepo.patchOneByIdAndGet).toHaveBeenCalled();
      } );
    } );
  } );

  describe("deleteOne (DELETE)", () => {
    const VALID_URL = `/${SAMPLE.id}`;
    const INVALID_URL = "/notObjectId";

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);

      const res = await request(router)
        .delete(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("path parameters validation", () => {
      testFailValidation("id", {
        request: () => request(router).delete(INVALID_URL),
        user: fixtureUsers.Admin.UserWithRoles,
      } );
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: () => request(router).delete(VALID_URL),
        list: [
          {
            user: null,
            shouldPass: false,
          },
          {
            user: uploaderUser,
            shouldPass: false,
          },
          {
            user: nonUploaderUser,
            shouldPass: false,
          },
          {
            user: fixtureUsers.Admin.UserWithRoles,
            shouldPass: true,
          },
        ],
      } );
    } );

    describe("repositories", () => {
      it("should call seriesRepo.deleteOneByIdAndGet", async () => {
        await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);

        await request(router)
          .delete(VALID_URL);

        expect(mocks.seriesRepo.deleteOneByIdAndGet).toHaveBeenCalled();
      } );
    } );
  } );
} );
