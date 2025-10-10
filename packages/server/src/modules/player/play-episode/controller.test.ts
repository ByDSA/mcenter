import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { SERIE_SIMPSONS } from "$sharedSrc/models/series/tests/fixtures";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { Types } from "mongoose";
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
import { UUID_INVALID, UUID_UNUSED } from "#core/db/tests/fixtures/uuid";
import { PlayVideoService } from "../play-video.service";
import { PlayService } from "../play.service";
import { AuthPlayerService } from "../AuthPlayer.service";
import { PlayEpisodeController } from "./controller";

describe("playEpisodeController", () => {
  let routerApp: Application;
  let testingSetup: TestingSetup;
  let remotePlayerId = new Types.ObjectId().toString();

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
        createMockProvider(AuthPlayerService),
        PlayVideoService,
      ],
    }, {
      auth: {
        repositories: "mock",
        cookies: "mock",
      },
    } );

    routerApp = testingSetup.routerApp;

    testingSetup.getMock(EpisodesRepository).getOneByCompKey
      .mockResolvedValue(fixtureEpisodes.Simpsons.Samples.EP1x01);
    testingSetup.getMock(SeriesRepository).getOneByKey
      .mockResolvedValue(SERIE_SIMPSONS);
    testingSetup.getMock(StreamsRepository).getOneOrCreateBySeriesKey
      .mockResolvedValue(STREAM_SIMPSONS);

    await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);
  } );

  describe("requests", () => {
    it("should return 422 if serie not found", async () => {
      testingSetup.getMock(SeriesRepository).getOneByKey
        .mockResolvedValueOnce(null);
      const response = await request(routerApp).get(`/play/${remotePlayerId}/episode/not-found/1x01`)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(response).toBeDefined();
    } );

    it("should return 422 if episode id is not UUID", async () => {
      testingSetup.getMock(EpisodesRepository).getOneByCompKey
        .mockResolvedValueOnce(null);
      const response = await request(routerApp).get(`/play/${remotePlayerId}/episode/simpsons/${UUID_INVALID}`)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(response).toBeDefined();
    } );

    it("should return 422 if episode id not exists", async () => {
      testingSetup.getMock(EpisodesRepository).getOneByCompKey
        .mockResolvedValueOnce(null);
      const response = await request(routerApp).get(`/play/${remotePlayerId}/episode/simpsons/${UUID_UNUSED}`)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(response).toBeDefined();
    } );

    it("should return 200 if episode found", async () => {
      const spy = jest.spyOn(testingSetup.module.get(PlayService), "play");
      const response = await request(routerApp).get(`/play/${remotePlayerId}/episode/simpsons/1x01`)
        .expect(HttpStatus.OK);

      expect(response).toBeDefined();
      expect(spy).toHaveBeenCalledTimes(1);
    } );
  } );
} );
