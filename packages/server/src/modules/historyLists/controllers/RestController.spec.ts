import HttpStatusCode from "#shared/utils/http/StatusCode";
import { Application } from "express";
import request from "supertest";
import { container } from "tsyringe";
import { ListRepository as HistoryListRepository } from "../repositories";
import { HistoryListRepositoryMock } from "../repositories/tests";
import RestController from "./RestController";
import { resolveRequired } from "#utils/layers/deps";
import { RouterApp } from "#utils/express/test";
import { HISTORY_LIST_SIMPSONS, HISTORY_LIST_WITH_NO_ENTRIES } from "#tests/main/db/fixtures";
import { registerSingletonIfNotAndGet } from "#tests/main";

describe("RestController", () => {
  let routerApp: Application;
  let historyListRepositoryMock: HistoryListRepositoryMock;

  beforeAll(async () => {
    registerSingletonIfNotAndGet(HistoryListRepository, HistoryListRepositoryMock);
    historyListRepositoryMock = resolveRequired(HistoryListRepository) as HistoryListRepositoryMock;
    container.registerSingleton(RestController);
    const controller = resolveRequired(RestController);

    routerApp = RouterApp(controller.getRouter());
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  it("should be defined", () => {
    expect(historyListRepositoryMock).toBeDefined();
    expect(routerApp).toBeDefined();
  } );

  describe("getOneById", () => {
    it("should call historyList repository", async () => {
      await request(routerApp)
        .get("/id")
        .send();

      expect(historyListRepositoryMock.getOneByIdOrCreate).toBeCalledTimes(1);
      expect(historyListRepositoryMock.getOneByIdOrCreate).toBeCalledWith("id");
    } );

    it("should return null and 404 if 'id' is not found in repository", async () => {
      historyListRepositoryMock.getOneByIdOrCreate.mockResolvedValueOnce(null);
      await request(routerApp)
        .get("/id")
        .expect(HttpStatusCode.NOT_FOUND)
        .send();

      expect(historyListRepositoryMock.getOneByIdOrCreate).toHaveReturnedWith(Promise.resolve(null));
    } );

    it("should return same as repository returns", async () => {
      const historyList = HISTORY_LIST_WITH_NO_ENTRIES;

      historyListRepositoryMock.getOneByIdOrCreate.mockResolvedValueOnce(historyList);

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

        expect(historyListRepositoryMock.getOneByIdOrCreate).toBeCalledTimes(1);
        expect(historyListRepositoryMock.getOneByIdOrCreate).toBeCalledWith("id");
      } );

      it("should return null and 404 if 'id' is not found in repository", async () => {
        historyListRepositoryMock.getOneByIdOrCreate.mockResolvedValueOnce(null);
        await request(routerApp)
          .get("/id/entries")
          .expect(HttpStatusCode.NOT_FOUND)
          .send();

        expect(historyListRepositoryMock.getOneByIdOrCreate).toHaveReturnedWith(Promise.resolve(null));
      } );

      it("should return the same entries that repository returns inside", async () => {
        const historyList = HISTORY_LIST_SIMPSONS;

        historyListRepositoryMock.getOneByIdOrCreate.mockResolvedValueOnce(historyList);

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

        expect(historyListRepositoryMock.getOneByIdOrCreate).toBeCalledTimes(1);
        expect(historyListRepositoryMock.getOneByIdOrCreate).toBeCalledWith("id");
      } );

      it("should return null and 404 if id is not found in repository", async () => {
        historyListRepositoryMock.getOneByIdOrCreate.mockResolvedValueOnce(null);
        await request(routerApp)
          .post("/id/entries/search")
          .expect(HttpStatusCode.NOT_FOUND)
          .send();

        expect(historyListRepositoryMock.getOneByIdOrCreate).toHaveReturnedWith(Promise.resolve(null));
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

        historyListRepositoryMock.getOneByIdOrCreate.mockResolvedValueOnce(historyList);

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

        expect(historyListRepositoryMock.getAll).toBeCalledTimes(1);
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
        historyListRepositoryMock.getAll.mockResolvedValueOnce([HISTORY_LIST_SIMPSONS]);

        const response = await request(routerApp)
          .post(URL)
          .send();

        expect(response.statusCode).toEqual(HttpStatusCode.OK);
        expect(response.body).toEqual([...HISTORY_LIST_SIMPSONS.entries]);
      } );
    } );
  } );
} );
