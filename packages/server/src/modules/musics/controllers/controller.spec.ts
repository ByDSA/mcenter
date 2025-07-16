import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Application } from "express";
import { assertIsDefined } from "$shared/utils/validation";
import { MusicRepository } from "../repositories";
import { MUSICS_SAMPLES_IN_DISK } from "../repositories/tests";
import { UpdateRemoteTreeService, UpdateResult } from "../services";
import { musicRepoMockProvider } from "../repositories/tests";
import { musicHistoryRepoMockProvider } from "../history/repositories/tests/RepositoryMock";
import { MusicUpdateRemoteController } from "./update-remote.controller";
import { MusicFixController } from "./fix.controller";
import { MusicGetController } from "./get.controller";
import { createTestingAppModuleAndInit, TestingSetup } from "#tests/nestjs/app";
import { musicEntitySchema } from "#musics/models";

describe("getAll", () => {
  let musicRepoMock: MusicRepository;
  let app: INestApplication;
  let routerApp: Application;
  let testingSetup: TestingSetup;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      controllers: [MusicGetController, MusicUpdateRemoteController, MusicFixController],
      providers: [
        musicRepoMockProvider,
        musicHistoryRepoMockProvider,
        UpdateRemoteTreeService,
      ],
    } );

    app = testingSetup.app;
    routerApp = testingSetup.routerApp;

    musicRepoMock = testingSetup.module.get<MusicRepository>(MusicRepository);
  } );

  afterAll(async () => {
    await app.close();
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  it("getRandom", async () => {
    const musics = MUSICS_SAMPLES_IN_DISK;

    musicRepoMock.findAll = jest.fn().mockResolvedValueOnce(musics);
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
    const musics = MUSICS_SAMPLES_IN_DISK;

    musicRepoMock.findAll = jest.fn().mockResolvedValueOnce(musics);
    musicRepoMock.createOneFromPath = jest.fn((path: string) => {
      const music = MUSICS_SAMPLES_IN_DISK.find((m) => m.path === path);

      assertIsDefined(music);

      return Promise.resolve( {
        ...music,
        id: "id",
      } );
    } );
    musicRepoMock.updateOneByPath = jest.fn().mockResolvedValue(undefined);
    musicRepoMock.deleteOneByPath = jest.fn().mockResolvedValue(undefined);
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
    const musics = MUSICS_SAMPLES_IN_DISK.toSpliced(1, 1);

    musicRepoMock.findAll = jest.fn().mockResolvedValueOnce(musics);
    musicRepoMock.createOneFromPath = jest.fn((path: string) => {
      const music = MUSICS_SAMPLES_IN_DISK.find((m) => m.path === path);

      assertIsDefined(music);

      return Promise.resolve(music);
    } );
    musicRepoMock.updateOneByPath = jest.fn().mockResolvedValue(undefined);
    musicRepoMock.deleteOneByPath = jest.fn().mockResolvedValue(undefined);
    const response = await request(routerApp)
      .get("/update/remote")
      .expect(200);
    const body = response.body as UpdateResult;

    expect(body).toBeDefined();
    expect(body.deleted).toHaveLength(0);
    expect(body.updated).toHaveLength(0);
    expect(body.moved).toHaveLength(0);
    expect(body.new).toHaveLength(1);

    const newGotParsed = musicEntitySchema.parse(body.new[0]);

    expect(newGotParsed).toEqual(MUSICS_SAMPLES_IN_DISK[1]);
  } );
} );
