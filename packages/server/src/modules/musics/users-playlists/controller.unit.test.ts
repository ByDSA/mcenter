import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { userEntitySchema } from "$shared/models/auth";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { expectControllerFinishRequest, testFailValidation, testManyAuth } from "#core/auth/strategies/token/tests";
import { mockMongoId } from "#tests/mongo";
import { UsersMusicController } from "./controller";
import { UsersMusicPlaylistsRepository } from "./repository";

describe("usersMusicController", () => {
  let testingSetup: TestingSetup;
  let router: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;

  // eslint-disable-next-line require-await
  async function initMocks() {
    const ret = {
      usersMusicPlaylistsRepo: testingSetup.getMock(UsersMusicPlaylistsRepository),
    };

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        imports: [],
        controllers: [UsersMusicController],
        providers: [
          getOrCreateMockProvider(UsersMusicPlaylistsRepository),
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

  const mockUserEntity = fixtureUsers.Normal.UserWithRoles;

  beforeEach(async () => {
    jest.clearAllMocks();
    await testingSetup.useMockedUser(null);

    mocks.usersMusicPlaylistsRepo.setMusicPlaylistFavorite.mockResolvedValueOnce(mockUserEntity);
  } );

  describe("musicPlaylistFavorite (PATCH)", () => {
    const URL = "/musics/favorite-playlist";

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);

      const res = await request(router)
        .patch(URL)
        .send( {
          playlistId: mockMongoId,
        } );

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(userEntitySchema.parse(res.body.data)).toEqual(mockUserEntity);
    } );

    it("should accept null playlistId", async () => {
      await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);

      const res = await request(router)
        .patch(URL)
        .send( {
          playlistId: null,
        } );

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("invalid payload", () => {
      testFailValidation("invalid playlistId format", {
        request: () => request(router)
          .patch(URL)
          .send( {
            playlistId: "invalid-id",
          } ),
        user: fixtureUsers.Normal.UserWithRoles,
      } );

      testFailValidation("missing playlistId field", {
        request: () => request(router)
          .patch(URL)
          .send( {} ),
        user: fixtureUsers.Normal.UserWithRoles,
      } );
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: ()=> request(router)
          .patch(URL)
          .send( {
            playlistId: mockMongoId,
          } ),
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
      it("should call setMusicPlaylistFavorite", async () => {
        await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);

        await request(router)
          .patch(URL)
          .send( {
            playlistId: mockMongoId,
          } );

        expect(mocks.usersMusicPlaylistsRepo.setMusicPlaylistFavorite).toHaveBeenCalled();
      } );
    } );
  } );
} );
