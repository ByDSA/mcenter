import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Application } from "express";
import { fixtureMusics } from "$sharedSrc/models/musics/tests/fixtures";
import { fixtureMusicFileInfos } from "$sharedSrc/models/musics/file-info/tests/fixtures";
import { PATH_ROUTES } from "$shared/routing";
import { MusicId } from "#musics/models";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { MusicRepository } from "../crud/repository";
import { musicRepoMockProvider } from "../crud/repository/tests";
import { musicHistoryRepoMockProvider } from "../history/crud/repository/tests";
import { MusicFileInfoRepository } from "../file-info/crud/repository";
import { musicFileInfoRepositoryMockProvider } from "../file-info/crud/repository/tests";
import { RawHandlerService } from "../raw/service";
import { MusicGetRandomController } from "./get.controller";

const MUSICS_SAMPLES_IN_DISK = fixtureMusics.Disk.List;

describe("getAll", () => {
  let musicRepoMock: jest.Mocked<MusicRepository>;
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
        RawHandlerService,
      ],
    } );

    app = testingSetup.app;
    routerApp = testingSetup.routerApp;

    musicRepoMock = testingSetup.module.get<jest.Mocked<MusicRepository>>(MusicRepository);
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

  it("getRandom", async () => {
    const musics = MUSICS_SAMPLES_IN_DISK;

    musicRepoMock.getAll.mockResolvedValueOnce(fixtureMusics.Disk.List);
    const response = await request(routerApp)
      .get("/")
      .expect(200);
    const responseText = response.text;

    expect(musics.some((m) => responseText.includes(`,${m.title}`))).toBeTruthy();

    expect(responseText.includes("127.0.0.1")).toBeTruthy();
    expect(
      musics.some((m) => responseText.includes(PATH_ROUTES.musics.raw.withParams(m.url))),
    ).toBeTruthy();
  } );
} );
