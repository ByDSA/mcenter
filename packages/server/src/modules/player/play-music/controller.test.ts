import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { UserPayload } from "$shared/models/auth";
import { fixtureMusicFileInfos } from "$shared/models/musics/file-info/tests/fixtures";
import { MusicEntityWithFileInfos } from "$shared/models/musics";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { fixtureMusics } from "#musics/tests";
import { AuthPlayerService } from "../AuthPlayer.service";
import { fixturesRemotePlayers } from "../tests/fixtures";
import { PlayMusicController } from "./controller";
import { PlayMusicService } from "./service";

const MUSIC_WITH_FILE_INFO: MusicEntityWithFileInfos = {
  ...fixtureMusics.Disk.Samples.DK,
  fileInfos: [fixtureMusicFileInfos.Disk.Samples.DK],
};

describe("playMusicController", () => {
  let testingSetup: TestingSetup;
  let routerApp: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;
  let remotePlayerId = fixturesRemotePlayers.valid.id;

  async function initMocks(setup: TestingSetup) {
    const ret = {
      playMusicService: setup.getMock(PlayMusicService),
      authPlayerService: setup.getMock(AuthPlayerService),
    };

    ret.playMusicService.playMusic.mockResolvedValue([MUSIC_WITH_FILE_INFO]);

    // User
    await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles as UserPayload);

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
      ],
      controllers: [PlayMusicController],
      providers: [
        getOrCreateMockProvider(PlayMusicService),
        getOrCreateMockProvider(AuthPlayerService),
      ],
    }, {
      auth: {
        repositories: "mock",
        cookies: "mock",
      },
    } );

    routerApp = testingSetup.routerApp;

    mocks = await initMocks(testingSetup);
  } );

  beforeEach(()=> {
    jest.clearAllMocks();
  } );

  const validControllerUrl = `/play/${remotePlayerId}/music`;
  const invalidControllerUrl = "/play/invalidRemotePlayerId/music";

  it("invalid controller params", async () => {
    const response = await request(routerApp)
      .get(invalidControllerUrl + "/music-slug");

    expect(response.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  } );

  describe("playMusic", () => {
    const validUrl = validControllerUrl + "/music-slug";

    it("should return 200 if episode found", async () => {
      const res = await request(routerApp).get(validUrl);

      expect(res.statusCode).toBe(HttpStatus.OK);

      expect(mocks.playMusicService.playMusic).toHaveBeenCalled();
    } );
  } );
} );
