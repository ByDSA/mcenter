import { EpisodeRepository } from "#modules/episodes";
import { HistoryListRepository, HistoryListService } from "#modules/historyLists";
import { SerieRepository } from "#modules/series";
import { StreamWithHistoryListRepository } from "#modules/streamsWithHistoryList";
import { TestMongoDatabase } from "#tests/main";
import TestDatabase from "#tests/main/db/TestDatabase";
import { EPISODES_SIMPSONS } from "#tests/main/db/fixtures";
import { loadFixtureSimpsons } from "#tests/main/db/fixtures/sets";
import { RouterApp } from "#utils/express/test";
import { Application } from "express";
import request from "supertest";
import PlaySerieController from "./PlaySerieController";
import PlayService from "./PlayService";
import { MediaElement } from "./player";
import { PlayerServiceMock } from "./tests";

describe("PlaySerieController", () => {
  let playSerieController: PlaySerieController;
  let playerServiceMock: PlayerServiceMock;
  let routerApp: Application;
  let db: TestDatabase;

  beforeAll(async () => {
    db = new TestMongoDatabase();
    db.init();
    await db.connect();
    await db.drop();
    await loadFixtureSimpsons();

    const episodeRepository = new EpisodeRepository();
    const serieRepository = new SerieRepository();
    const historyListService = new HistoryListService( {
      episodeRepository,
      historyRepository: new HistoryListRepository(),
    } );
    const streamWithHistoryListRepository = new StreamWithHistoryListRepository();

    playerServiceMock = new PlayerServiceMock();
    const playService = new PlayService( {
      historyListService,
      playerService: playerServiceMock,
      streamWithHistoryListRepository,

    } );

    playSerieController = new PlaySerieController( {
      episodeRepository,
      serieRepository,
      playService,
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
      const response = await request(routerApp).get(`/simpson/${ EPISODES_SIMPSONS[0].episodeId}`)
        .expect(404);

      expect(response).toBeDefined();
    } );

    it("should return 200 if episode found", async () => {
      const response = await request(routerApp).get(`/simpsons/${ EPISODES_SIMPSONS[0].episodeId}`)
        .expect(200);

      expect(response).toBeDefined();
    } );
    it("should call play function in PlayerService", async () => {
      const response = await request(routerApp).get(`/simpsons/${ EPISODES_SIMPSONS[0].episodeId}`)
        .expect(200);

      expect(response).toBeDefined();

      expect(playerServiceMock.play).toBeCalled();
      const expectedMediaElements = [
        {
          "length": EPISODES_SIMPSONS[0].end - EPISODES_SIMPSONS[0].start,
          "path": `${process.env.MEDIA_PATH }/${EPISODES_SIMPSONS[0].path}}`,
          "startTime": EPISODES_SIMPSONS[0].start,
          "stopTime": EPISODES_SIMPSONS[0].end,
          "title": EPISODES_SIMPSONS[0].title,
        },
      ];
      const actualMediaElements: MediaElement[] = playerServiceMock.play.mock.calls[0][0];

      expect(actualMediaElements.length).toBe(1);

      const actualMediaElement = actualMediaElements[0];

      expect(actualMediaElement.title).toBe(expectedMediaElements[0].title);
    } );
  } );
} );