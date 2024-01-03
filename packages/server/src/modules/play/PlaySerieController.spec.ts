import { EpisodeRepository } from "#modules/episodes";
import { HistoryListService } from "#modules/historyLists";
import { PublicMethodsOf } from "#shared/utils/types";
import { TestMongoDatabase, registerSingletonIfNotAndGet } from "#tests/main";
import TestDatabase from "#tests/main/db/TestDatabase";
import { EPISODES_SIMPSONS } from "#tests/main/db/fixtures";
import { loadFixtureSimpsons } from "#tests/main/db/fixtures/sets";
import { RouterApp } from "#utils/express/test";
import { Application } from "express";
import request from "supertest";
import { container } from "tsyringe";
import PlaySerieController from "./PlaySerieController";
import { VlcBackWebSocketsServerService } from "./remote-player/vlc-back-service";
import PlayerBackWebSocketsServiceMock from "./remote-player/vlc-back-service/tests/PlayerBackWebSocketsServiceMock";

describe("PlaySerieController", () => {
  let playSerieController: PlaySerieController;
  let playerServiceMock: PublicMethodsOf<VlcBackWebSocketsServerService>;
  let routerApp: Application;
  let db: TestDatabase;

  beforeAll(async () => {
    db = new TestMongoDatabase();
    db.init();
    await db.connect();
    await db.drop();
    await loadFixtureSimpsons();

    container.registerInstance(HistoryListService, new HistoryListService( {
      episodeRepository: registerSingletonIfNotAndGet(EpisodeRepository),
    } ));

    playerServiceMock = registerSingletonIfNotAndGet(VlcBackWebSocketsServerService,PlayerBackWebSocketsServiceMock);

    playSerieController = registerSingletonIfNotAndGet(PlaySerieController);

    routerApp = RouterApp(playSerieController.getRouter());
  } );

  afterAll(async () => {
    await db.disconnect();
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  it("should router app be defined", () => {
    expect(routerApp).toBeDefined();
  } );

  it("should controller be defined", () => {
    expect(playSerieController).toBeDefined();
  } );

  it("should player service mock be defined", () => {
    expect(playerServiceMock).toBeDefined();
  } );

  describe("requests", () => {
    it("should return 404 if episode not found", async () => {
      const response = await request(routerApp).get("/simpsons/1234567890")
        .expect(404);

      expect(response).toBeDefined();
    } );

    it("should return 404 if serie not found", async () => {
      const response = await request(routerApp).get(`/simpson/${ EPISODES_SIMPSONS[0].id.innerId}`)
        .expect(404);

      expect(response).toBeDefined();
    } );

    it("should return 200 if episode found", async () => {
      const response = await request(routerApp).get(`/simpsons/${ EPISODES_SIMPSONS[0].id.innerId}`)
        .expect(200);

      expect(response).toBeDefined();
    } );
  } );
} );