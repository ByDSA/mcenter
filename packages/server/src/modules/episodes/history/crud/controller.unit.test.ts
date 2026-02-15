import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { GET_MANY_CRITERIA_PATH } from "$shared/routing";
import { EpisodeHistoryEntryCrudDtos } from "$shared/models/episodes/history/dto/transport";
import { EpisodeHistoryRepository } from "./repository";
import { EpisodeHistoryCrudController } from "./controller";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { fixtureEpisodes } from "#episodes/tests";
import { testFailValidation } from "#core/auth/strategies/token/tests";

describe("episodeHistoryCrudController", () => {
  let routerApp: Application;
  let testingSetup: TestingSetup;
  let mocks: Awaited<ReturnType<typeof initMocks>>;
  const VALID_SERIES_ID = fixtureEpisodes.Series.Samples.SampleSeries.id;

  // eslint-disable-next-line require-await
  async function initMocks() {
    const ret = {
      repo: testingSetup.getMock(EpisodeHistoryRepository),
    };

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
    mocks = await initMocks();
  } );

  beforeEach(async () => {
    jest.clearAllMocks();
    await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);
  } );

  describe("getManyBySeriesId", () => {
    const VALID_URL = `/${VALID_SERIES_ID}`;
    const INVALID_URL = "/notObjectId";

    testFailValidation("not ObjectId param", {
      request: () => request(routerApp).get(INVALID_URL),
    } );

    it("should call repository", async () => {
      await request(routerApp)
        .get(VALID_URL);

      expect(mocks.repo.getManyBySeriesId).toHaveBeenCalled();
    } );

    it("should return 200 and empty array when no entries found", async () => {
      mocks.repo.getManyBySeriesId.mockResolvedValueOnce([]);

      const res = await request(routerApp)
        .get(VALID_URL);
      const parsedRes = EpisodeHistoryEntryCrudDtos.GetManyBySeriesId
        .responseSchema.parse(res.body);

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(parsedRes.data).toEqual([]);
    } );

    it("should return 200 and entries when found", async () => {
      const res = await request(routerApp)
        .get(VALID_URL);
      const parsedRes = EpisodeHistoryEntryCrudDtos.GetManyBySeriesId
        .responseSchema.parse(res.body);

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(parsedRes.data.length).toBeGreaterThan(0);
    } );
  } );

  describe("getAllEntriesBySeriesId", () => {
    const validUrl = `/${VALID_SERIES_ID}/entries`;

    it("should call repository with correct criteria", async () => {
      await request(routerApp)
        .get(validUrl);

      expect(mocks.repo.getManyByCriteria).toHaveBeenCalled();
    } );

    it("should return 200 and entries when found", async () => {
      const res = await request(routerApp)
        .get(validUrl);
      const parsedRes = EpisodeHistoryEntryCrudDtos.GetAllEntriesBySeriesId
        .responseSchema.parse(res.body);

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(parsedRes.data.length).toBeGreaterThan(0);
    } );
  } );

  describe("getManyEntriesBySerieAndCriteria", () => {
    const URL = `/${VALID_SERIES_ID}/entries/${GET_MANY_CRITERIA_PATH}`;

    testFailValidation("unexpected payload field", {
      request: () => request(routerApp).post(URL)
        .send( {
          cosarara: "porquesi",
        } ),
    } );

    it("should call repository with merged criteria", async () => {
      await request(routerApp)
        .post(URL)
        .send( {} );

      expect(mocks.repo.getManyByCriteria).toHaveBeenCalled();
    } );

    it("should return 200 and entries with valid criteria", async () => {
      const res = await request(routerApp)
        .post(URL)
        .send( {} );
      const parsedRes = EpisodeHistoryEntryCrudDtos.GetMany
        .responseSchema.parse(res.body);

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(parsedRes.data.length).toBeGreaterThan(0);
    } );
  } );

  describe("getManyEntriesByCriteria", () => {
    const URL = `/entries/${GET_MANY_CRITERIA_PATH}`;

    testFailValidation("unexpected payload field", {
      request: () => request(routerApp).post(URL)
        .send( {
          cosarara: "porquesi",
        } ),
    } );

    it("should call repository with user-scoped criteria", async () => {
      await request(routerApp)
        .post(URL)
        .send( {} );

      expect(mocks.repo.getManyByCriteria).toHaveBeenCalled();
    } );

    it("should return 200 and entries with valid criteria", async () => {
      const res = await request(routerApp)
        .post(URL)
        .send( {} );
      const parsedRes = EpisodeHistoryEntryCrudDtos.GetMany.responseSchema.parse(res.body);

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(parsedRes.data.length).toBeGreaterThan(0);
    } );
  } );
} );
