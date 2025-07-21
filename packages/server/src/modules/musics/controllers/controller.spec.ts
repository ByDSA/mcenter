import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Application } from "express";
import { assertIsDefined } from "$shared/utils/validation";
import { createTestingAppModuleAndInit, TestingSetup } from "#tests/nestjs/app";
import { musicEntitySchema, MusicId } from "#musics/models";
import { DomainMessageBrokerModule } from "#modules/domain-message-broker/module";
import { MusicRepository } from "../repositories";
import { UpdateRemoteTreeService, UpdateResult } from "../services";
import { musicRepoMockProvider } from "../repositories/tests";
import { musicHistoryRepoMockProvider } from "../history/repositories/tests/RepositoryMock";
import { fixtureMusics } from "../tests/fixtures";
import { fixtureMusicFileInfos } from "../file-info/tests/fixtures";
import { MusicFileInfoRepository } from "../file-info/repositories/repository";
import { musicFileInfoRepositoryMockProvider } from "../file-info/repositories/tests";
import { musicFileInfoEntitySchema } from "../file-info/models";
import { MusicUpdateRemoteController } from "./update-remote.controller";
import { MusicFixController } from "./fix.controller";
import { MusicGetController } from "./get.controller";

const MUSICS_SAMPLES_IN_DISK = fixtureMusics.Disk.List;

describe("getAll", () => {
  let musicRepoMock: jest.Mocked<MusicRepository>;
  let musicFileInfoRepoMock: jest.Mocked<MusicFileInfoRepository>;
  let app: INestApplication;
  let routerApp: Application;
  let testingSetup: TestingSetup;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [DomainMessageBrokerModule],
      controllers: [MusicGetController, MusicUpdateRemoteController, MusicFixController],
      providers: [
        musicRepoMockProvider,
        musicHistoryRepoMockProvider,
        UpdateRemoteTreeService,
        musicFileInfoRepositoryMockProvider,
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
      .get("/get/random")
      .expect(200);
    const responseText = response.text;

    expect(musics.some((m) => responseText.includes(`,${m.title}`))).toBeTruthy();

    expect(responseText.includes("127.0.0.1")).toBeTruthy();
    expect(musics.some((m) => responseText.includes(`/get/raw/${m.url}`))).toBeTruthy();
    expect(responseText.includes("/random")).toBeTruthy();
  } );

  it("fixAll no changes", async () => {
    musicRepoMock.createOneFromPath = jest.fn((path: string) => {
      const musicFileInfo = fixtureMusicFileInfos.Disk.List.find((m) => m.path === path)!;
      const music = MUSICS_SAMPLES_IN_DISK.find(m=>m.id === musicFileInfo.musicId);

      assertIsDefined(music);

      return Promise.resolve( {
        ...music,
        id: "id",
      } );
    } );
    const response = await request(routerApp)
      .get("/update/remote")
      .expect(200);
    const body = response.body as UpdateResult;

    expect(body).toBeDefined();
    expect(body.deleted).toHaveLength(0);
    expect(body.moved).toHaveLength(0);
    expect(body.updated).toHaveLength(0);
    expect(body.new).toHaveLength(0);
  } );

  it("fixAll one new", async () => {
    // Remove one music in remote
    const musics = [...MUSICS_SAMPLES_IN_DISK];
    const deletedMusic = musics.splice(2, 1)[0];
    const musicFileInfos = [...fixtureMusicFileInfos.Disk.List];
    const deletedMusicFileInfo = musicFileInfos.splice(
      musicFileInfos.findIndex(mf=>mf.musicId === deletedMusic.id),
      1,
    )[0];

    musicRepoMock.getAll.mockResolvedValue(musics);
    musicFileInfoRepoMock.getAll.mockResolvedValue(musicFileInfos);
    musicFileInfoRepoMock.upsertOneByPathAndGet.mockResolvedValue(deletedMusicFileInfo);
    musicRepoMock.createOneFromPath = jest.fn((path: string) => {
      const musicFileInfo = fixtureMusicFileInfos.Disk.List.find((m) => m.path === path)!;
      const music = MUSICS_SAMPLES_IN_DISK.find(m=>m.id === musicFileInfo.musicId);

      assertIsDefined(music);

      return Promise.resolve(music);
    } );
    const response = await request(routerApp)
      .get("/update/remote")
      .expect(200);
    const body = response.body as UpdateResult;

    expect(body).toBeDefined();
    expect(body.deleted).toHaveLength(0);
    expect(body.updated).toHaveLength(0);
    expect(body.moved).toHaveLength(0);
    expect(body.new).toHaveLength(1);

    const newGotParsedMusic = musicEntitySchema.parse(body.new[0].music);

    expect(newGotParsedMusic).toEqual(deletedMusic);

    const newGotParsedMusicFileInfo = musicFileInfoEntitySchema.parse(body.new[0].fileInfo);

    expect(newGotParsedMusicFileInfo).toEqual(deletedMusicFileInfo);
  } );
} );
