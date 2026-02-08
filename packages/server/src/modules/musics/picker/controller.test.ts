import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureMusics } from "$sharedSrc/models/musics/tests/fixtures";
import { PATH_ROUTES } from "$shared/routing";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { ResourceResponseFormatterModule, MusicResponseFormatInterceptor } from "#modules/resources/response-formatter";
import { MusicsRepository } from "../crud/repositories/music";
import { MusicHistoryRepository } from "../history/crud/repository";
import { MusicGetRandomController } from "./controller";

const MUSICS_SAMPLES_IN_DISK = fixtureMusics.Disk.List;
const MUSIC_WITH_USER_INFO = fixtureMusics.Disk.WithUserInfo.List[0];

describe("musicGetRandomController", () => {
  let routerApp: Application;
  let testingSetup: TestingSetup;
  let mocks: Awaited<ReturnType<typeof initMocks>>;

  // eslint-disable-next-line require-await
  async function initMocks(setup: TestingSetup) {
    const ret = {
      musicRepo: setup.getMock(MusicsRepository),
      historyRepo: setup.getMock(MusicHistoryRepository),
    };

    ret.musicRepo.getMany.mockResolvedValue(MUSICS_SAMPLES_IN_DISK);
    ret.musicRepo.getOneById.mockResolvedValue(MUSICS_SAMPLES_IN_DISK[0]);
    ret.historyRepo.getLast.mockResolvedValue(null);

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [ResourceResponseFormatterModule],
      controllers: [MusicGetRandomController],
      providers: [
        getOrCreateMockProvider(MusicsRepository),
        getOrCreateMockProvider(MusicHistoryRepository),
        MusicResponseFormatInterceptor,
      ],
    } );

    routerApp = testingSetup.routerApp;
    mocks = await initMocks(testingSetup);
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  describe("getRandom", () => {
    describe("format=m3u8", () => {
      const validUrl = "/?format=m3u8";

      it("should return 200 with m3u8 format", async () => {
        const res = await request(routerApp)
          .get(validUrl);

        expect(res.statusCode).toBe(HttpStatus.OK);
      } );

      it("should call repositories", async () => {
        await request(routerApp)
          .get(validUrl);

        expect(mocks.musicRepo.getAll).toHaveBeenCalled();
      } );

      it("should include music titles in response", async () => {
        const res = await request(routerApp)
          .get(validUrl);
        const responseText = res.text;
        const musics = MUSICS_SAMPLES_IN_DISK;

        expect(musics.some((m) => responseText.includes(`,${m.title}`))).toBeTruthy();
      } );

      it("should include music slugs in response", async () => {
        const res = await request(routerApp)
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
        const res = await request(routerApp)
          .get(validUrl);

        expect(res.statusCode).toBe(HttpStatus.OK);
        expect(res.body).toHaveProperty("data");
      } );

      it("should not return userInfo when no user provided", async () => {
        const res = await request(routerApp)
          .get(validUrl);
        const { data } = res.body;

        expect(data).not.toHaveProperty("userInfo");
      } );

      it("should return userInfo when token provided", async () => {
        const token = MUSIC_WITH_USER_INFO.userInfo.id;
        const res = await request(routerApp)
          .get(`${validUrl}&token=${token}`);
        const { data } = res.body;

        expect(data).toHaveProperty("userInfo");
      } );
    } );

    describe("invalid params", () => {
      it("should return 422 if token is not ObjectId", async () => {
        const res = await request(routerApp)
          .get("/?format=json&token=invalidToken");

        expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      } );
    } );
  } );
} );
