import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureMusicFileInfos } from "$sharedSrc/models/musics/file-info/tests/fixtures";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { Types } from "mongoose";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { createMockedModule, createMockProvider } from "#utils/nestjs/tests";
import { MusicHistoryModule } from "#musics/history/module";
import { MusicsCrudModule } from "#musics/crud/module";
import { MusicsRepository } from "#musics/crud/repository";
import { fixtureMusics } from "#musics/tests";
import { PlayService } from "../play.service";
import { AuthPlayerService } from "../AuthPlayer.service";
import { PlayMusicController } from "./controller";
import { PlayMusicService } from "./service";

describe("playMusicController", () => {
  let routerApp: Application;
  let testingSetup: TestingSetup;
  let remotePlayerId = new Types.ObjectId().toString();

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
        createMockedModule(MusicsCrudModule),
        createMockedModule(MusicHistoryModule),
      ],
      controllers: [PlayMusicController],
      providers: [
        createMockProvider(PlayService),
        createMockProvider(AuthPlayerService),
        PlayMusicService,
      ],
    }, {
      auth: {
        repositories: "mock",
        cookies: "mock",
      },
    } );

    routerApp = testingSetup.routerApp;

    testingSetup.getMock(MusicsRepository).getOneBySlug
      .mockResolvedValue( {
        ...fixtureMusics.Disk.Samples.DK,
        fileInfos: [
          fixtureMusicFileInfos.Disk.Samples.DK,
        ],
      } );

    await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);
  } );

  describe("requests", () => {
    it("should return 422 if music not found", async () => {
      testingSetup.getMock(MusicsRepository).getOneBySlug
        .mockResolvedValueOnce(null);
      const response = await request(routerApp).get(`/play/${remotePlayerId}/music/not-found`)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(response).toBeDefined();
    } );

    it("should return 200 if episode found", async () => {
      const spy = jest.spyOn(testingSetup.module.get(PlayService), "play");
      const response = await request(routerApp).get(`/play/${remotePlayerId}/music/dk`)
        .expect(HttpStatus.OK);

      expect(response).toBeDefined();
      expect(spy).toHaveBeenCalledTimes(1);
    } );
  } );
} );
