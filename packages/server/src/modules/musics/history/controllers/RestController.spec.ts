import { assertIsHistoryMusicListGetManyEntriesBySearchResponse, HistoryMusicListGetManyEntriesBySearchResponseSchema } from "#shared/models/musics";
import HttpStatusCode from "#shared/utils/http/StatusCode";
import { registerSingletonIfNotAndGet } from "#tests/main";
import { HISTORY_MUSIC_SAMPLES1 } from "#tests/main/db/fixtures/models/music";
import { RouterApp } from "#utils/express/test";
import { resolveRequired } from "#utils/layers/deps";
import { Application } from "express";
import request from "supertest";
import { container } from "tsyringe";
import { Repository } from "../repositories";
import { HistoryRepositoryMock as RepositoryMock } from "../repositories/tests";
import RestController from "./RestController";

describe("RestController", () => {
  let routerApp: Application;
  let repository: RepositoryMock;

  beforeAll(async () => {
    repository = registerSingletonIfNotAndGet(Repository, RepositoryMock);
    container.registerSingleton(RestController);
    const controller = resolveRequired(RestController);

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

        expect(repository.getManyCriteria).toBeCalledTimes(1);
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
        const body = HistoryMusicListGetManyEntriesBySearchResponseSchema.parse(response.body);

        expect(response.statusCode).toEqual(HttpStatusCode.OK);
        assertIsHistoryMusicListGetManyEntriesBySearchResponse(body);

        expect(body).toEqual(expected);
      } );
    } );
  } );
} );