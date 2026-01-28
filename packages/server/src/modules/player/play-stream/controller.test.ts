import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { UserPayload } from "$shared/models/auth";
import { Types } from "mongoose";
import { SeriesModule } from "#episodes/series/module";
import { EpisodeHistoryModule } from "#episodes/history/module";
import { fixtureEpisodes } from "#episodes/tests";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { createMockedModule, createMockProvider } from "#utils/nestjs/tests";
import { StreamPickerModule } from "#episodes/streams/picker/module";
import { EpisodePickerService } from "#episodes/streams/picker";
import { StreamsModule } from "#episodes/streams/module";
import { StreamsRepository } from "#episodes/streams/crud/repository";
import { STREAM_SIMPSONS } from "#episodes/streams/tests";
import { fixturesRemotePlayers } from "../tests/fixtures";
import { mockRemotePlayersRepositoryProvider } from "../player-services/repository/tests/repository";
import { SecretTokenBody } from "../model";
import { AuthPlayerService } from "../AuthPlayer.service";
import { PlayService } from "../play.service";
import { PlayVideoService } from "../play-video.service";
import { PlayStreamController } from "./controller";

describe("playStreamController", () => {
  let routerApp: Application;
  let testingSetup: TestingSetup;
  let remotePlayerId = new Types.ObjectId().toString();

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
        createMockedModule(SeriesModule),
        createMockedModule(StreamsModule),
        createMockedModule(EpisodesCrudModule),
        createMockedModule(StreamPickerModule),
        createMockedModule(EpisodeHistoryModule),
      ],
      controllers: [PlayStreamController],
      providers: [
        createMockProvider(PlayService),
        createMockProvider(AuthPlayerService),
        PlayVideoService,
        mockRemotePlayersRepositoryProvider,
      ],
    }, {
      auth: {
        repositories: "mock",
        cookies: "mock",
      },
    } );

    routerApp = testingSetup.routerApp;

    testingSetup.getMock(StreamsRepository).getOneByKey
      .mockResolvedValue(STREAM_SIMPSONS);
    testingSetup.getMock(StreamsRepository).getOneById
      // eslint-disable-next-line require-await
      .mockImplementation(async id=> id === STREAM_SIMPSONS.id ? STREAM_SIMPSONS : null);
    testingSetup.getMock(EpisodePickerService).getByStream
      .mockResolvedValue([fixtureEpisodes.Simpsons.Samples.EP1x01]);

    // User
    await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles as UserPayload);
  } );

  describe("requests GET", () => {
    it("should return 422 if stream not found", async () => {
      testingSetup.getMock(StreamsRepository).getOneByKey
        .mockResolvedValueOnce(null);
      const response = await request(routerApp).get(`/play/${remotePlayerId}/stream/not-found?n=1`)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(response).toBeDefined();
    } );

    it("should return 422 if no episodes found", async () => {
      testingSetup.getMock(EpisodePickerService).getByStream
        .mockResolvedValueOnce([]);
      const response = await request(routerApp).get(`/play/${remotePlayerId}/stream/simpsons?n=1`)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(response).toBeDefined();
    } );

    it("should return 422 if episodes are null/undefined", async () => {
      testingSetup.getMock(EpisodePickerService).getByStream
        .mockResolvedValueOnce([null, undefined] as any[]);
      const response = await request(routerApp).get(`/play/${remotePlayerId}/stream/simpsons?n=1`)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(response).toBeDefined();
    } );

    it("should return 200 if stream and episodes found", async () => {
      const spy = jest.spyOn(testingSetup.module.get(PlayService), "play");
      const response = await request(routerApp).get(`/play/${remotePlayerId}/stream/simpsons?n=1`)
        .expect(HttpStatus.OK);

      expect(response).toBeDefined();
      expect(spy).toHaveBeenCalledTimes(1);
    } );

    it("should handle force parameter correctly", async () => {
      const spy = jest.spyOn(testingSetup.module.get(PlayService), "play");
      const response = await request(routerApp)
        .get(`/play/${remotePlayerId}/stream/simpsons?n=1`)
        .query( {
          force: true,
        } )
        .expect(HttpStatus.OK);

      expect(response).toBeDefined();
      expect(spy).toHaveBeenCalledWith( {
        mediaElements: expect.any(Array),
        force: true,
        remotePlayerId,
      } );
    } );

    it("should call EpisodePickerService with correct parameters", async () => {
      const episodePickerSpy = testingSetup.getMock(EpisodePickerService).getByStream;

      await request(routerApp).get(`/play/${remotePlayerId}/stream/simpsons-stream?n=5`)
        .expect(HttpStatus.OK);

      expect(episodePickerSpy).toHaveBeenCalledTimes(5);
    } );
  } );

  describe("requests POST", () => {
    it("should call EpisodePickerService with correct parameters", async () => {
      const episodePickerSpy = testingSetup.getMock(EpisodePickerService).getByStream;

      await request(routerApp).post(`/play/${remotePlayerId}/stream/simpsons-stream?n=5`)
        .send( {
          secretToken: fixturesRemotePlayers.valid.secretToken,
        } satisfies SecretTokenBody)
        .expect(HttpStatus.ACCEPTED);

      expect(episodePickerSpy).toHaveBeenCalledTimes(5);
    } );
  } );
} );
