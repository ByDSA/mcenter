import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { SeriesModule } from "#modules/series/module";
import { EpisodeHistoryModule } from "#episodes/history/module";
import { fixtureEpisodes } from "#episodes/tests";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { createMockedModule, createMockProvider } from "#utils/nestjs/tests";
import { EpisodePickerModule } from "#modules/episode-picker/module";
import { EpisodePickerService } from "#modules/episode-picker";
import { StreamsModule } from "#modules/streams/module";
import { StreamsRepository } from "#modules/streams/crud/repository";
import { STREAM_SIMPSONS } from "#modules/streams/tests";
import { PlayVideoService } from "../play-video.service";
import { PlayService } from "../play.service";
import { PlayStreamController } from "./controller";

describe("playStreamController", () => {
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
      controllers: [PlayStreamController],
      providers: [
        createMockProvider(PlayService),
        PlayVideoService,
      ],
    } );

    routerApp = testingSetup.routerApp;

    testingSetup.getMock(StreamsRepository).getOneByKey
      .mockResolvedValue(STREAM_SIMPSONS);
    testingSetup.getMock(EpisodePickerService).getByStream
      .mockResolvedValue([fixtureEpisodes.Simpsons.Samples.EP1x01]);
  } );

  describe("requests", () => {
    it("should return 422 if stream not found", async () => {
      testingSetup.getMock(StreamsRepository).getOneByKey
        .mockResolvedValueOnce(null);
      const response = await request(routerApp).get("/play/stream/not-found/1")
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(response).toBeDefined();
    } );

    it("should return 422 if no episodes found", async () => {
      testingSetup.getMock(EpisodePickerService).getByStream
        .mockResolvedValueOnce([]);
      const response = await request(routerApp).get("/play/stream/simpsons/1")
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(response).toBeDefined();
    } );

    it("should return 422 if episodes are null/undefined", async () => {
      testingSetup.getMock(EpisodePickerService).getByStream
        .mockResolvedValueOnce([null, undefined] as any[]);
      const response = await request(routerApp).get("/play/stream/simpsons/1")
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(response).toBeDefined();
    } );

    it("should return 200 if stream and episodes found", async () => {
      const spy = jest.spyOn(testingSetup.module.get(PlayService), "play");
      const response = await request(routerApp).get("/play/stream/simpsons/1")
        .expect(HttpStatus.OK);

      expect(response).toBeDefined();
      expect(spy).toHaveBeenCalledTimes(1);
    } );

    it("should handle force parameter correctly", async () => {
      const spy = jest.spyOn(testingSetup.module.get(PlayService), "play");
      const response = await request(routerApp)
        .get("/play/stream/simpsons/1")
        .query( {
          force: true,
        } )
        .expect(HttpStatus.OK);

      expect(response).toBeDefined();
      expect(spy).toHaveBeenCalledWith( {
        mediaElements: expect.any(Array),
        force: true,
      } );
    } );

    it("should call EpisodePickerService with correct parameters", async () => {
      const episodePickerSpy = testingSetup.getMock(EpisodePickerService).getByStream;

      await request(routerApp).get("/play/stream/simpsons-stream/5")
        .expect(HttpStatus.OK);

      expect(episodePickerSpy).toHaveBeenCalledWith(
        STREAM_SIMPSONS,
        5,
        {
          expand: ["series", "fileInfos"],
        },
      );
    } );
  } );
} );
