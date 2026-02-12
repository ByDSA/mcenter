import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { Types } from "mongoose";
import { MusicUserListsCrudDtos } from "$shared/models/musics/users-lists/dto/transport";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { expectControllerFinishRequest, testFailValidation, testManyAuth } from "#core/auth/strategies/token/tests";
import { MusicUsersListsController } from "./controller";
import { MusicUsersListsRepository } from "./repository/repository";

describe("musicUsersListsController", () => {
  let testingSetup: TestingSetup;
  let router: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;

  // eslint-disable-next-line require-await
  async function initMocks() {
    const ret = {
      repo: testingSetup.getMock(MusicUsersListsRepository),
    };

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        controllers: [MusicUsersListsController],
        providers: [
          getOrCreateMockProvider(MusicUsersListsRepository),
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

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  describe("getMyList (POST /my-lists)", () => {
    const URL = "/my-lists";
    const validPayload = {
      expand: true,
    };

    it("valid request-response with expand true", async () => {
      await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);

      const res = await request(router)
        .post(URL)
        .send(validPayload);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    it("valid request-response with expand false", async () => {
      await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);

      const res = await request(router)
        .post(URL)
        .send( {
          expand: false,
        } );

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("invalid payload", () => {
      testFailValidation("missing expand field", {
        request: () => request(router)
          .post(URL)
          .send( {} ),
      } );

      testFailValidation("invalid expand type", {
        request: () => request(router)
          .post(URL)
          .send( {
            expand: "invalid",
          } ),
      } );
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: () => request(router)
          .post(URL)
          .send(validPayload),
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
        await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);

        await request(router)
          .post(URL)
          .send(validPayload);

        expect(mocks.repo.getAllResourcesSorted).toHaveBeenCalled();
      } );
    } );
  } );

  describe("patchList (PATCH /)", () => {
    const URL = "/";
    const validPayload = {
      list: [
        {
          id: new Types.ObjectId().toString(),
          resourceId: new Types.ObjectId().toString(),
          type: "playlist",
        },
      ],
    } satisfies MusicUserListsCrudDtos.PatchMyList.Body;

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);

      const res = await request(router)
        .patch(URL)
        .send(validPayload);

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("invalid payload", () => {
      testFailValidation("missing list field", {
        request: () => request(router)
          .patch(URL)
          .send( {} ),
      } );

      testFailValidation("invalid list format", {
        request: () => request(router)
          .patch(URL)
          .send( {
            list: "invalid",
          } ),
      } );
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: ()=>request(router)
          .patch(URL)
          .send(validPayload),
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
        await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);

        await request(router)
          .patch(URL)
          .send(validPayload);

        expect(mocks.repo.patchOneByUserIdAndGet).toHaveBeenCalled();
      } );
    } );
  } );

  describe("moveOneList (PATCH /move)", () => {
    const URL = "/move";
    const validPayload = {
      entryId: "entry123",
      newIndex: 2,
    } satisfies MusicUserListsCrudDtos.MoveOne.Body;

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);

      const res = await request(router)
        .patch(URL)
        .send(validPayload);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("invalid payload", () => {
      testFailValidation("missing entryId", {
        request: () => request(router)
          .patch(URL)
          .send( {
            newIndex: 2,
          } ),
      } );

      testFailValidation("missing newIndex", {
        request: () => request(router)
          .patch(URL)
          .send( {
            entryId: "entry123",
          } ),
      } );

      testFailValidation("invalid newIndex type", {
        request: () => request(router)
          .patch(URL)
          .send( {
            entryId: "entry123",
            newIndex: "invalid",
          } ),
      } );
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: ()=>request(router)
          .patch(URL)
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
        await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);

        await request(router)
          .patch(URL)
          .send(validPayload);

        expect(mocks.repo.moveOneList).toHaveBeenCalled();
      } );
    } );
  } );
} );
