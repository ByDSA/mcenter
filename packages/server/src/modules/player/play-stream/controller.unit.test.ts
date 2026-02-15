import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { UserPayload } from "$shared/models/auth";
import z from "zod";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { mockMongoId } from "#tests/mongo";
import { fixtureEpisodes } from "#episodes/tests";
import { EpisodeEntityWithFileInfos, episodeEntityWithFileInfosSchema } from "#episodes/models";
import { expectControllerFinishRequest, testFailValidation, testManyAuth, testValidation } from "#core/auth/strategies/token/tests";
import { fixturesRemotePlayers } from "../tests/fixtures";
import { PlayEpisodeService } from "../play-episode/service";
import { AuthPlayerService } from "../AuthPlayer.service";
import { PlayStreamController } from "./controller";

const EPISODE_WITH_FILE_INFO: EpisodeEntityWithFileInfos = fixtureEpisodes.SampleSeries
  .Episodes.FullSamples.EP1x01;

describe("playStreamController", () => {
  let testingSetup: TestingSetup;
  let router: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;
  const validRemotePlayerId = mockMongoId;
  const invalidRemotePlayerId = "invalidId";
  const validStreamKey = "streamKey";
  const validControllerUrl = `/play/${validRemotePlayerId}/stream`;
  const invalidControllerUrl = `/play/${invalidRemotePlayerId}/stream`;

  async function initMocks() {
    const ret = {
      playVideoService: testingSetup.getMock(PlayEpisodeService),
      authPlayerService: testingSetup.getMock(AuthPlayerService),
    };

    ret.playVideoService.playEpisodeStream.mockResolvedValue([EPISODE_WITH_FILE_INFO]);
    ret.authPlayerService.guardToken.mockResolvedValue(fixturesRemotePlayers.valid);
    ret.authPlayerService.guardUser.mockResolvedValue(undefined);

    await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles as UserPayload);

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [],
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

    router = testingSetup.routerApp;

    mocks = await initMocks();
  } );

  beforeEach(async () => {
    jest.clearAllMocks();
    await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);
  } );

  describe("playStreamDefault (GET)", () => {
    const validUrl = `${validControllerUrl}/${validStreamKey}`;
    const invalidIdUrl = `${invalidControllerUrl}/${validStreamKey}`;

    it("valid request-response", async () => {
      const res = await request(router)
        .get(validUrl);

      expectControllerFinishRequest();

      const data = z.array(episodeEntityWithFileInfosSchema).parse(res.body.data);

      expect(data).toEqual([EPISODE_WITH_FILE_INFO]);
      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("path parameters validation", () => {
      testFailValidation("invalid remotePlayerId", {
        request: () => request(router)
          .get(invalidIdUrl),
      } );

      it("missing streamKey", async () => {
        const res = await request(router)
          .get(validControllerUrl);

        expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      } );
    } );

    describe("query parameters validation", () => {
      testValidation("force parameter (true)", {
        request: ()=>request(router)
          .get(validUrl)
          .query( {
            force: "true",
          } ),
        shouldPass: true,
      } );

      testValidation("force parameter (false)", {
        request: () => request(router).get(validUrl)
          .query( {
            force: "false",
          } ),
        shouldPass: true,
      } );

      testValidation("force parameter (1)", {
        request: () => request(router)
          .get(validUrl)
          .query( {
            force: "invalid",
          } ),
        shouldPass: false,
      } );

      testValidation("force parameter (0)", {
        request: () => request(router).get(validUrl)
          .query( {
            force: "0",
          } ),
        shouldPass: true,
      } );

      testFailValidation("invalid force parameter", {
        request: () => request(router)
          .get(validUrl)
          .query( {
            force: "invalid",
          } ),
      } );

      testValidation("n parameter", {
        request: () => request(router)
          .get(validUrl)
          .query( {
            n: "5",
          } ),
        shouldPass: true,
      } );

      testFailValidation("n parameter (not a number)", {
        request: () => request(router)
          .get(validUrl)
          .query( {
            n: "notANumber",
          } ),
      } );

      testValidation("multiple query params", {
        request: () => request(router).get(validUrl)
          .query( {
            force: "true",
            n: "10",
          } ),
        shouldPass: true,
      } );
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: ()=>request(router).get(validUrl),
        list: [
          {
            user: null,
            shouldPass: false,
          },
          {
            user: fixtureUsers.Normal.UserWithRoles,
            shouldPass: true,
          },
          {
            user: fixtureUsers.Admin.UserWithRoles,
            shouldPass: true,
          },
        ],
      } );
    } );

    describe("repositories", () => {
      it("should call authPlayerService.guardUser", async () => {
        await request(router)
          .get(validUrl);

        expect(mocks.authPlayerService.guardUser).toHaveBeenCalledTimes(1);
        expect(mocks.authPlayerService.guardUser).toHaveBeenCalledWith( {
          userId: fixtureUsers.Normal.UserWithRoles.id,
          remotePlayerId: validRemotePlayerId,
        } );
      } );

      it("should call playVideoService.playEpisodeStream", async () => {
        await request(router)
          .get(validUrl);

        expect(mocks.playVideoService.playEpisodeStream).toHaveBeenCalledTimes(1);
        expect(mocks.playVideoService.playEpisodeStream).toHaveBeenCalledWith( {
          userId: fixtureUsers.Normal.UserWithRoles.id,
          remotePlayerId: validRemotePlayerId,
          streamKey: validStreamKey,
          query: {},
        } );
      } );

      it("should pass query params to playEpisodeStream", async () => {
        await request(router)
          .get(validUrl)
          .query( {
            force: "true",
            n: "5",
          } );

        expect(mocks.playVideoService.playEpisodeStream).toHaveBeenCalledWith( {
          userId: fixtureUsers.Normal.UserWithRoles.id,
          remotePlayerId: validRemotePlayerId,
          streamKey: validStreamKey,
          query: {
            force: true,
            n: 5,
          },
        } );
      } );
    } );
  } );

  describe("playStreamWithToken (POST)", () => {
    const validUrl = `${validControllerUrl}/${validStreamKey}`;
    const invalidIdUrl = `${invalidControllerUrl}/${validStreamKey}`;
    const validPayload = {
      secretToken: "123456",
    };

    beforeEach(async () => {
      await testingSetup.useMockedUser(null);
    } );

    afterEach(async () => {
      // Restore user for other tests
      await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles as UserPayload);
    } );

    it("valid request-response", async () => {
      const res = await request(router)
        .post(validUrl)
        .send(validPayload);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.ACCEPTED);
    } );

    describe("path parameters validation", () => {
      testFailValidation("invalid remotePlayerId", {
        request: () => request(router)
          .post(invalidIdUrl)
          .send(validPayload),
      } );

      it("missing streamKey", async () => {
        const res = await request(router)
          .post(validControllerUrl)
          .send(validPayload);

        expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      } );
    } );

    describe("query parameters validation", () => {
      testValidation("force parameter (true)", {
        request: () => request(router)
          .post(validUrl)
          .send(validPayload)
          .query( {
            force: "true",
          } ),
        shouldPass: true,
      } );

      testValidation("n parameter", {
        request: () => request(router)
          .post(validUrl)
          .send(validPayload)
          .query( {
            n: "10",
          } ),
        shouldPass: true,
      } );

      testFailValidation("invalid force parameter", {
        request: () => request(router)
          .post(validUrl)
          .send(validPayload)
          .query( {
            force: "invalid",
          } ),
      } );
    } );

    describe("payload validation", () => {
      testFailValidation("missing secretToken", {
        request: () => request(router)
          .post(validUrl)
          .send( {} ),
      } );

      testFailValidation("invalid secretToken type", {
        request: () => request(router)
          .post(validUrl)
          .send( {
            secretToken: 123456, // number instead of string
          } ),
      } );
    } );

    describe("repositories", () => {
      it("should call authPlayerService.guardToken", async () => {
        await request(router)
          .post(validUrl)
          .send(validPayload);

        expect(mocks.authPlayerService.guardToken).toHaveBeenCalledTimes(1);
        expect(mocks.authPlayerService.guardToken).toHaveBeenCalledWith( {
          remotePlayerId: validRemotePlayerId,
          secretToken: validPayload.secretToken,
        } );
      } );

      it("should call playVideoService.playEpisodeStream with remote player owner", async () => {
        await request(router)
          .post(validUrl)
          .send(validPayload);

        expect(mocks.playVideoService.playEpisodeStream).toHaveBeenCalledTimes(1);
        expect(mocks.playVideoService.playEpisodeStream).toHaveBeenCalledWith( {
          userId: fixturesRemotePlayers.valid.ownerId,
          remotePlayerId: validRemotePlayerId,
          streamKey: validStreamKey,
          query: {},
        } );
      } );

      it("should pass query params to playEpisodeStream", async () => {
        await request(router)
          .post(validUrl)
          .query( {
            force: "false",
            n: "3",
          } )
          .send(validPayload);

        expect(mocks.playVideoService.playEpisodeStream).toHaveBeenCalledWith( {
          userId: fixturesRemotePlayers.valid.ownerId,
          remotePlayerId: validRemotePlayerId,
          streamKey: validStreamKey,
          query: {
            force: false,
            n: 3,
          },
        } );
      } );
    } );
  } );
} );
