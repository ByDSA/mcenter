import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { MusicSmartPlaylistCrudDtos } from "$shared/models/musics/smart-playlists/dto/transport";
import { GET_MANY_CRITERIA_PATH, GET_ONE_CRITERIA_PATH } from "$shared/routing";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { mockMongoId } from "#tests/mongo";
import { expectControllerFailInValidationPhase, createTokenTests, expectControllerFinishRequest, expectControllerFailRequest, testFailValidation, testManyAuth } from "#core/auth/strategies/token/tests";
import { SmartPlaylistCrudController } from "./controller";
import { MusicSmartPlaylistRepository } from "./repository/repository";
import { GuardOwnerService } from "./guard-owner.service";
import { MUSIC_SMART_PLAYLIST_SAMPLE } from "./repository/tests/repository.globalmock";

const otherUser = fixtureUsers.Admin.UserWithRoles;
const ownerUser = fixtureUsers.Normal.UserWithRoles;

describe("smartPlaylistCrudController", () => {
  let testingSetup: TestingSetup;
  let router: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;

  // eslint-disable-next-line require-await
  async function initMocks() {
    const ret = {
      repo: testingSetup.getMock(MusicSmartPlaylistRepository),
    };

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        controllers: [SmartPlaylistCrudController],
        providers: [
          getOrCreateMockProvider(MusicSmartPlaylistRepository),
          GuardOwnerService,
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

  describe("getOneById (GET /:id)", () => {
    const VALID_URL = `/${mockMongoId}`;
    const INVALID_URL = "/notObjectId";

    it("valid request-response with public playlist", async () => {
      await testingSetup.useMockedUser(ownerUser);

      const res = await request(router)
        .get(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    it("valid request-response with own private playlist", async () => {
      await testingSetup.useMockedUser(ownerUser);

      mocks.repo.getOneById.mockResolvedValueOnce( {
        ...MUSIC_SMART_PLAYLIST_SAMPLE,
        visibility: "private",
      } );

      const res = await request(router)
        .get(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    it("should return UNAUTHORIZED when accessing private playlist from another user", async () => {
      await testingSetup.useMockedUser(otherUser);

      mocks.repo.getOneById.mockResolvedValueOnce( {
        ...MUSIC_SMART_PLAYLIST_SAMPLE,
        visibility: "private",
      } );

      const res = await request(router)
        .get(VALID_URL);

      expectControllerFailRequest();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    } );

    it("should return OK + data null when entity not found", async () => {
      mocks.repo.getOneById.mockResolvedValueOnce(null);

      const res = await request(router)
        .get(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("path parameters validation", () => {
      testFailValidation("id param", {
        request: () => request(router).get(INVALID_URL),
      } );
    } );

    describe("authentication", () => {
      createTokenTests( {
        url: VALID_URL,
        expectedUser: ownerUser,
      } );
    } );

    describe("repositories", () => {
      it("should call repository", async () => {
        await testingSetup.useMockedUser(ownerUser);
        await request(router)
          .get(VALID_URL);

        expect(mocks.repo.getOneById).toHaveBeenCalled();
      } );
    } );
  } );

  describe("getOneUserQuery (GET /user/:userSlug/:querySlug)", () => {
    const VALID_URL = "/user/test-user/test-playlist";
    const INVALID_URL_USER_SLUG = "/user/invalid slug/test-playlist";
    const INVALID_URL_QUERY_SLUG = "/user/test-user/invalid slug";

    it("valid request-response with public playlist", async () => {
      await testingSetup.useMockedUser(ownerUser);

      mocks.repo.getOneByCriteria.mockResolvedValueOnce( {
        ...MUSIC_SMART_PLAYLIST_SAMPLE,
        visibility: "public",
      } );

      const res = await request(router)
        .get(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    it("valid request-response with own private playlist", async () => {
      await testingSetup.useMockedUser(ownerUser);

      mocks.repo.getOneByCriteria
        .mockResolvedValueOnce( {
          ...MUSIC_SMART_PLAYLIST_SAMPLE,
          visibility: "private",
          ownerUserId: ownerUser.id,
        } );

      const res = await request(router)
        .get(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    it("should return OK when accessing private playlist from another user but empty", async () => {
      await testingSetup.useMockedUser(otherUser);

      mocks.repo.getOneByCriteria.mockResolvedValueOnce( {
        ...MUSIC_SMART_PLAYLIST_SAMPLE,
        visibility: "private",
      } );

      const res = await request(router)
        .get(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body).toEqual( {} );
    } );

    it("should return OK when playlist not found and data=null", async () => {
      await testingSetup.useMockedUser(ownerUser);

      mocks.repo.getOneByCriteria.mockResolvedValueOnce(null);

      const res = await request(router)
        .get(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body).toEqual( {} );
    } );

    describe("path parameters validation", () => {
      testFailValidation("userSlug param", {
        request: () => request(router).get(INVALID_URL_USER_SLUG),
      } );

      testFailValidation("querySlug param", {
        request: () => request(router).get(INVALID_URL_QUERY_SLUG),
      } );
    } );

    describe("authentication", () => {
      createTokenTests( {
        url: VALID_URL,
        expectedUser: ownerUser,
      } );
    } );

    describe("repositories", () => {
      it("should call repository", async () => {
        await testingSetup.useMockedUser(ownerUser);

        mocks.repo.getOneByCriteria.mockResolvedValueOnce( {
          ...MUSIC_SMART_PLAYLIST_SAMPLE,
          visibility: "public",
        } );

        await request(router)
          .get(VALID_URL);

        expect(mocks.repo.getOneByCriteria).toHaveBeenCalled();
      } );
    } );
  } );

  describe("createOne (POST)", () => {
    const URL = "/";
    const validPayload = {
      name: "Test Playlist",
      visibility: "public",
      query: "query",
      slug: "slug",
    } satisfies MusicSmartPlaylistCrudDtos.CreateOne.Body;

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(ownerUser);

      const res = await request(router)
        .post(URL)
        .send(validPayload);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("invalid payload", () => {
      testFailValidation("missing required fields", {
        request: () => request(router)
          .post(URL)
          .send( {} ),
        user: fixtureUsers.Admin.UserWithRoles,
      } );
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: ()=> request(router).post(URL)
          .send(validPayload),
        validationInController: true,
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
      it("should call repository", async () => {
        await testingSetup.useMockedUser(ownerUser);
        await request(router)
          .post(URL)
          .send(validPayload);

        expect(mocks.repo.createOneAndGet).toHaveBeenCalled();
      } );
    } );
  } );

  describe("patchOne (PATCH /:id)", () => {
    const VALID_URL = `/${MUSIC_SMART_PLAYLIST_SAMPLE.id}`;
    const INVALID_URL = "/notObjectId";
    const updatePayload = {
      entity: {
        name: "Updated Name",
      },
    } satisfies MusicSmartPlaylistCrudDtos.Patch.Body;

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(ownerUser);

      const res = await request(router)
        .patch(VALID_URL)
        .send(updatePayload);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("path parameters validation", () => {
      testFailValidation("id param", {
        request: () => request(router).patch(INVALID_URL)
          .send(updatePayload),
        user: fixtureUsers.Admin.UserWithRoles,
      } );
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: () => request(router).patch(VALID_URL)
          .send(updatePayload),
        validationInController: true,
        list: [
          {
            user: null,
            shouldPass: false,
          },
          {
            user: otherUser,
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

        await request(router)
          .patch(VALID_URL)
          .send(updatePayload);

        expect(mocks.repo.patchOneByIdAndGet).toHaveBeenCalled();
      } );
    } );
  } );

  describe("deleteOne (DELETE /:id)", () => {
    const VALID_URL = `/${MUSIC_SMART_PLAYLIST_SAMPLE.id}`;
    const INVALID_URL = "/notObjectId";

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(ownerUser);

      const res = await request(router)
        .delete(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("path parameters validation", () => {
      testFailValidation("id param", {
        request: () => request(router)
          .delete(INVALID_URL),
        user: fixtureUsers.Admin.UserWithRoles,
      } );
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: () => request(router)
          .delete(VALID_URL),
        validationInController: true,
        list: [
          {
            user: null,
            shouldPass: false,
          },
          {
            user: otherUser,
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

        await request(router)
          .delete(VALID_URL);

        expect(mocks.repo.deleteOneByIdAndGet).toHaveBeenCalled();
      } );
    } );
  } );

  describe("getOneByCriteria (POST)", () => {
    const URL = `/${GET_ONE_CRITERIA_PATH}`;
    const validPayload = {
      filter: {
        slug: "test-slug",
      },
    };

    it("valid request-response", async () => {
      mocks.repo.getOneByCriteria.mockResolvedValueOnce( {
        ...MUSIC_SMART_PLAYLIST_SAMPLE,
        visibility: "public",
      } );

      const res = await request(router)
        .post(URL)
        .send(validPayload);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    it("should return OK + data null when entity not found", async () => {
      mocks.repo.getOneByCriteria.mockResolvedValueOnce(null);

      const res = await request(router)
        .post(URL)
        .send(validPayload);

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.data).toBeNull();
    } );

    it(
      "should return OK + data null when accessing private playlist from another user",
      async () => {
        await testingSetup.useMockedUser(otherUser);

        mocks.repo.getOneByCriteria.mockResolvedValueOnce( {
          ...MUSIC_SMART_PLAYLIST_SAMPLE,
          visibility: "private",
          ownerUserId: ownerUser.id,
        } );

        const res = await request(router)
          .post(URL)
          .send(validPayload);

        expectControllerFailInValidationPhase( {
          validationInController: true,
        } );

        expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      },
    );

    it("should allow access to own private playlist", async () => {
      await testingSetup.useMockedUser(ownerUser);

      mocks.repo.getOneByCriteria.mockResolvedValueOnce( {
        ...MUSIC_SMART_PLAYLIST_SAMPLE,
        visibility: "private",
        ownerUserId: ownerUser.id,
      } );

      const res = await request(router)
        .post(URL)
        .send(validPayload);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("invalid payload", () => {
      testFailValidation("filter format", {
        request: () => request(router)
          .post(URL)
          .send( {
            filter: "invalid",
          } ),
      } );
    } );

    describe("repositories", () => {
      it("should call repository", async () => {
        await request(router)
          .post(URL)
          .send(validPayload);

        expect(mocks.repo.getOneByCriteria).toHaveBeenCalled();
      } );
    } );
  } );

  describe("getManyByCriteria (POST)", () => {
    const URL = "/" + GET_MANY_CRITERIA_PATH;
    const validPayload = {
      filter: {},
      limit: 10,
    };

    it("valid request-response", async () => {
      const res = await request(router)
        .post(URL)
        .send(validPayload);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("invalid payload", () => {
      testFailValidation("invalid filter format", {
        request: () => request(router)
          .post(URL)
          .send( {
            filter: "invalid",
          } ),
      } );
    } );

    describe("repositories", () => {
      it("should call repository", async () => {
        mocks.repo.getManyByCriteria.mockResolvedValueOnce([]);

        await request(router)
          .post(URL)
          .send(validPayload);

        expect(mocks.repo.getManyByCriteria).toHaveBeenCalled();
      } );
    } );
  } );
} );
