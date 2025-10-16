import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Application } from "express";
import { fixtureMusics } from "$sharedSrc/models/musics/tests/fixtures";
import { PATH_ROUTES } from "$shared/routing";
import { testRoute } from "#core/routing/test";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { ResourceResponseFormatterModule, ResponseFormatInterceptor } from "#modules/resources/response-formatter";
import { MusicsRepository } from "../crud/repositories/music";
import { musicsRepoMockProvider } from "../crud/repositories/music/tests";
import { musicHistoryRepoMockProvider } from "../history/crud/repository/tests";
import { MusicGetRandomController } from "./controller";

testRoute(PATH_ROUTES.musics.pickRandom.path);

const MUSICS_SAMPLES_IN_DISK = fixtureMusics.Disk.List;

describe("random", () => {
  let musicRepoMock: jest.Mocked<MusicsRepository>;
  let app: INestApplication;
  let routerApp: Application;
  let testingSetup: TestingSetup;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [ResourceResponseFormatterModule],
      controllers: [MusicGetRandomController],
      providers: [
        musicsRepoMockProvider,
        musicHistoryRepoMockProvider,
        ResponseFormatInterceptor,
      ],
    } );

    app = testingSetup.app;
    routerApp = testingSetup.routerApp;

    musicRepoMock = testingSetup.module.get<jest.Mocked<MusicsRepository>>(MusicsRepository);
  } );

  afterAll(async () => {
    await app.close();
  } );

  beforeEach(() => {
    jest.clearAllMocks();
    musicRepoMock.getAll.mockResolvedValue(fixtureMusics.Disk.List);
  } );

  it("get random", async () => {
    const musics = MUSICS_SAMPLES_IN_DISK;

    musicRepoMock.getAll.mockResolvedValueOnce(fixtureMusics.Disk.WithUserInfo.List);
    const response = await request(routerApp)
      .get("/?format=m3u8")
      .expect(200);
    const responseText = response.text;

    expect(musics.some((m) => responseText.includes(`,${m.title}`))).toBeTruthy();

    expect(responseText.includes("127.0.0.1")).toBeTruthy();
    expect(
      musics.some((m) => responseText.includes(PATH_ROUTES.musics.slug.withParams(m.slug))),
    ).toBeTruthy();
  } );
} );
