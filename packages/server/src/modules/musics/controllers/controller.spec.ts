import { Application } from "express";
import request from "supertest";
import { MusicHistoryRepository } from "../history";
import { MusicHistoryRepositoryMock } from "../history/repositories/tests";
import { MusicRepository } from "../repositories";
import { MUSICS_SAMPLES_IN_DISK, MusicRepositoryMock } from "../repositories/tests";
import { UpdateResult } from "../services";
import { MusicController } from "./Controller";
import { RouterApp } from "#utils/express/test";
import { registerSingletonIfNotAndGet } from "#tests/main";
import { parseMusic } from "#musics/models";

describe("getAll", () => {
  let routerApp: Application;
  let musicRepositoryMock: MusicRepositoryMock;
  let controller: MusicController;

  beforeAll(() => {
    musicRepositoryMock = registerSingletonIfNotAndGet(
      MusicRepository,
      MusicRepositoryMock,
    ) as unknown as MusicRepositoryMock;
    registerSingletonIfNotAndGet(MusicHistoryRepository, MusicHistoryRepositoryMock);
    controller = registerSingletonIfNotAndGet(MusicController);

    routerApp = RouterApp(controller.getRouter());
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  it("should be defined", () => {
    expect(musicRepositoryMock).toBeDefined();
    expect(routerApp).toBeDefined();
  } );

  it("getRandom", async () => {
    const musics = MUSICS_SAMPLES_IN_DISK;

    musicRepositoryMock.findAll = jest.fn().mockResolvedValueOnce(musics);
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

    musicRepositoryMock.findAll = jest.fn().mockResolvedValueOnce(musics);
    musicRepositoryMock.createFromPath = jest.fn((path: string) => {
      const music = MUSICS_SAMPLES_IN_DISK.find((m) => m.path === path);

      return Promise.resolve(music);
    } );
    musicRepositoryMock.updateOneByPath = jest.fn().mockResolvedValue(undefined);
    musicRepositoryMock.deleteOneByPath = jest.fn().mockResolvedValue(undefined);
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

    musicRepositoryMock.findAll = jest.fn().mockResolvedValueOnce(musics);
    musicRepositoryMock.createFromPath = jest.fn((path: string) => {
      const music = MUSICS_SAMPLES_IN_DISK.find((m) => m.path === path);

      return Promise.resolve(music);
    } );
    musicRepositoryMock.updateOneByPath = jest.fn().mockResolvedValue(undefined);
    musicRepositoryMock.deleteOneByPath = jest.fn().mockResolvedValue(undefined);
    const response = await request(routerApp)
      .get("/update/remote")
      .expect(200);
    const body = response.body as UpdateResult;

    expect(body).toBeDefined();
    expect(body.deleted).toHaveLength(0);
    expect(body.updated).toHaveLength(0);
    expect(body.moved).toHaveLength(0);
    expect(body.new).toHaveLength(1);

    const newGotParsed = parseMusic(body.new[0]);

    expect(newGotParsed).toEqual(MUSICS_SAMPLES_IN_DISK[1]);
  } );
} );
