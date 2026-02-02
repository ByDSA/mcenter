import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Application } from "express";
import { fixtureMusics } from "$sharedSrc/models/musics/tests/fixtures";
import { PATH_ROUTES } from "$shared/routing";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { ResourceResponseFormatterModule, ResponseFormatInterceptor } from "#modules/resources/response-formatter";
import { musicsRepoMockProvider } from "../crud/repositories/music/tests";
import { musicHistoryRepoMockProvider } from "../history/crud/repository/tests";
import { MusicGetRandomController } from "./controller";

const MUSICS_SAMPLES_IN_DISK = fixtureMusics.Disk.List;

describe("random", () => {
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
  } );

  afterAll(async () => {
    await app.close();
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  it("get random", async () => {
    const musics = MUSICS_SAMPLES_IN_DISK;
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

  it("no user provided should not return userinfo", async () => {
    const response = await request(routerApp)
      .get("/?format=json")
      .expect(200);

    expect(response.body).toHaveProperty("data");

    const { data } = response.body;

    expect(data).not.toHaveProperty("userInfo");
  } );

  it("user provided should return userinfo", async () => {
    const token = fixtureMusics.Disk.WithUserInfo.List[0].userInfo.id;
    const response = await request(routerApp)
      .get("/?format=json&token=" + token)
      .expect(200);

    expect(response.body).toHaveProperty("data");

    const { data } = response.body;

    expect(data).toHaveProperty("userInfo");
  } );
} );
