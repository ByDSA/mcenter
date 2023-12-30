import { DomainMessageBroker } from "#modules/domain-message-broker";
import { EpisodeRepository } from "#modules/episodes";
import { HistoryEntryRepository, HistoryListRepository, HistoryListService } from "#modules/historyLists";
import { SerieRepository } from "#modules/series";
import { PublicMethodsOf } from "#shared/utils/types";
import { TestMongoDatabase } from "#tests/main";
import TestDatabase from "#tests/main/db/TestDatabase";
import { EPISODES_SIMPSONS } from "#tests/main/db/fixtures";
import { loadFixtureSimpsons } from "#tests/main/db/fixtures/sets";
import { RouterApp } from "#utils/express/test";
import { Application } from "express";
import request from "supertest";
import PlaySerieController from "./PlaySerieController";
import PlayService from "./PlayService";
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

    const domainMessageBroker = new DomainMessageBroker();
    const episodeRepository = new EpisodeRepository( {
      domainMessageBroker,
    } );
    const serieRepository = new SerieRepository( {
      relationshipWithStreamFixer: null as any,
    } );
    const historyListRepository = new HistoryListRepository();
    const historyListService = new HistoryListService( {
      episodeRepository,
      historyListRepository,
      historyEntryRepository: new HistoryEntryRepository(),
    } );

    playerServiceMock = new PlayerBackWebSocketsServiceMock();
    const playService = new PlayService( {
      playerWebSocketsServerService: playerServiceMock,
    } );

    playSerieController = new PlaySerieController( {
      episodeRepository,
      serieRepository,
      playService,
      historyListService,
    } );

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