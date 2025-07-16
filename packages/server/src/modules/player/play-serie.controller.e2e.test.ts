import { Application } from "express";
import request from "supertest";
import { PATH_ROUTES } from "$shared/routing";
import { EPISODES_SIMPSONS } from "#tests/main/db/fixtures";
import { loadFixtureSimpsons } from "#tests/main/db/fixtures/sets";
import { testRoute } from "#tests/main/routing";
import { createTestingAppModuleAndInit, TestingSetup } from "#tests/nestjs/app";
import { SeriesModule } from "#modules/series/module";
import { EpisodesModule } from "#episodes/module";
import { EpisodeHistoryEntriesModule } from "#episodes/history/module";
import { PlayService } from "./PlayService";
import { PlaySerieController } from "./play-serie.controller";
import { VlcBackWebSocketsServerService } from "./player-services";
import { PlayerBackWebSocketsServiceMock } from "./player-services/vlc-back/tests/PlayerBackWebSocketsServiceMock";

testRoute(PATH_ROUTES.player.play.episode.withParams("serieId", "episodeId"));

describe("playSerieController", () => {
  let routerApp: Application;
  let testingSetup: TestingSetup;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [SeriesModule, EpisodesModule, EpisodeHistoryEntriesModule],
      controllers: [PlaySerieController],
      providers: [
        {
          provide: VlcBackWebSocketsServerService,
          useClass: PlayerBackWebSocketsServiceMock,
        },
        PlayService,
      ],
    }, {
      db: {
        using: "default",
      },
    } );
    await loadFixtureSimpsons();

    routerApp = testingSetup.routerApp;
  } );

  describe("requests", () => {
    it("should return 404 if episode not found", async () => {
      const response = await request(routerApp).get("/play/episode/simpsons/1234567890")
        .expect(404);

      expect(response).toBeDefined();
    } );

    it("should return 404 if serie not found", async () => {
      const response = await request(routerApp).get(`/play/episode/simpson/${ EPISODES_SIMPSONS[0].id.code}`)
        .expect(404);

      expect(response).toBeDefined();
    } );

    it("should return 200 if episode found", async () => {
      const response = await request(routerApp).get(`/play/episode/simpsons/${ EPISODES_SIMPSONS[0].id.code}`)
        .expect(200);

      expect(response).toBeDefined();
    } );
  } );
} );
