import { Application } from "express";
import request from "supertest";
import { container } from "tsyringe";
import { HttpStatusCode } from "#shared/utils/http/StatusCode";
import { resolveRequired } from "#utils/layers/deps";
import { RouterApp } from "#utils/express/test";
import { HISTORY_MUSIC_SAMPLES1 } from "#tests/main/db/fixtures/models/music";
import { registerSingletonIfNotAndGet } from "#tests/main";
import { assertIsMusicHistoryListGetManyEntriesBySearchResponse, Entry, musicHistoryListGetManyEntriesBySearchResponseSchema } from "#musics/history/models/transport";
import { MusicHistoryRepositoryMock as RepositoryMock } from "../repositories/tests";
import { MusicHistoryRepository } from "../repositories";
import { MusicHistoryRestController } from "./RestController";

describe("restController", () => {
  let routerApp: Application;
  let repository: RepositoryMock;

  beforeAll(() => {
    repository = registerSingletonIfNotAndGet(MusicHistoryRepository, RepositoryMock);
    container.registerSingleton(MusicHistoryRestController);
    const controller = resolveRequired(MusicHistoryRestController);

    routerApp = RouterApp(controller.getRouter());
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  it("should be defined", () => {
    expect(repository).toBeDefined();
    expect(routerApp).toBeDefined();
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
          .expect(HttpStatusCode.UNPROCESSABLE_ENTITY)
          .send( {
            cosarara: "porquesi",
          } );
      } );

      it("should return all entries if no criteria provided", async () => {
        const expected = HISTORY_MUSIC_SAMPLES1;

        repository.getManyCriteria.mockResolvedValueOnce(expected);

        const response = await request(routerApp)
          .post(URL)
          .send();
        const body = musicHistoryListGetManyEntriesBySearchResponseSchema.parse(response.body);

        expect(response.statusCode).toEqual(HttpStatusCode.OK);

        assertIsMusicHistoryListGetManyEntriesBySearchResponse(body);

        expect(body).toEqual(expected);
      } );
    } );

    describe("deleteOneEntryById", () => {
      const ENTRY_ID = "entry123";
      const URL = "/user/" + ENTRY_ID;

      beforeEach(() => {
        jest.clearAllMocks();
      } );

      it("should call repository.deleteOneById when valid id is provided", async () => {
        const entry: Entry = {
          date: {
            day: 1,
            month: 1,
            year: 1970,
            timestamp: 0,
          },
          resourceId: "resourceId",
        };

        repository.getOneById.mockResolvedValueOnce(entry);
        repository.deleteOneById.mockResolvedValueOnce(undefined);

        const response = await request(routerApp)
          .delete(URL)
          .send();

        expect(response.body).not.toHaveProperty("errors");

        expect(repository.getOneById).toHaveBeenCalledWith(ENTRY_ID);
        expect(repository.deleteOneById).toHaveBeenCalledWith(ENTRY_ID);
        expect(response.statusCode).toBe(HttpStatusCode.OK);
        expect(response.body).toHaveProperty("entry");
        expect(response.body.entry).toEqual(entry);
      } );

      it("should return 404 if entry does not exist", async () => {
        repository.getOneById.mockResolvedValueOnce(undefined);

        const response = await request(routerApp)
          .delete(URL)
          .send();

        expect(repository.getOneById).toHaveBeenCalledWith(ENTRY_ID);
        expect(repository.deleteOneById).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(HttpStatusCode.NOT_FOUND);
      } );
    } );
  } );
} );
