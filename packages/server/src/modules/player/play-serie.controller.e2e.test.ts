import { Application } from "express";
import request from "supertest";
import { PATH_ROUTES } from "$shared/routing";
import { SeriesModule } from "#modules/series/module";
import { EpisodesModule } from "#episodes/module";
import { EpisodeHistoryEntriesModule } from "#episodes/history/module";
import { StreamsRepository } from "#modules/streams/rest/repository";
import { fixtureEpisodes } from "#episodes/tests";
import { PlayService } from "./play.service";
import { PlaySerieController } from "./play-serie.controller";
import { VlcBackWebSocketsServerService } from "./player-services";
import { PlayerBackWebSocketsServiceMock } from "./player-services/vlc-back/tests";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { testRoute } from "#core/routing/test";
import { loadFixtureSimpsons } from "#core/db/tests/fixtures/sets";

testRoute(PATH_ROUTES.player.play.episode.withParams("seriesKey", "episodeKey"));

const EPISODES_SIMPSONS = fixtureEpisodes.Simpsons.List;

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
        StreamsRepository,
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
      const response = await request(routerApp).get(`/play/episode/simpson/${ EPISODES_SIMPSONS[0].compKey.episodeKey}`)
        .expect(404);

      expect(response).toBeDefined();
    } );

    it("should return 200 if episode found", async () => {
      const response = await request(routerApp).get(`/play/episode/${ EPISODES_SIMPSONS[0].compKey.seriesKey}/${ EPISODES_SIMPSONS[0].compKey.episodeKey}`)
        .expect(200);

      expect(response).toBeDefined();
    } );
  } );
} );
