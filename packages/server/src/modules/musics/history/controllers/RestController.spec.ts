import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { Application } from "express";
import { HISTORY_MUSIC_SAMPLES1 } from "#tests/main/db/fixtures/models/music";
import { createTestingAppModuleAndInit, TestingSetup } from "#tests/nestjs/app";
import { MusicHistoryRepository } from "../repositories";
import { MusicHistoryEntry } from "../models";
import { musicHistoryRepoMockProvider } from "../repositories/tests";
import { MusicHistoryRestController } from "./RestController";

describe("restController", () => {
  let repository: jest.Mocked<MusicHistoryRepository>;
  let routerApp: Application;
  let testingSetup: TestingSetup;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      controllers: [MusicHistoryRestController],
      providers: [
        musicHistoryRepoMockProvider,
      ],
    } );

    routerApp = testingSetup.routerApp;

    repository = testingSetup.module
      .get<jest.Mocked<MusicHistoryRepository>>(MusicHistoryRepository);
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  describe("entries", () => {
    describe("getManyEntriesBySearch", () => {
      const URL = "/user/search";

      it("should call historyList repository", async () => {
        await request(routerApp)
          .post(URL)
          .send();

        expect(repository.getManyCriteria).toHaveBeenCalledTimes(1);
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
        const expected = HISTORY_MUSIC_SAMPLES1;
        const serializedExpected = JSON.parse(JSON.stringify(expected));

        repository.getManyCriteria.mockResolvedValueOnce(expected);

        const response = await request(routerApp)
          .post(URL)
          .expect(HttpStatus.OK)
          .send();

        expect(response.body).toEqual(serializedExpected);
      } );
    } );

    describe("deleteOneEntryById", () => {
      const ENTRY_ID = "entry123";
      const URL = "/user/" + ENTRY_ID;

      beforeEach(() => {
        jest.clearAllMocks();
      } );

      it("should call repository.deleteOneById when valid id is provided", async () => {
        const entry: MusicHistoryEntry = {
          date: {
            day: 1,
            month: 1,
            year: 1970,
            timestamp: 0,
          },
          resourceId: "resourceId",
        };

        repository.deleteOneByIdAndGet.mockResolvedValueOnce(entry);

        const response = await request(routerApp)
          .delete(URL)
          .expect(HttpStatus.OK)
          .send();

        expect(response.body).not.toHaveProperty("errors");

        expect(repository.deleteOneByIdAndGet).toHaveBeenCalledWith(ENTRY_ID);
        expect(response.body).toEqual(entry);
      } );

      it("should return 404 if entry does not exist", async () => {
        repository.getOneById.mockResolvedValueOnce(null);

        await request(routerApp)
          .delete(URL)
          .expect(HttpStatus.NOT_FOUND)
          .send();
      } );
    } );
  } );
} );
