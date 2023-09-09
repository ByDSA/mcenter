import { Episode } from "#shared/models/episodes";
import HttpStatusCode from "#shared/utils/http/StatusCode";
import { EPISODES_SIMPSONS } from "#tests/main/db/fixtures";
import { RouterApp } from "#utils/express/test";
import { Application } from "express";
import request from "supertest";
import { EpisodeRepositoryMock as RepositoryMock } from "../repositories/tests";
import RestController from "./RestController";

describe("RestController", () => {
  let routerApp: Application;
  let episodeRepositoryMock: RepositoryMock;

  beforeAll(async () => {
    episodeRepositoryMock = new RepositoryMock();
    const controller = new RestController( {
      episodeRepository: episodeRepositoryMock,
    } );

    routerApp = RouterApp(controller.getRouter());
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  it("should be defined", () => {
    expect(episodeRepositoryMock).toBeDefined();
    expect(routerApp).toBeDefined();
  } );

  describe("get all episodes by serieId", () => {
    it("should call repository", async () => {
      await request(routerApp)
        .get("/serieId")
        .send();

      expect(episodeRepositoryMock.getAllBySerieId).toBeCalledTimes(1);
      expect(episodeRepositoryMock.getAllBySerieId).toBeCalledWith("serieId");
    } );

    it("should return [] if serieId is not found in repository", async () => {
      episodeRepositoryMock.getAllBySerieId.mockResolvedValueOnce([]);
      await request(routerApp)
        .get("/notfoundId")
        .expect(HttpStatusCode.OK)
        .send();

      expect(episodeRepositoryMock.getAllBySerieId).toHaveReturnedWith(Promise.resolve([]));
    } );

    it("should return same as repository returns", async () => {
      const episodes = EPISODES_SIMPSONS;

      episodeRepositoryMock.getAllBySerieId.mockResolvedValueOnce(episodes);

      const response = await request(routerApp)
        .get("/id")
        .expect(HttpStatusCode.OK)
        .send();

      expect(response.body).toEqual(episodes);
    } );
  } );

  describe("get one episode by serieId and episodeId", () => {
    const URL = "/serieId/episodeId";

    it("should call repository", async () => {
      await request(routerApp)
        .get(URL)
        .send();

      expect(episodeRepositoryMock.getOneById).toBeCalledTimes(1);
      expect(episodeRepositoryMock.getOneById).toBeCalledWith( {
        serieId: "serieId",
        episodeId: "episodeId",
      } );
    } );

    it("should return 404 if id is not found in repository", async () => {
      episodeRepositoryMock.getOneById.mockResolvedValueOnce(null);
      await request(routerApp)
        .get("/serieId/notfoundId")
        .expect(HttpStatusCode.NOT_FOUND)
        .send();

      expect(episodeRepositoryMock.getOneById).toHaveReturnedWith(Promise.resolve(null));
    } );

    it("should return same as repository returns", async () => {
      const episode = EPISODES_SIMPSONS[0];

      episodeRepositoryMock.getOneById.mockResolvedValueOnce(episode);

      const response = await request(routerApp)
        .get(URL)
        .expect(HttpStatusCode.OK)
        .send();

      expect(response.body).toEqual(episode);
    } );
  } );

  describe("patch one episode by serieId, episodeId and partial episode", () => {
    const URL = "/serieId/episodeId";
    const validPartial: Partial<Episode> = {
      title: "new title",
    };

    it("shuld not throw 422 if validation works", async () => {
      const partial: Partial<Episode> = {
        title: "new title",
      };
      const response = await request(routerApp)
        .patch(URL)
        .send(partial);

      expect(response.statusCode).not.toBe(HttpStatusCode.UNPROCESSABLE_ENTITY);
    } );

    it("shuld throw 422 if validation fails", async () => {
      const partial = {
        cosaRara: "new title",
      };

      await request(routerApp)
        .patch(URL)
        .send(partial)
        .expect(HttpStatusCode.UNPROCESSABLE_ENTITY);
    } );

    it("should call repository", async () => {
      await request(routerApp)
        .patch(URL)
        .send(validPartial);

      expect(episodeRepositoryMock.patchOneByIdAndGet).toBeCalledTimes(1);
      expect(episodeRepositoryMock.patchOneByIdAndGet).toBeCalledWith( {
        serieId: "serieId",
        episodeId: "episodeId",
      }, validPartial);
    } );

    it("should return 404 if id is not found in repository", async () => {
      episodeRepositoryMock.patchOneByIdAndGet.mockResolvedValueOnce(null);
      await request(routerApp)
        .patch("/serieId/notfoundId")
        .expect(HttpStatusCode.NOT_FOUND)
        .send(validPartial);

      expect(episodeRepositoryMock.patchOneByIdAndGet).toHaveReturnedWith(Promise.resolve(null));
    } );

    it("should return same as repository returns", async () => {
      const episode = EPISODES_SIMPSONS[0];

      episodeRepositoryMock.patchOneByIdAndGet.mockResolvedValueOnce(episode);

      const response = await request(routerApp)
        .patch(URL)
        .send(validPartial);

      expect(response.body).toEqual(episode);
      expect(response.statusCode).toBe(HttpStatusCode.OK);
    } );
  } );
} );