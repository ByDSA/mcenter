import { HttpStatusCode } from "#shared/utils/http/StatusCode";
import { Application } from "express";
import request from "supertest";
import { container } from "tsyringe";
import { resolveRequired } from "#utils/layers/deps";
import { RouterApp } from "#utils/express/test";
import { HISTORY_MUSIC_SAMPLES1 } from "#tests/main/db/fixtures/models/music";
import { registerSingletonIfNotAndGet } from "#tests/main";
import { assertIsMusicHistoryListGetManyEntriesBySearchResponse, musicHistoryListGetManyEntriesBySearchResponseSchema } from "#musics/history/models/transport";
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
  } );
} );
