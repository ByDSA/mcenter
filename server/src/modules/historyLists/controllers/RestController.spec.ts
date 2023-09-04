import { HISTORY_LIST_WITH_NO_ENTRIES } from "#tests/main/db/fixtures";
import { RouterApp } from "#utils/express/test";
import HttpStatusCode from "#utils/http/StatusCode";
import { Application } from "express";
import request from "supertest";
import { HistoryListRepositoryMock } from "../repositories/tests";
import RestController from "./RestController";

describe("RestController", () => {
  let routerApp: Application;
  let historyListRepositoryMock: HistoryListRepositoryMock;

  beforeAll(async () => {
    historyListRepositoryMock = new HistoryListRepositoryMock();
    const controller = new RestController( {
      historyListRepository: historyListRepositoryMock,
    } );

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
        .expect(HttpStatusCode.NOT_FOUND)
        .send();

      expect(historyListRepositoryMock.getOneById).toBeCalledTimes(1);
      expect(historyListRepositoryMock.getOneById).toBeCalledWith("id");
    } );

    it("should return same as repository returns", async () => {
      const historyList = HISTORY_LIST_WITH_NO_ENTRIES;

      historyListRepositoryMock.getOneById.mockResolvedValueOnce(historyList);

      const response = await request(routerApp)
        .get("/id")
        .expect(HttpStatusCode.OK)
        .send();

      expect(response.body).toEqual(historyList);
    } );
  } );
} );