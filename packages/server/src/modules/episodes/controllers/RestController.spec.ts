import { registerSingletonIfNotAndGet } from "#tests/main";
import { EPISODES_SIMPSONS } from "#tests/main/db/fixtures";
import { RouterApp } from "#utils/express/test";
import { resolveRequired } from "#utils/layers/deps";
import { Application } from "express";
import request from "supertest";
import { container } from "tsyringe";
import HttpStatusCode from "#shared/utils/http/StatusCode";
import { Episode, EpisodeGetManyBySearchRequest } from "#shared/models/episodes";
import { Repository } from "../repositories";
import { EpisodeRepositoryMock as RepositoryMock } from "../repositories/tests";
import RestController from "./RestController";

describe("RestController", () => {
  let routerApp: Application;
  let episodeRepositoryMock: RepositoryMock;
  let controller: RestController;

  beforeAll(async () => {
    registerSingletonIfNotAndGet(Repository, RepositoryMock);
    episodeRepositoryMock = resolveRequired(Repository) as RepositoryMock;

    container.registerSingleton(RestController);

    controller = container.resolve(RestController);

    controller.getManyBySearch = jest.fn(controller.getManyBySearch);
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

  describe("get one episode by serieId and innerId", () => {
    const URL = "/serieId/innerId";

    it("should call repository", async () => {
      await request(routerApp)
        .get(URL)
        .send();

      expect(episodeRepositoryMock.getOneById).toBeCalledTimes(1);
      expect(episodeRepositoryMock.getOneById).toBeCalledWith( {
        serieId: "serieId",
        innerId: "innerId",
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

  describe("patch one episode by serieId, innerId and partial episode", () => {
    const URL = "/serieId/innerId";
    const validPartial: Partial<Episode> = {
      title: "new title",
    };

    it("shuld not throw 422 if validation works", async () => {
      const partial: Partial<Episode> = {
        title: "new title",
      };
      const response = await request(routerApp)
        .patch(URL)
        .send( {
          entity: partial,
        } );

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
        .send( {
          entity: validPartial,
        } );

      expect(episodeRepositoryMock.patchOneByIdAndGet).toBeCalledTimes(1);
      expect(episodeRepositoryMock.patchOneByIdAndGet).toBeCalledWith( {
        serieId: "serieId",
        innerId: "innerId",
      }, validPartial);
    } );

    it("should return 404 if id is not found in repository", async () => {
      episodeRepositoryMock.patchOneByIdAndGet.mockResolvedValueOnce(null);
      await request(routerApp)
        .patch("/serieId/notfoundId")
        .expect(HttpStatusCode.NOT_FOUND)
        .send( {
          entity: validPartial,
        } );

      expect(episodeRepositoryMock.patchOneByIdAndGet).toHaveReturnedWith(Promise.resolve(null));
    } );

    it("should return same as repository returns", async () => {
      const episode = EPISODES_SIMPSONS[0];

      episodeRepositoryMock.patchOneByIdAndGet.mockResolvedValueOnce(episode);

      const response = await request(routerApp)
        .patch(URL)
        .send( {
          entity: validPartial,
        } );

      expect(response.body).toEqual( {
        entity: episode,
      } );
      expect(response.statusCode).toBe(HttpStatusCode.OK);
    } );
  } );

  describe("get many episodes by search", () => {
    const URL = "/search";
    const path = "series/simpsons/1/1_80.mkv";
    const body: EpisodeGetManyBySearchRequest["body"] = {
      filter: {
        path,
      },
    };

    it("should call controller", async () => {
      await request(routerApp)
        .post(URL)
        .send(body);

      expect(controller.getManyBySearch).toBeCalledTimes(1);
    } );

    it("should call repository", async () => {
      await request(routerApp)
        .post(URL)
        .send(body);

      expect(episodeRepositoryMock.getOneByPath).toBeCalledTimes(1);
      expect(episodeRepositoryMock.getOneByPath).toBeCalledWith(path);
    } );
    it("should return valid episode", async () => {
      const episode = EPISODES_SIMPSONS[0];

      episodeRepositoryMock.getOneByPath.mockResolvedValueOnce(episode);
      const response = await request(routerApp)
        .post(URL)
        .send(body);

      expect(response.body).toEqual([episode]);
    } );

    it("should return empty array", async () => {
      const response = await request(routerApp)
        .post(URL)
        .send(body);

      episodeRepositoryMock.getOneByPath.mockResolvedValueOnce(null);

      expect(response.body).toEqual([]);
    } );
  } );
} );