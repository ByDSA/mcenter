import { Application } from "express";
import request from "supertest";
import { createSuccessResultResponse } from "$shared/utils/http/responses";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { fixtureEpisodeHistoryEntries } from "#episodes/history/tests";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { EpisodeHistoryRepository } from "./repository";
import { episodeHistoryRepositoryMockProvider, lastTimePlayedServiceMockProvider } from "./repository/tests";
import { EpisodeHistoryCrudController } from "./controller";

const SAMPLE = fixtureEpisodeHistoryEntries.Simpsons.Samples.EP1x01;

describe("crudController", () => {
  let routerApp: Application;
  let repository: jest.Mocked<EpisodeHistoryRepository>;
  let testingSetup: TestingSetup;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [],
      controllers: [EpisodeHistoryCrudController],
      providers: [
        episodeHistoryRepositoryMockProvider,
        lastTimePlayedServiceMockProvider,
      ],
    }, {
      auth: {
        repositories: "mock",
        cookies: "mock",
      },
    } );
    repository = testingSetup.module
      .get<jest.Mocked<EpisodeHistoryRepository>>(EpisodeHistoryRepository);

    routerApp = testingSetup.routerApp;

    await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  it("should be defined", () => {
    expect(repository).toBeDefined();
    expect(routerApp).toBeDefined();
  } );

  describe("getOneBySeriesKey", () => {
    it("should call historyList repository", async () => {
      await request(routerApp)
        .get("/seriesKey")
        .send();

      expect(repository.getManyBySeriesKey).toHaveBeenCalledTimes(1);
    } );

    it("should return empty array and 200 if 'id' is not found in repository", async () => {
      repository.getManyBySeriesKey.mockResolvedValueOnce([]);
      await request(routerApp)
        .get("/seriesKey")
        .expect(HttpStatus.OK)
        .send();
    } );

    it("should return same as repository returns", async () => {
      const entries = [SAMPLE];

      repository.getManyBySeriesKey.mockResolvedValueOnce(entries);

      const response = await request(routerApp)
        .get("/seriesKey")
        .expect(HttpStatus.OK)
        .send();

      expect(response.body).toEqual(createSuccessResultResponse(entries));
    } );
  } );

  describe("entries", () => {
    describe("getAllEntriesBySeriesKey", () => {
      it("should call historyList repository", async () => {
        await request(routerApp)
          .get("/seriesKey/entries")
          .send();

        expect(repository.getManyByCriteria).toHaveBeenCalledTimes(1);
      } );

      it("should return the same entries that repository returns inside", async () => {
        const entries = [SAMPLE];

        repository.getManyByCriteria.mockResolvedValueOnce(entries);

        const response = await request(routerApp)
          .get("/seriesKey/entries")
          .expect(HttpStatus.OK)
          .send();

        expect(response.body).toEqual(createSuccessResultResponse(entries));
      } );
    } );

    describe("getManyEntriesBySerieAndCriteria", () => {
      it("should call historyList repository", async () => {
        await request(routerApp)
          .post("/seriesKey/entries/search")
          .send( {} );

        expect(repository.getManyByCriteria).toHaveBeenCalledTimes(1);
      } );

      it("should throw 422 if provided unexpected property", async () => {
        await request(routerApp)
          .post("/id/entries/search")
          .expect(HttpStatus.UNPROCESSABLE_ENTITY)
          .send( {
            cosarara: "porquesi",
          } );
      } );

      it("should return all entries if empty criteria provided", async () => {
        const entries = [SAMPLE];

        repository.getManyByCriteria.mockResolvedValueOnce(entries);

        const response = await request(routerApp)
          .post("/seriesKey/entries/search")
          .send( {} );

        expect(response.statusCode).toEqual(HttpStatus.OK);
        expect(response.body).toEqual(
          createSuccessResultResponse(
            entries,
          ),
        );
      } );
    } );

    describe("getManyEntriesByCriteria", () => {
      const URL = "/entries/search";

      it("should call historyList repository", async () => {
        await request(routerApp)
          .post(URL)
          .send( {} );

        expect(repository.getManyByCriteria).toHaveBeenCalledTimes(1);
      } );

      it("should throw 422 if provided unexpected property", async () => {
        await request(routerApp)
          .post(URL)
          .expect(HttpStatus.UNPROCESSABLE_ENTITY)
          .send( {
            cosarara: "porquesi",
          } );
      } );

      it("should return all entries if empty criteria provided", async () => {
        const entries = [SAMPLE];

        repository.getManyByCriteria.mockResolvedValueOnce(entries);

        const response = await request(routerApp)
          .post(URL)
          .send( {} );

        expect(response.statusCode).toEqual(HttpStatus.OK);
        expect(response.body).toEqual(
          createSuccessResultResponse(entries),
        );
      } );
    } );
  } );
} );
