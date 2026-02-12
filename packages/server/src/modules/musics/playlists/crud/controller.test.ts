import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { GET_MANY_CRITERIA_PATH, GET_ONE_CRITERIA_PATH } from "$shared/routing";
import { ResponseFormat } from "$shared/models/resources";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { mockMongoId } from "#tests/mongo";
import { expectControllerFailInValidationPhase, expectControllerFinishRequest, createTokenTests, testManyAuth, testFailValidation } from "#core/auth/strategies/token/tests";
import { MusicHistoryRepository } from "#musics/history/crud/repository";
import { MusicResponseFormatterService } from "#musics/renderer/formatter.service";
import { MusicRendererService } from "#musics/renderer/renderer.service";
import { MusicPlaylistCrudDtos } from "../models/dto";
import { MusicPlaylistsRepository } from "./repository/repository";
import { MusicPlaylistsController } from "./controller";
import { SAMPLE_PLAYLIST } from "./repository/tests/repository.globalmock";

const ownerUser = fixtureUsers.Normal.UserWithRoles;
const otherUser = fixtureUsers.Admin.UserWithRoles;

describe("musicPlaylistsController", () => {
  let testingSetup: TestingSetup;
  let router: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;

  // eslint-disable-next-line require-await
  async function initMocks() {
    const ret = {
      playlistsRepo: testingSetup.getMock(MusicPlaylistsRepository),
      responseFormatter: testingSetup.getMock(MusicResponseFormatterService),
      musicHistoryRepo: testingSetup.getMock(MusicHistoryRepository),
      musicRenderer: testingSetup.getMock(MusicRendererService),
    };

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        controllers: [MusicPlaylistsController],
        providers: [
          getOrCreateMockProvider(MusicPlaylistsRepository),
          getOrCreateMockProvider(MusicResponseFormatterService),
          getOrCreateMockProvider(MusicHistoryRepository),
          getOrCreateMockProvider(MusicRendererService),
        ],
      },
      {
        auth: {
          repositories: "mock",
          cookies: "mock",
        },
      },
    );

    router = testingSetup.routerApp;
    mocks = await initMocks();
  } );

  beforeEach(async () => {
    jest.clearAllMocks();
    await testingSetup.useMockedUser(null);
  } );

  describe("getOneById (GET)", () => {
    const VALID_URL = `/${mockMongoId}`;
    const INVALID_URL = "/notObjectId";

    it("valid request-response", async () => {
      mocks.responseFormatter.getResponseFormatByRequest.mockReturnValueOnce(ResponseFormat.JSON);

      const res = await request(router).get(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    it("should return OK + data null when entity not found", async () => {
      await testingSetup.useMockedUser(ownerUser);
      mocks.playlistsRepo.getOneById.mockResolvedValueOnce(null);

      const res = await request(router).get(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.data).toBeNull();
    } );

    describe("path parameters validation", () => {
      testFailValidation("id", {
        request: ()=>request(router).get(INVALID_URL),
      } );
    } );

    describe("authentication", () => {
      createTokenTests( {
        url: VALID_URL,
        expectedUser: ownerUser,
      } );
    } );

    describe("repositories", () => {
      it("should call getOneByCriteria", async () => {
        mocks.responseFormatter.getResponseFormatByRequest.mockReturnValueOnce(ResponseFormat.JSON);
        await request(router).get(VALID_URL);

        expect(mocks.playlistsRepo.getOneByCriteria).toHaveBeenCalled();
      } );
    } );
  } );

  describe("getOneByCriteria (POST)", () => {
    const VALID_URL = `/${GET_ONE_CRITERIA_PATH}`;

    it("valid request-response", async () => {
      const res = await request(router).post(VALID_URL)
        .send( {} );

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    it("should return OK + data null when entity not found", async () => {
      mocks.playlistsRepo.getOneByCriteria.mockResolvedValueOnce(null);

      const res = await request(router).post(VALID_URL)
        .send( {} );

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.data).toBeNull();
    } );

    describe("repositories", () => {
      it("should call getOneByCriteria", async () => {
        await request(router).post(VALID_URL)
          .send( {} );

        expect(mocks.playlistsRepo.getOneByCriteria).toHaveBeenCalled();
      } );
    } );
  } );

  describe("patchPlaylist (PATCH)", () => {
    const VALID_URL = `/${mockMongoId}`;
    const INVALID_URL = "/notObjectId";
    const updatePayload = {
      entity: {
        name: "Updated Name",
      },
    } satisfies MusicPlaylistCrudDtos.Patch.Body;

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(ownerUser);

      const res = await request(router).patch(VALID_URL)
        .send(updatePayload);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("path parameters validation", () => {
      testFailValidation("id", {
        request: ()=>request(router).patch(INVALID_URL)
          .send(updatePayload),
        user: ownerUser,
      } );
    } );

    describe("invalid payload", () => {
      testFailValidation("missing required name field", {
        request: () => request(router).patch(VALID_URL)
          .send( {
            visibility: "public",
          } ),
        user: ownerUser,
      } );
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: () => request(router).patch(VALID_URL)
          .send(updatePayload),
        list: [
          {
            user: null,
            shouldPass: false,
          },
          {
            user: ownerUser,
            shouldPass: true,
          },
        ],
      } );
    } );

    describe("repositories", () => {
      it("should call patchOneByIdAndGet", async () => {
        await testingSetup.useMockedUser(ownerUser);
        await request(router).patch(VALID_URL)
          .send(updatePayload);

        expect(mocks.playlistsRepo.patchOneByIdAndGet).toHaveBeenCalled();
      } );
    } );
  } );

  describe("createOnePlaylist (POST)", () => {
    const URL = "/";
    const validPayload = {
      slug: "slug",
      name: "Test Playlist",
      visibility: "public",
    } satisfies MusicPlaylistCrudDtos.CreateOne.Body;

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(ownerUser);

      const res = await request(router).post(URL)
        .send(validPayload);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("invalid payload", () => {
      it("missing required name field", async () => {
        await testingSetup.useMockedUser(ownerUser);

        const res = await request(router)
          .post(URL)
          .send( {
            description: "Test description",
          } );

        expectControllerFailInValidationPhase();

        expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      } );

      it("invalid visibility value", async () => {
        await testingSetup.useMockedUser(ownerUser);

        const res = await request(router)
          .post(URL)
          .send( {
            ...validPayload,
            visibility: "invalid",
          } );

        expectControllerFailInValidationPhase();

        expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      } );
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: () => request(router).post(URL)
          .send(validPayload),
        list: [
          {
            user: null,
            shouldPass: false,
          },
          {
            user: ownerUser,
            shouldPass: true,
          },
        ],
      } );
    } );

    describe("repositories", () => {
      it("should call createOneAndGet", async () => {
        await testingSetup.useMockedUser(ownerUser);
        await request(router).post(URL)
          .send(validPayload);

        expect(mocks.playlistsRepo.createOneAndGet).toHaveBeenCalled();
      } );
    } );
  } );

  describe("deleteOnePlaylist (DELETE)", () => {
    const VALID_URL = `/${mockMongoId}`;
    const INVALID_URL = "/notObjectId";

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(ownerUser);

      const res = await request(router).delete(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("path parameters validation", () => {
      testFailValidation(
        "id",
        {
          request: ()=>request(router).delete(INVALID_URL),
          user: ownerUser,
        },
      );
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: () => request(router).delete(VALID_URL),
        list: [
          {
            user: null,
            shouldPass: false,
          },
          {
            user: ownerUser,
            shouldPass: true,
          },
        ],
      } );
    } );

    describe("repositories", () => {
      it("should call deleteOneByIdAndGet", async () => {
        await testingSetup.useMockedUser(ownerUser);
        await request(router).delete(VALID_URL);

        expect(mocks.playlistsRepo.deleteOneByIdAndGet).toHaveBeenCalled();
      } );
    } );
  } );

  describe("addTracks (POST)", () => {
    const VALID_URL = `/${mockMongoId}/track`;
    const INVALID_URL = "/notObjectId/track";
    const validPayload = {
      musics: [mockMongoId],
      unique: true,
    };

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(ownerUser);

      const res = await request(router).post(VALID_URL)
        .send(validPayload);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("path parameters validation", () => {
      testFailValidation(
        "id",
        {
          request: ()=>request(router).post(INVALID_URL)
            .send(validPayload),
          user: ownerUser,
        },
      );
    } );

    describe("invalid payload", () => {
      testFailValidation("missing musics field", {
        request: ()=>request(router).post(VALID_URL)
          .send( {
            unique: true,
          } ),
        user: ownerUser,
      } );

      testFailValidation("invalid music id format", {
        request: ()=>request(router).post(VALID_URL)
          .send( {
            musics: ["invalid"],
            unique: true,
          } ),
        user: ownerUser,
      } );
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: () => request(router).post(VALID_URL)
          .send(validPayload),
        list: [
          {
            user: null,
            shouldPass: false,
          },
          {
            user: ownerUser,
            shouldPass: true,
          },
        ],
      } );
    } );

    describe("repositories", () => {
      it("should call addManyTracks", async () => {
        await testingSetup.useMockedUser(ownerUser);
        await request(router).post(VALID_URL)
          .send(validPayload);

        expect(mocks.playlistsRepo.addManyTracks).toHaveBeenCalled();
      } );
    } );
  } );

  describe("removeManyTracks (DELETE)", () => {
    const VALID_URL = `/${mockMongoId}/track`;
    const INVALID_URL = "/notObjectId/track";
    const validPayloadWithTracks = {
      tracks: [mockMongoId],
    };
    const validPayloadWithMusicIds = {
      musicIds: [mockMongoId],
    };

    it("valid request-response with tracks", async () => {
      await testingSetup.useMockedUser(ownerUser);

      const res = await request(router)
        .delete(VALID_URL)
        .send(validPayloadWithTracks);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    it("valid request-response with musicIds", async () => {
      await testingSetup.useMockedUser(ownerUser);

      const res = await request(router)
        .delete(VALID_URL)
        .send(validPayloadWithMusicIds);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("path parameters validation", () => {
      it("invalid id", async () => {
        await testingSetup.useMockedUser(ownerUser);

        const res = await request(router)
          .delete(INVALID_URL)
          .send(validPayloadWithTracks);

        expectControllerFailInValidationPhase();

        expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      } );
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: () => request(router).delete(VALID_URL)
          .send(validPayloadWithTracks),
        list: [
          {
            user: null,
            shouldPass: false,
          },
          {
            user: ownerUser,
            shouldPass: true,
          },
        ],
      } );
    } );

    describe("repositories", () => {
      it("should call removeManyTracks when tracks provided", async () => {
        await testingSetup.useMockedUser(ownerUser);
        await request(router)
          .delete(VALID_URL)
          .send(validPayloadWithTracks);

        expect(mocks.playlistsRepo.removeManyTracks).toHaveBeenCalled();
      } );

      it("should call removeManyMusics when musicIds provided", async () => {
        await testingSetup.useMockedUser(ownerUser);
        await request(router)
          .delete(VALID_URL)
          .send(validPayloadWithMusicIds);

        expect(mocks.playlistsRepo.removeManyMusics).toHaveBeenCalled();
      } );
    } );
  } );

  describe("moveOneTrack (GET)", () => {
    const VALID_URL = `/${mockMongoId}/track/move/${mockMongoId}/2`;
    const INVALID_URL_ID = "/notObjectId/track/move/${mockMongoId}/2";
    const INVALID_URL_INDEX = `/${mockMongoId}/track/move/${mockMongoId}/invalidIndex`;

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(ownerUser);

      const res = await request(router).get(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("path parameters validation", () => {
      testFailValidation(
        "id",
        {
          request: ()=>request(router).get(INVALID_URL_ID),
          user: ownerUser,
        },
      );

      testFailValidation(
        "newIndex",
        {
          request: ()=>request(router).get(INVALID_URL_INDEX),
          user: ownerUser,
        },
      );
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: () => request(router).get(VALID_URL),
        list: [
          {
            user: null,
            shouldPass: false,
          },
          {
            user: ownerUser,
            shouldPass: true,
          },
        ],
      } );
    } );

    describe("repositories", () => {
      it("should call moveMusic", async () => {
        await testingSetup.useMockedUser(ownerUser);
        await request(router).get(VALID_URL);

        expect(mocks.playlistsRepo.moveMusic).toHaveBeenCalled();
      } );
    } );
  } );

  describe("getOneTrack (GET)", () => {
    const VALID_URL = `/${mockMongoId}/track/1`;
    const INVALID_URL_ID = "/notObjectId/track/1";
    const INVALID_URL_N = `/${mockMongoId}/track/0`;

    it("valid request-response", async () => {
      const res = await request(router).get(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    it("should return OK + data null when entity not found", async () => {
      mocks.playlistsRepo.getOneById.mockResolvedValueOnce(null);

      const res = await request(router).get(VALID_URL);

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.data).toBeNull();
    } );

    describe("path parameters validation", () => {
      testFailValidation("playlist id", {
        request: ()=>request(router).get(INVALID_URL_ID),
      } );

      testFailValidation("n parameter (0)", {
        request: ()=>request(router).get(INVALID_URL_N),
      } );
    } );

    describe("repositories", () => {
      it("should call getOneById and findOneTrackByPosition", async () => {
        await request(router).get(VALID_URL);

        expect(mocks.playlistsRepo.getOneById).toHaveBeenCalled();
        expect(mocks.playlistsRepo.findOneTrackByPosition).toHaveBeenCalled();
      } );
    } );
  } );

  describe("getUserPlaylists (POST)", () => {
    const VALID_URL = `/user/${ownerUser.id}`;
    const INVALID_URL = "/user/notObjectId";

    it("valid request-response for same user", async () => {
      await testingSetup.useMockedUser(ownerUser);

      mocks.playlistsRepo.getManyByCriteria.mockResolvedValueOnce([]);

      const res = await request(router).post(VALID_URL)
        .send( {} );

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    it("valid request-response for different user (should filter public only)", async () => {
      await testingSetup.useMockedUser(otherUser);
      mocks.playlistsRepo.getManyByCriteria.mockResolvedValueOnce([
        {
          ...SAMPLE_PLAYLIST,
          visibility: "private",
        },
        {
          ...SAMPLE_PLAYLIST,
          visibility: "public",
        },
      ]);

      const res = await request(router).post(VALID_URL)
        .send( {} );

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].visibility).toBe("public");
    } );

    describe("path parameters validation", () => {
      testFailValidation("userId", {
        request: ()=>request(router).post(INVALID_URL)
          .send( {} ),
      } );
    } );

    describe("repositories", () => {
      it("should call getManyByCriteria", async () => {
        await request(router).post(VALID_URL)
          .send( {} );

        expect(mocks.playlistsRepo.getManyByCriteria).toHaveBeenCalled();
      } );
    } );
  } );

  describe("getManyByCriteria (POST)", () => {
    const VALID_URL = `/${GET_MANY_CRITERIA_PATH}`;

    it("valid request-response", async () => {
      mocks.playlistsRepo.getManyByCriteria.mockResolvedValueOnce([]);

      const res = await request(router).post(VALID_URL)
        .send( {} );

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("repositories", () => {
      it("should call getManyByCriteria", async () => {
        mocks.playlistsRepo.getManyByCriteria.mockResolvedValueOnce([]);
        await request(router).post(VALID_URL)
          .send( {} );

        expect(mocks.playlistsRepo.getManyByCriteria).toHaveBeenCalled();
      } );
    } );
  } );

  describe("getOneUserPlaylist (GET)", () => {
    const VALID_URL = "/user/testuser/testplaylist";

    it("valid request-response", async () => {
      mocks.playlistsRepo.getOneBySlug.mockResolvedValueOnce(SAMPLE_PLAYLIST);
      mocks.responseFormatter.getResponseFormatByRequest.mockReturnValueOnce(
        ResponseFormat.JSON,
      );

      const res = await request(router).get(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("authentication", () => {
      createTokenTests( {
        url: VALID_URL,
        expectedUser: ownerUser,
      } );
    } );

    describe("repositories", () => {
      it("should call getOneBySlug", async () => {
        mocks.playlistsRepo.getOneBySlug.mockResolvedValueOnce(SAMPLE_PLAYLIST);
        mocks.responseFormatter.getResponseFormatByRequest.mockReturnValueOnce(
          ResponseFormat.JSON,
        );
        await request(router).get(VALID_URL);

        expect(mocks.playlistsRepo.getOneBySlug).toHaveBeenCalled();
      } );
    } );
  } );

  describe("getOneUserPlaylistTrack (GET)", () => {
    const VALID_URL = "/user/testuser/testplaylist/track/1";
    const INVALID_URL_N = "/user/testuser/testplaylist/track/0";

    it("valid request-response", async () => {
      mocks.responseFormatter.getResponseFormatByRequest.mockReturnValueOnce(
        ResponseFormat.JSON,
      );

      const res = await request(router).get(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("path parameters validation", () => {
      testFailValidation("n parameter 0", {
        request: ()=>request(router).get(INVALID_URL_N),
      } );
    } );

    describe("authentication", () => {
      createTokenTests( {
        url: VALID_URL,
        expectedUser: ownerUser,
      } );
    } );

    describe("repositories", () => {
      it("should call getOneBySlug and findOneTrackByPosition", async () => {
        mocks.responseFormatter.getResponseFormatByRequest.mockReturnValueOnce(
          ResponseFormat.JSON,
        );
        await request(router).get(VALID_URL);

        expect(mocks.playlistsRepo.getOneBySlug).toHaveBeenCalled();
        expect(mocks.playlistsRepo.findOneTrackByPosition).toHaveBeenCalled();
      } );
    } );
  } );
} );
