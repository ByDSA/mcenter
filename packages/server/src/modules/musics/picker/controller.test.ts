import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Application } from "express";
import { fixtureMusics } from "$sharedSrc/models/musics/tests/fixtures";
import { fixtureMusicFileInfos } from "$sharedSrc/models/musics/file-info/tests/fixtures";
import { PATH_ROUTES } from "$shared/routing";
import { MusicId } from "#musics/models";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { testRoute } from "#core/routing/test";
import { MusicsRepository } from "../crud/repository";
import { musicRepoMockProvider } from "../crud/repository/tests";
import { musicHistoryRepoMockProvider } from "../history/crud/repository/tests";
import { MusicFileInfoRepository } from "../file-info/crud/repository";
import { musicFileInfoRepositoryMockProvider } from "../file-info/crud/repository/tests";
import { SlugHandlerService } from "../slug/service";
import { MusicGetRandomController } from "./controller";

testRoute(PATH_ROUTES.musics.pickRandom.path);

const MUSICS_SAMPLES_IN_DISK = fixtureMusics.Disk.List;

describe("random", () => {
  let musicRepoMock: jest.Mocked<MusicsRepository>;
  let musicFileInfoRepoMock: jest.Mocked<MusicFileInfoRepository>;
  let app: INestApplication;
  let routerApp: Application;
  let testingSetup: TestingSetup;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [],
      controllers: [MusicGetRandomController],
      providers: [
        musicRepoMockProvider,
        musicHistoryRepoMockProvider,
        musicFileInfoRepositoryMockProvider,
        SlugHandlerService,
      ],
    } );

    app = testingSetup.app;
    routerApp = testingSetup.routerApp;

    musicRepoMock = testingSetup.module.get<jest.Mocked<MusicsRepository>>(MusicsRepository);
    musicFileInfoRepoMock = testingSetup.module.get<jest.Mocked<MusicFileInfoRepository>>(
      MusicFileInfoRepository,
    );
  } );

  afterAll(async () => {
    await app.close();
  } );

  beforeEach(() => {
    jest.clearAllMocks();
    musicFileInfoRepoMock.getOneByMusicId.mockImplementation(
      // eslint-disable-next-line require-await
      async (musicId: MusicId) => {
        return fixtureMusicFileInfos.Disk.List.find(mf=>mf.musicId === musicId) ?? null;
      },
    );
    musicFileInfoRepoMock.getAll.mockResolvedValue(fixtureMusicFileInfos.Disk.List);
    musicRepoMock.getAll.mockResolvedValue(fixtureMusics.Disk.List);
  } );

  it("get random", async () => {
    const musics = MUSICS_SAMPLES_IN_DISK;

    musicRepoMock.getAll.mockResolvedValueOnce(fixtureMusics.Disk.List);
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
