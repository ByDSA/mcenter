import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { TasksCrudDtos } from "$shared/models/tasks";
import { Types } from "mongoose";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { expectControllerFinishRequest, testManyAuth } from "#core/auth/strategies/token/tests";
import { MusicUpdateRemoteController } from "./controller";
import { MusicUpdateRemoteTaskHandler } from "./task.handler";

describe("musicUpdateRemoteController", () => {
  let testingSetup: TestingSetup;
  let router: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;

  // eslint-disable-next-line require-await
  async function initMocks() {
    const ret = {
      taskHandler: testingSetup.getMock(MusicUpdateRemoteTaskHandler),
    };

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        controllers: [MusicUpdateRemoteController],
        providers: [
          getOrCreateMockProvider(MusicUpdateRemoteTaskHandler),
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

  describe("all (GET /)", () => {
    const URL = "/update-remote/";

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);

      mocks.taskHandler.addTask.mockResolvedValue( {
        createdAt: new Date(),
        id: new Types.ObjectId().toString(),
        name: "task job",
        payload: {
          userId: fixtureUsers.Admin.User.id,
        },
      } satisfies TasksCrudDtos.CreateTask.TaskJob<any>);

      const res = await request(router)
        .get(URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.job).toBeDefined();
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: () => request(router)
          .get(URL),
        list: [
          {
            user: null,
            shouldPass: false,
          },
          {
            user: fixtureUsers.Normal.UserWithRoles,
            shouldPass: false,
          },
          {
            user: fixtureUsers.Admin.UserWithRoles,
            shouldPass: true,
          },
        ],
      } );
    } );

    describe("repositories", () => {
      it("should call taskHandler.addTask with the authenticated user id", async () => {
        await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);

        await request(router)
          .get(URL);

        expect(mocks.taskHandler.addTask).toHaveBeenCalled();
      } );

      it("should call taskHandler.addTask exactly once", async () => {
        await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);

        await request(router)
          .get(URL);

        expect(mocks.taskHandler.addTask).toHaveBeenCalled();
      } );
    } );
  } );
} );
