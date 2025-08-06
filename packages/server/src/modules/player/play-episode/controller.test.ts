import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { SERIE_SIMPSONS } from "$sharedSrc/models/series/tests/fixtures";
import { SeriesModule } from "#modules/series/module";
import { EpisodeHistoryModule } from "#episodes/history/module";
import { fixtureEpisodes } from "#episodes/tests";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { createMockedModule, createMockProvider } from "#utils/nestjs/tests";
import { EpisodePickerModule } from "#modules/episode-picker/module";
import { StreamsModule } from "#modules/streams/module";
import { EpisodesRepository } from "#episodes/crud/repository";
import { SeriesRepository } from "#modules/series/crud/repository";
import { StreamsRepository } from "#modules/streams/crud/repository";
import { STREAM_SIMPSONS } from "#modules/streams/tests";
import { PlayVideoService } from "../play-video.service";
import { PlayService } from "../play.service";
import { PlayEpisodeController } from "./controller";

describe("playEpisodeController", () => {
  let routerApp: Application;
  let testingSetup: TestingSetup;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
        createMockedModule(SeriesModule),
        createMockedModule(StreamsModule),
        createMockedModule(EpisodesCrudModule),
        createMockedModule(EpisodePickerModule),
        createMockedModule(EpisodeHistoryModule),
      ],
      controllers: [PlayEpisodeController],
      providers: [
        createMockProvider(PlayService),
        PlayVideoService,
      ],
    } );

    routerApp = testingSetup.routerApp;

    testingSetup.getMock(EpisodesRepository).getOneByCompKey
      .mockResolvedValue(fixtureEpisodes.Simpsons.Samples.EP1x01);
    testingSetup.getMock(SeriesRepository).getOneByKey
      .mockResolvedValue(SERIE_SIMPSONS);
    testingSetup.getMock(StreamsRepository).getOneOrCreateBySeriesKey
      .mockResolvedValue(STREAM_SIMPSONS);
  } );

  describe("requests", () => {
    it("should return 404 if serie not found", async () => {
      testingSetup.getMock(SeriesRepository).getOneByKey
        .mockResolvedValueOnce(null);
      const response = await request(routerApp).get("/play/episode/not-found/1x01")
        .expect(HttpStatus.NOT_FOUND);

      expect(response).toBeDefined();
    } );

    it("should return 404 if episode not found", async () => {
      testingSetup.getMock(EpisodesRepository).getOneByCompKey
        .mockResolvedValueOnce(null);
      const response = await request(routerApp).get("/play/episode/simpsons/not-found")
        .expect(HttpStatus.NOT_FOUND);

      expect(response).toBeDefined();
    } );

    it("should return 200 if episode found", async () => {
      const spy = jest.spyOn(testingSetup.module.get(PlayService), "play");
      const response = await request(routerApp).get("/play/episode/simpsons/1x01")
        .expect(HttpStatus.OK);

      expect(response).toBeDefined();
      expect(spy).toHaveBeenCalledTimes(1);
    } );
  } );
} );
