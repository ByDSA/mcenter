import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { UserPayload } from "$shared/models/auth";
import z from "zod";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { mockMongoId } from "#tests/mongo";
import { fixtureEpisodeFileInfos } from "#episodes/file-info/tests";
import { fixtureEpisodes } from "#episodes/tests";
import { EpisodeEntityWithFileInfos, episodeEntityWithFileInfosSchema } from "#episodes/models";
import { expectControllerNotCalled, expectControllerCalled } from "#core/auth/strategies/token/tests";
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
  let router: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;
  const validRemotePlayerId = mockMongoId;
  const invalidRemotePlayerId = "invalidId";
  const validStreamKey = "streamKey";
  const validControllerUrl = `/play/${validRemotePlayerId}/stream`;
  const invalidControllerUrl = `/play/${invalidRemotePlayerId}/stream`;

  async function initMocks(setup: TestingSetup) {
    const ret = {
      playVideoService: setup.getMock(PlayEpisodeService),
      authPlayerService: setup.getMock(AuthPlayerService),
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

    mocks = await initMocks(testingSetup);
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  describe("playStreamDefault (GET)", () => {
    const validUrl = `${validControllerUrl}/${validStreamKey}`;
    const invalidIdUrl = `${invalidControllerUrl}/${validStreamKey}`;

    it("valid request-response", async () => {
      const res = await request(router)
        .get(validUrl);

      expectControllerCalled(testingSetup);

      const data = z.array(episodeEntityWithFileInfosSchema).parse(res.body.data);

      expect(data).toEqual([EPISODE_WITH_FILE_INFO]);
      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("path parameters validation", () => {
      it("invalid remotePlayerId", async () => {
        const res = await request(router)
          .get(invalidIdUrl);

        expectControllerNotCalled(testingSetup);

        expect(mocks.authPlayerService.guardUser).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      } );

      it("missing streamKey", async () => {
        const res = await request(router)
          .get(validControllerUrl);

        expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      } );
    } );

    describe("query parameters validation", () => {
      it("valid force parameter (true)", async () => {
        const res = await request(router)
          .get(validUrl)
          .query( {
            force: "true",
          } );

        expectControllerCalled(testingSetup);

        expect(res.statusCode).toBe(HttpStatus.OK);
      } );

      it("valid force parameter (false)", async () => {
        const res = await request(router)
          .get(validUrl)
          .query( {
            force: "false",
          } );

        expectControllerCalled(testingSetup);

        expect(res.statusCode).toBe(HttpStatus.OK);
      } );

      it("valid force parameter (1)", async () => {
        const res = await request(router)
          .get(validUrl)
          .query( {
            force: "1",
          } );

        expectControllerCalled(testingSetup);

        expect(res.statusCode).toBe(HttpStatus.OK);
      } );

      it("valid force parameter (0)", async () => {
        const res = await request(router)
          .get(validUrl)
          .query( {
            force: "0",
          } );

        expectControllerCalled(testingSetup);

        expect(res.statusCode).toBe(HttpStatus.OK);
      } );

      it("invalid force parameter", async () => {
        const res = await request(router)
          .get(validUrl)
          .query( {
            force: "invalid",
          } );

        expectControllerNotCalled(testingSetup);

        expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      } );

      it("valid n parameter", async () => {
        const res = await request(router)
          .get(validUrl)
          .query( {
            n: "5",
          } );

        expectControllerCalled(testingSetup);

        expect(res.statusCode).toBe(HttpStatus.OK);
      } );

      it("invalid n parameter (not a number)", async () => {
        const res = await request(router)
          .get(validUrl)
          .query( {
            n: "notANumber",
          } );

        expectControllerNotCalled(testingSetup);

        expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      } );

      it("multiple valid query params", async () => {
        const res = await request(router)
          .get(validUrl)
          .query( {
            force: "true",
            n: "10",
          } );

        expectControllerCalled(testingSetup);

        expect(res.statusCode).toBe(HttpStatus.OK);
      } );
    } );

    describe("authentication", () => {
      it("request without user should fail", async () => {
        await testingSetup.useMockedUser(null);

        const res = await request(router)
          .get(validUrl);

        expectControllerNotCalled(testingSetup);

        expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);

        // Restore user for other tests
        await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles as UserPayload);
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

      expectControllerCalled(testingSetup);

      expect(res.statusCode).toBe(HttpStatus.ACCEPTED);
    } );

    describe("path parameters validation", () => {
      it("invalid remotePlayerId", async () => {
        const res = await request(router)
          .post(invalidIdUrl)
          .send(validPayload);

        expectControllerNotCalled(testingSetup);

        expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      } );

      it("missing streamKey", async () => {
        const res = await request(router)
          .post(validControllerUrl)
          .send(validPayload);

        expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      } );
    } );

    describe("query parameters validation", () => {
      it("valid force parameter", async () => {
        const res = await request(router)
          .post(validUrl)
          .query( {
            force: "true",
          } )
          .send(validPayload);

        expectControllerCalled(testingSetup);

        expect(res.statusCode).toBe(HttpStatus.ACCEPTED);
      } );

      it("valid n parameter", async () => {
        const res = await request(router)
          .post(validUrl)
          .query( {
            n: "10",
          } )
          .send(validPayload);

        expectControllerCalled(testingSetup);

        expect(res.statusCode).toBe(HttpStatus.ACCEPTED);
      } );

      it("invalid force parameter", async () => {
        const res = await request(router)
          .post(validUrl)
          .query( {
            force: "invalid",
          } )
          .send(validPayload);

        expectControllerNotCalled(testingSetup);

        expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      } );
    } );

    describe("payload validation", () => {
      it("should fail without secretToken", async () => {
        const res = await request(router)
          .post(validUrl)
          .send( {} );

        expectControllerNotCalled(testingSetup);

        expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      } );

      it("should fail with invalid secretToken type", async () => {
        const res = await request(router)
          .post(validUrl)
          .send( {
            secretToken: 123456, // number instead of string
          } );

        expectControllerNotCalled(testingSetup);

        expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
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
