import { Application } from "express";
import request from "supertest";
import { createSuccessDataResponse } from "$shared/utils/http/responses";
import { HttpStatus } from "@nestjs/common";
import { EpisodeHistoryEntriesRepository } from "../repositories";
import { episodeHistoryEntriesRepositoryMockProvider, lastTimePlayedServiceMockProvider } from "../repositories/tests";
import { EpisodeHistoryEntriesRestController } from "./rest.controller";
import { HISTORY_ENTRY_SIMPSONS1 } from "#tests/main/db/fixtures";
import { createTestingAppModuleAndInit, type TestingSetup } from "#tests/nestjs/app";

describe("restController", () => {
  let routerApp: Application;
  let repository: jest.Mocked<EpisodeHistoryEntriesRepository>;
  let testingSetup: TestingSetup;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [],
      controllers: [EpisodeHistoryEntriesRestController],
      providers: [
        episodeHistoryEntriesRepositoryMockProvider,
        lastTimePlayedServiceMockProvider,
      ],
    } );
    repository = testingSetup.module
      .get<jest.Mocked<EpisodeHistoryEntriesRepository>>(EpisodeHistoryEntriesRepository);

    routerApp = testingSetup.routerApp;
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  it("should be defined", () => {
    expect(repository).toBeDefined();
    expect(routerApp).toBeDefined();
  } );

  describe("getOneBySerieId", () => {
    it("should call historyList repository", async () => {
      await request(routerApp)
        .get("/serieId")
        .send();

      expect(repository.getManyBySerieId).toHaveBeenCalledTimes(1);
      expect(repository.getManyBySerieId).toHaveBeenCalledWith("serieId");
    } );

    it("should return empty array and 200 if 'id' is not found in repository", async () => {
      repository.getManyBySerieId.mockResolvedValueOnce([]);
      await request(routerApp)
        .get("/serieId")
        .expect(HttpStatus.OK)
        .send();
    } );

    it("should return same as repository returns", async () => {
      const entries = [HISTORY_ENTRY_SIMPSONS1];

      repository.getManyBySerieId.mockResolvedValueOnce(entries);

      const response = await request(routerApp)
        .get("/serieId")
        .expect(HttpStatus.OK)
        .send();

      expect(response.body).toEqual(createSuccessDataResponse(entries));
    } );
  } );

  describe("entries", () => {
    describe("getAllEntriesBySerieId", () => {
      it("should call historyList repository", async () => {
        await request(routerApp)
          .get("/serieId/entries")
          .send();

        expect(repository.getManyByCriteria).toHaveBeenCalledTimes(1);
        expect(repository.getManyByCriteria).toHaveBeenCalledWith( {
          filter: {
            serieId: "serieId",
          },
        } );
      } );

      it("should return the same entries that repository returns inside", async () => {
        const entries = [HISTORY_ENTRY_SIMPSONS1];

        repository.getManyByCriteria.mockResolvedValueOnce(entries);

        const response = await request(routerApp)
          .get("/serieId/entries")
          .expect(HttpStatus.OK)
          .send();

        expect(response.body).toEqual(createSuccessDataResponse(entries));
      } );
    } );

    describe("getManyEntriesBySerieAndCriteria", () => {
      it("should call historyList repository", async () => {
        await request(routerApp)
          .post("/serieId/entries/search")
          .send( {} );

        expect(repository.getManyByCriteria).toHaveBeenCalledTimes(1);
        expect(repository.getManyByCriteria).toHaveBeenCalledWith( {
          filter: {
            serieId: "serieId",
          },
        } );
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
        const entries = [HISTORY_ENTRY_SIMPSONS1];

        repository.getManyByCriteria.mockResolvedValueOnce(entries);

        const response = await request(routerApp)
          .post("/serieId/entries/search")
          .send( {} );

        expect(response.statusCode).toEqual(HttpStatus.OK);
        expect(response.body).toEqual(
          createSuccessDataResponse(
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
          .send();

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

      it("should return all entries if no criteria provided", async () => {
        const entries = [HISTORY_ENTRY_SIMPSONS1];

        repository.getManyByCriteria.mockResolvedValueOnce(entries);

        const response = await request(routerApp)
          .post(URL)
          .send();

        expect(response.statusCode).toEqual(HttpStatus.OK);
        expect(response.body).toEqual(
          createSuccessDataResponse(entries),
        );
      } );
    } );
  } );
} );
