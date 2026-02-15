import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureMusics } from "$sharedSrc/models/musics/tests/fixtures";
import { PATH_ROUTES } from "$shared/routing";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { createTokenTests } from "#core/auth/strategies/token/tests";
import { MusicsRepository } from "../crud/repositories/music";
import { MusicHistoryRepository } from "../history/crud/repository";
import { MusicRendererModule } from "../renderer/module";
import { MusicGetRandomController } from "./controller";
import { MusicGetRandomService } from "./service";

const MUSICS_SAMPLES_IN_DISK = fixtureMusics.Musics.List;
const MUSIC_WITH_USER_INFO = fixtureMusics.Musics.FullList[0];

describe("musicGetRandomController integration (controller + service + render)", () => {
  let testingSetup: TestingSetup;
  let router: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;

  // eslint-disable-next-line require-await
  async function initMocks() {
    const ret = {
      musicRepo: testingSetup.getMock(MusicsRepository),
      historyRepo: testingSetup.getMock(MusicHistoryRepository),
    };

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        imports: [MusicRendererModule],
        controllers: [MusicGetRandomController],
        providers: [
          getOrCreateMockProvider(MusicsRepository),
          getOrCreateMockProvider(MusicHistoryRepository),
          MusicGetRandomService,
        ],
      },
      {
        auth: {
          repositories: "mock",
        },
      },
    );

    router = testingSetup.routerApp;
    mocks = await initMocks();
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  describe("getRandom", () => {
    describe("format=m3u8", () => {
      const validUrl = "/?format=m3u8";

      createTokenTests( {
        expectedUser: fixtureUsers.Normal.UserWithRoles,
        url: validUrl,
      } );

      it("should return 200 with m3u8 format", async () => {
        const res = await request(router)
          .get(validUrl);

        expect(res.statusCode).toBe(HttpStatus.OK);
      } );

      it("should call repositories", async () => {
        await request(router)
          .get(validUrl);

        expect(mocks.musicRepo.getAll).toHaveBeenCalled();
      } );

      it("should include music titles in response", async () => {
        const res = await request(router)
          .get(validUrl);
        const responseText = res.text;
        const musics = MUSICS_SAMPLES_IN_DISK;

        expect(musics.some((m) => responseText.includes(`,${m.title}`))).toBeTruthy();
      } );

      it("should include music slugs in response", async () => {
        const res = await request(router)
          .get(validUrl);
        const responseText = res.text;
        const musics = MUSICS_SAMPLES_IN_DISK;

        expect(responseText.includes("127.0.0.1")).toBeTruthy();
        expect(
          musics.some((m) => responseText.includes(PATH_ROUTES.musics.slug.withParams(m.slug))),
        ).toBeTruthy();
      } );
    } );

    describe("format=json", () => {
      const validUrl = "/?format=json";

      it("should return 200 with json format", async () => {
        const res = await request(router)
          .get(validUrl);

        expect(res.statusCode).toBe(HttpStatus.OK);
        expect(res.body).toHaveProperty("data");
      } );

      it("should not return userInfo when no user provided", async () => {
        const res = await request(router)
          .get(validUrl);
        const { data } = res.body;

        expect(data).not.toHaveProperty("userInfo");
      } );

      it("should return userInfo when token provided", async () => {
        const token = MUSIC_WITH_USER_INFO.userInfo.userId;
        const res = await request(router)
          .get(`${validUrl}&token=${token}`);
        const { data } = res.body;

        expect(data).toHaveProperty("userInfo");
      } );
    } );

    describe("invalid params", () => {
      it("should ignore token if is not ObjectId", async () => {
        const res = await request(router)
          .get("/?format=json&token=invalidToken");

        expect(res.statusCode).toBe(HttpStatus.OK);
      } );
    } );

    describe("repositories", () => {
      it("should call musicRepo", async () => {
        const user = fixtureUsers.Normal.UserWithRoles;

        await testingSetup.useMockedUser(user);
        await request(router).get("/?format=json");

        expect(mocks.musicRepo.getAll).toHaveBeenCalled();
      } );
    } );
  } );
} );
