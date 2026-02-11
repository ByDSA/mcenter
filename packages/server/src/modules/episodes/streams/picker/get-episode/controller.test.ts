import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { createTokenTests, expectControllerCalled } from "#core/auth/strategies/token/tests";
import { EpisodeResponseFormatterModule } from "#episodes/renderer/module";
import { fixtureEpisodes } from "#episodes/tests";
import { StreamGetEpisodeController } from "./controller";
import { StreamGetRandomEpisodeService } from "./service";

describe("get-episode", () => {
  let testingSetup: TestingSetup;
  let router: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;

  async function initMocks(setup: TestingSetup) {
    const ret = {
      streamGetRandomEpisodeService: setup.getMock(StreamGetRandomEpisodeService),
    };

    ret.streamGetRandomEpisodeService.getByStreamKey.mockResolvedValue(
      fixtureEpisodes.SampleSeries.List,
    );

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
        EpisodeResponseFormatterModule,
      ],
      controllers: [StreamGetEpisodeController],
      providers: [
        getOrCreateMockProvider(StreamGetRandomEpisodeService),
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

  describe("getEpisode", ()=> {
    const URL = "/get-episode/streamKey";

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);
      const res = await request(router)
        .get(URL);

      await testingSetup.useMockedUser(null);
      expectControllerCalled(testingSetup);

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("auth", ()=> {
      createTokenTests( {
        url: URL,
        expectedUser: fixtureUsers.Normal.UserWithRoles,
        getTestingSetup: ()=>testingSetup,
        getRouter: ()=>router,
      } );

      it("request without user should fail", async () => {
        const res = await request(router)
          .get(URL);

        expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      } );
    } );

    describe("repositories", () => {
      it("should call service", async () => {
        const user = fixtureUsers.Normal.UserWithRoles;

        await testingSetup.useMockedUser(user);
        await request(router).get(URL);

        expect(mocks.streamGetRandomEpisodeService.getByStreamKey).toHaveBeenCalled();
      } );
    } );
  } );
} );
