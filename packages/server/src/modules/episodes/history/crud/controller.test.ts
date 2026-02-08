import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { createSuccessResultResponse } from "$shared/utils/http/responses";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { GET_MANY_CRITERIA_PATH } from "$shared/routing";
import { EpisodeHistoryEntryCrudDtos } from "$shared/models/episodes/history/dto/transport";
import z from "zod";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { fixtureEpisodeHistoryEntries } from "#episodes/history/tests";
import { mockMongoId } from "#tests/mongo";
import { fixtureEpisodes } from "#episodes/tests";
import { episodeUserInfoEntitySchema } from "#episodes/models";
import { EpisodeHistoryRepository } from "./repository";
import { EpisodeHistoryCrudController } from "./controller";

const SAMPLE = fixtureEpisodeHistoryEntries.Simpsons.Samples.EP1x01;
const SAMPLE_WITH_RESOURCE_AND_USERINFO = {
  ...SAMPLE,
  resource: {
    ...fixtureEpisodes.Simpsons.Samples.EP1x01,
    userInfo: {
      episodeId: fixtureEpisodes.Simpsons.Samples.EP1x01.id,
      id: mockMongoId,
      lastTimePlayed: new Date(0),
      createdAt: new Date(),
      updatedAt: new Date(),
      weight: 0,
      userId: fixtureUsers.Normal.User.id,
    }satisfies z.infer<typeof episodeUserInfoEntitySchema>,
  },
};

describe("episodeHistoryCrudController", () => {
  let routerApp: Application;
  let testingSetup: TestingSetup;
  let mocks: Awaited<ReturnType<typeof initMocks>>;
  const validSeriesId = mockMongoId;

  // eslint-disable-next-line require-await
  async function initMocks(setup: TestingSetup) {
    const ret = {
      repo: setup.getMock(EpisodeHistoryRepository),
    };

    ret.repo.getManyBySeriesId.mockResolvedValue([SAMPLE_WITH_RESOURCE_AND_USERINFO]);
    ret.repo.getManyByCriteria.mockResolvedValue([SAMPLE_WITH_RESOURCE_AND_USERINFO]);

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [],
      controllers: [EpisodeHistoryCrudController],
      providers: [
        getOrCreateMockProvider(EpisodeHistoryRepository),
      ],
    }, {
      auth: {
        repositories: "mock",
        cookies: "mock",
      },
    } );

    routerApp = testingSetup.routerApp;
    mocks = await initMocks(testingSetup);
    await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  describe("getManyBySeriesId", () => {
    const validUrl = `/${validSeriesId}`;
    const invalidUrl = "/notObjectId";

    it("should return 422 if seriesId is not ObjectId", async () => {
      const res = await request(routerApp)
        .get(invalidUrl);

      expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    } );

    it("should call repository with correct params", async () => {
      await request(routerApp)
        .get(validUrl);

      expect(mocks.repo.getManyBySeriesId).toHaveBeenCalledTimes(1);
    } );

    it("should return 200 and empty array when no entries found", async () => {
      mocks.repo.getManyBySeriesId.mockResolvedValueOnce([]);

      const res = await request(routerApp)
        .get(validUrl);

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body).toEqual(createSuccessResultResponse([]));
    } );

    it("should return 200 and entries when found", async () => {
      const entries = [SAMPLE_WITH_RESOURCE_AND_USERINFO];

      mocks.repo.getManyBySeriesId.mockResolvedValueOnce(entries);

      const res = await request(routerApp)
        .get(validUrl);
      const parsedRes = EpisodeHistoryEntryCrudDtos.GetMany.responseSchema.parse(res.body);

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(parsedRes).toEqual(createSuccessResultResponse(entries));
    } );
  } );

  describe("getAllEntriesByseriesKey", () => {
    const validUrl = `/${validSeriesId}/entries`;

    it("should call repository with correct criteria", async () => {
      await request(routerApp)
        .get(validUrl);

      expect(mocks.repo.getManyByCriteria).toHaveBeenCalledTimes(1);
    } );

    it("should return 200 and entries when found", async () => {
      const entries = [SAMPLE_WITH_RESOURCE_AND_USERINFO];

      mocks.repo.getManyByCriteria.mockResolvedValueOnce(entries);

      const res = await request(routerApp)
        .get(validUrl);
      const parsedRes = EpisodeHistoryEntryCrudDtos.GetMany.responseSchema.parse(res.body);

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(parsedRes).toEqual(createSuccessResultResponse(entries));
    } );
  } );

  describe("getManyEntriesBySerieAndCriteria", () => {
    const URL = `/${validSeriesId}/entries/${GET_MANY_CRITERIA_PATH}`;

    it("should return 422 if provided unexpected property", async () => {
      const res = await request(routerApp)
        .post(URL)
        .send( {
          cosarara: "porquesi",
        } );

      expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    } );

    it("should call repository with merged criteria", async () => {
      await request(routerApp)
        .post(URL)
        .send( {} );

      expect(mocks.repo.getManyByCriteria).toHaveBeenCalledTimes(1);
    } );

    it("should return 200 and entries with valid criteria", async () => {
      const entries = [SAMPLE_WITH_RESOURCE_AND_USERINFO];

      mocks.repo.getManyByCriteria.mockResolvedValueOnce(entries);

      const res = await request(routerApp)
        .post(URL)
        .send( {} );
      const parsedRes = EpisodeHistoryEntryCrudDtos.GetMany.responseSchema.parse(res.body);

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(parsedRes).toEqual(createSuccessResultResponse(entries));
    } );
  } );

  describe("getManyEntriesByCriteria", () => {
    const URL = `/entries/${GET_MANY_CRITERIA_PATH}`;

    it("should return 422 if provided unexpected property", async () => {
      const res = await request(routerApp)
        .post(URL)
        .send( {
          cosarara: "porquesi",
        } );

      expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    } );

    it("should call repository with user-scoped criteria", async () => {
      await request(routerApp)
        .post(URL)
        .send( {} );

      expect(mocks.repo.getManyByCriteria).toHaveBeenCalledTimes(1);
    } );

    it("should return 200 and entries with valid criteria", async () => {
      const entries = [SAMPLE_WITH_RESOURCE_AND_USERINFO];

      mocks.repo.getManyByCriteria.mockResolvedValueOnce(entries);

      const res = await request(routerApp)
        .post(URL)
        .send( {} );
      const parsedRes = EpisodeHistoryEntryCrudDtos.GetMany.responseSchema.parse(res.body);

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(parsedRes).toEqual(createSuccessResultResponse(entries));
    } );
  } );
} );
