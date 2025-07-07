import { HttpStatusCode } from "#shared/utils/http/StatusCode";
import { Application } from "express";
import request from "supertest";
import { HISTORY_LIST_SIMPSONS, HISTORY_LIST_WITH_NO_ENTRIES } from "#tests/main/db/fixtures";
import { createMockClass } from "#tests/jest/mocking";
import { createTestingAppModuleAndInit, TestingSetup } from "#tests/nestjs/app";
import { EpisodeRepository } from "#episodes/repositories";
import { SerieRepository } from "#modules/series";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { EpisodeFileInfoRepository } from "#modules/file-info/repositories";
import { HistoryListRepository } from "../repositories";
import { LastTimePlayedService } from "../LastTimePlayedService";
import { HistoryListRestController } from "./RestController";

class HistoryListRepositoryMock extends createMockClass(HistoryListRepository) {}

const historyListSample = HISTORY_LIST_SIMPSONS;

describe("restController", () => {
  let routerApp: Application;
  let repository: jest.Mocked<HistoryListRepository>;
  let testingSetup: TestingSetup;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      controllers: [HistoryListRestController],
      providers: [
        {
          provide: HistoryListRepository,
          useClass: HistoryListRepositoryMock,
        },
        DomainMessageBroker,
        SerieRepository,
        EpisodeFileInfoRepository,
        EpisodeRepository,
        LastTimePlayedService,
      ],
    } );
    repository = testingSetup.module
      .get<jest.Mocked<HistoryListRepository>>(HistoryListRepository);

    routerApp = testingSetup.routerApp;
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  it("should be defined", () => {
    expect(repository).toBeDefined();
    expect(routerApp).toBeDefined();
  } );

  describe("getOneById", () => {
    it("should call historyList repository", async () => {
      await request(routerApp)
        .get("/id")
        .send();

      expect(repository.getOneByIdOrCreate).toHaveBeenCalledTimes(1);
      expect(repository.getOneByIdOrCreate).toHaveBeenCalledWith("id");
    } );

    it("should return null and 404 if 'id' is not found in repository", async () => {
      repository.getOneByIdOrCreate.mockResolvedValueOnce(historyListSample);
      await request(routerApp)
        .get("/id")
        .expect(HttpStatusCode.OK)
        .send();

      expect(repository.getOneByIdOrCreate)
        .toHaveReturnedWith(Promise.resolve(historyListSample));
    } );

    it("should return same as repository returns", async () => {
      const historyList = HISTORY_LIST_WITH_NO_ENTRIES;

      repository.getOneByIdOrCreate.mockResolvedValueOnce(historyList);

      const response = await request(routerApp)
        .get("/id")
        .expect(HttpStatusCode.OK)
        .send();

      expect(response.body).toEqual(historyList);
    } );
  } );

  describe("entries", () => {
    describe("getManyEntriesByHistoryListId", () => {
      it("should call historyList repository", async () => {
        await request(routerApp)
          .get("/id/entries")
          .send();

        expect(repository.getOneByIdOrCreate).toHaveBeenCalledTimes(1);
        expect(repository.getOneByIdOrCreate).toHaveBeenCalledWith("id");
      } );

      it("should return null and 404 if 'id' is not found in repository", async () => {
        repository.getOneByIdOrCreate.mockResolvedValueOnce(historyListSample);
        await request(routerApp)
          .get("/id/entries")
          .expect(HttpStatusCode.NOT_FOUND)
          .send();

        expect(repository.getOneByIdOrCreate)
          .toHaveReturnedWith(Promise.resolve(historyListSample));
      } );

      it("should return the same entries that repository returns inside", async () => {
        const historyList = HISTORY_LIST_SIMPSONS;

        repository.getOneByIdOrCreate.mockResolvedValueOnce(historyList);

        const response = await request(routerApp)
          .get("/id/entries")
          .expect(HttpStatusCode.OK)
          .send();

        expect(response.body).toEqual(historyList.entries);
      } );
    } );

    describe("getManyEntriesByHistoryListIdSearch", () => {
      it("should call historyList repository", async () => {
        await request(routerApp)
          .post("/id/entries/search")
          .send();

        expect(repository.getOneByIdOrCreate).toHaveBeenCalledTimes(1);
        expect(repository.getOneByIdOrCreate).toHaveBeenCalledWith("id");
      } );

      it("should return null and 404 if id is not found in repository", async () => {
        repository.getOneByIdOrCreate.mockResolvedValueOnce(historyListSample);
        await request(routerApp)
          .post("/id/entries/search")
          .expect(HttpStatusCode.NOT_FOUND)
          .send();

        expect(repository.getOneByIdOrCreate)
          .toHaveReturnedWith(Promise.resolve(historyListSample));
      } );

      it("should throw 422 if provided unexpected property", async () => {
        await request(routerApp)
          .post("/id/entries/search")
          .expect(HttpStatusCode.UNPROCESSABLE_ENTITY)
          .send( {
            cosarara: "porquesi",
          } );
      } );

      it("should return all entries if no criteria provided", async () => {
        const historyList = HISTORY_LIST_SIMPSONS;

        repository.getOneByIdOrCreate.mockResolvedValueOnce(historyList);

        const response = await request(routerApp)
          .post("/id/entries/search")
          .send();

        expect(response.statusCode).toEqual(HttpStatusCode.OK);
        expect(response.body).toEqual(historyList.entries);
      } );
    } );

    describe("getManyEntriesBySearch", () => {
      const URL = "/entries/search";

      it("should call historyList repository", async () => {
        await request(routerApp)
          .post(URL)
          .send();

        expect(repository.getAll).toHaveBeenCalledTimes(1);
      } );

      it("should throw 422 if provided unexpected property", async () => {
        await request(routerApp)
          .post(URL)
          .expect(HttpStatusCode.UNPROCESSABLE_ENTITY)
          .send( {
            cosarara: "porquesi",
          } );
      } );

      it("should return all entries if no criteria provided", async () => {
        repository.getAll.mockResolvedValueOnce([HISTORY_LIST_SIMPSONS]);

        const response = await request(routerApp)
          .post(URL)
          .send();

        expect(response.statusCode).toEqual(HttpStatusCode.OK);
        expect(response.body).toEqual([...HISTORY_LIST_SIMPSONS.entries]);
      } );
    } );
  } );
} );
