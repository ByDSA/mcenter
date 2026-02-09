import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { UserPayload } from "$shared/models/auth";
import z from "zod";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { mockMongoId } from "#tests/mongo";
import { fixtureEpisodeFileInfos } from "#episodes/file-info/tests";
import { fixtureEpisodes } from "#episodes/tests";
import { EpisodeEntityWithFileInfos, episodeEntityWithFileInfosSchema } from "#episodes/models";
import { AuthPlayerService } from "../AuthPlayer.service";
import { PlayEpisodeService } from "../play-episode/service";
import { fixturesRemotePlayers } from "../tests/fixtures";
import { PlayStreamController } from "./controller";

const EPISODE_WITH_FILE_INFO: EpisodeEntityWithFileInfos = {
  ...fixtureEpisodes.SampleSeries.Samples.EP1x01,
  fileInfos: [fixtureEpisodeFileInfos.SampleSeries.Samples.EP1x01],
};

describe("playStreamController", () => {
  let testingSetup: TestingSetup;
  let routerApp: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;
  const validRemotePlayerId = mockMongoId;
  const invalidRemotePlayerId = "invalidId";
  const validControllerUrl = `/play/${validRemotePlayerId}/stream`;
  const invalidControllerUrl = `/play/${invalidRemotePlayerId}/stream`;

  async function initMocks(setup: TestingSetup) {
    const ret = {
      playVideoService: setup.getMock(PlayEpisodeService),
      authPlayerService: setup.getMock(AuthPlayerService),
    };

    ret.playVideoService.playEpisodeStream.mockResolvedValue([EPISODE_WITH_FILE_INFO]);
    ret.authPlayerService.guardToken.mockResolvedValue(fixturesRemotePlayers.valid);

    // User
    await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles as UserPayload);

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
      ],
      controllers: [PlayStreamController],
      providers: [
        getOrCreateMockProvider(PlayEpisodeService),
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

  describe("playStreamDefault", () => {
    it("should go ok", async () => {
      const res = await request(routerApp)
        .get(`${validControllerUrl}/streamKey`);
      const data = z.array(episodeEntityWithFileInfosSchema).parse(res.body.data);

      expect(data).toEqual([EPISODE_WITH_FILE_INFO]);
      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("params", ()=> {
      it("invalid remotePlayerId", async () => {
        const res = await request(routerApp)
          .get(`${invalidControllerUrl}/streamKey`);

        expect(mocks.authPlayerService.guardUser).not.toHaveBeenCalled();

        expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      } );

      it("should fail without user", async () => {
        await testingSetup.useMockedUser(null);
        const res = await request(routerApp)
          .get(`${validControllerUrl}/streamKey`);

        expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      } );
    } );
  } );

  describe("playStreamWithToken", () => {
    it("should fail without user nor token", async () => {
      await testingSetup.useMockedUser(null);
      const res = await request(routerApp)
        .post(`${validControllerUrl}/streamKey`);

      expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    } );

    it("should not fail without user but with token", async () => {
      await testingSetup.useMockedUser(null);
      const res = await request(routerApp)
        .post(`${validControllerUrl}/streamKey`)
        .send( {
          secretToken: "123456",
        } );

      expect(res.statusCode).toBe(HttpStatus.ACCEPTED);
    } );
  } );
} );
