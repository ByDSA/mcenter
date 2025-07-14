import { Application } from "express";
import request from "supertest";
import { createSuccessDataResponse } from "$shared/utils/http/responses";
import { HttpStatus } from "@nestjs/common";
import { HISTORY_LIST_SIMPSONS, HISTORY_LIST_WITH_NO_ENTRIES } from "#tests/main/db/fixtures";
import { createMockClass } from "#tests/jest/mocking";
import { createTestingAppModuleAndInit, TestingSetup } from "#tests/nestjs/app";
import { EpisodeRepository } from "#episodes/repositories";
import { SerieRepository } from "#modules/series";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { EpisodeFileInfoRepository } from "#modules/file-info/repositories";
import { EpisodeHistoryListRepository } from "../repositories";
import { LastTimePlayedService } from "../last-time-played.service";
import { episodeHistoryEntryToEntity } from "../models";
import { EpisodeHistoryListRestController } from "./rest.controller";

class HistoryListRepositoryMock extends createMockClass(EpisodeHistoryListRepository) {}

const historyListSample = HISTORY_LIST_SIMPSONS;

describe("restController", () => {
  let routerApp: Application;
  let repository: jest.Mocked<EpisodeHistoryListRepository>;
  let testingSetup: TestingSetup;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      controllers: [EpisodeHistoryListRestController],
      providers: [
        {
          provide: EpisodeHistoryListRepository,
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
      .get<jest.Mocked<EpisodeHistoryListRepository>>(EpisodeHistoryListRepository);

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
        .expect(HttpStatus.OK)
        .send();

      expect(repository.getOneByIdOrCreate)
        .toHaveReturnedWith(Promise.resolve(historyListSample));
    } );

    it("should return same as repository returns", async () => {
      const historyList = HISTORY_LIST_WITH_NO_ENTRIES;

      repository.getOneByIdOrCreate.mockResolvedValueOnce(historyList);

      const response = await request(routerApp)
        .get("/id")
        .expect(HttpStatus.OK)
        .send();

      expect(response.body).toEqual(createSuccessDataResponse(historyList));
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

      it("should create new list if not exists", async () => {
        repository.getOneByIdOrCreate.mockResolvedValueOnce(historyListSample);
        await request(routerApp)
          .get("/id/entries")
          .expect(HttpStatus.OK)
          .send();

        expect(repository.getOneByIdOrCreate)
          .toHaveReturnedWith(Promise.resolve(historyListSample));
      } );

      it("should return the same entries that repository returns inside", async () => {
        const historyList = HISTORY_LIST_SIMPSONS;

        repository.getOneByIdOrCreate.mockResolvedValueOnce(historyList);

        const response = await request(routerApp)
          .get("/id/entries")
          .expect(HttpStatus.OK)
          .send();

        expect(response.body).toEqual(createSuccessDataResponse(historyList.entries));
      } );
    } );

    describe("getManyEntriesByHistoryListIdSearch", () => {
      it("should call historyList repository", async () => {
        await request(routerApp)
          .post("/id/entries/search")
          .send( {} );

        expect(repository.getOneByIdOrCreate).toHaveBeenCalledTimes(1);
        expect(repository.getOneByIdOrCreate).toHaveBeenCalledWith("id");
      } );

      it("should create list if not exists", async () => {
        repository.getOneByIdOrCreate.mockResolvedValueOnce(historyListSample);
        await request(routerApp)
          .post("/id/entries/search")
          .expect(HttpStatus.OK)
          .send( {} );

        expect(repository.getOneByIdOrCreate)
          .toHaveReturnedWith(Promise.resolve(historyListSample));
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
        const historyList = HISTORY_LIST_SIMPSONS;

        repository.getOneByIdOrCreate.mockResolvedValueOnce(historyList);

        const response = await request(routerApp)
          .post("/id/entries/search")
          .send( {} );

        expect(response.statusCode).toEqual(HttpStatus.OK);
        expect(response.body).toEqual(
          createSuccessDataResponse(
            historyList.entries.map(e=>episodeHistoryEntryToEntity(e, historyList)),
          ),
        );
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
          .expect(HttpStatus.UNPROCESSABLE_ENTITY)
          .send( {
            cosarara: "porquesi",
          } );
      } );

      it("should return all entries if no criteria provided", async () => {
        repository.getAll.mockResolvedValueOnce([HISTORY_LIST_SIMPSONS]);

        const response = await request(routerApp)
          .post(URL)
          .send();

        expect(response.statusCode).toEqual(HttpStatus.OK);
        expect(response.body).toEqual(
          createSuccessDataResponse(HISTORY_LIST_SIMPSONS.entries
            .map(e=>episodeHistoryEntryToEntity(e, HISTORY_LIST_SIMPSONS))),
        );
      } );
    } );
  } );
} );
