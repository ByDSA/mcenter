import request from "supertest";
import { assertIsDefined } from "$shared/utils/validation";
import { fixtureMusics } from "$sharedSrc/models/musics/tests/fixtures";
import { fixtureMusicFileInfos } from "$sharedSrc/models/musics/file-info/tests/fixtures";
import { MusicRepository } from "../rest/repository";
import { MusicFileInfoRepository } from "../file-info/rest/repository";
import { MusicBuilderService } from "../builder/music-builder.service";
import { MusicUrlGeneratorService } from "../builder/url-generator.service";
import { musicFileInfoEntitySchema } from "../file-info/models";
import { musicEntitySchema } from "../models";
import { musicFileInfoRepositoryMockProvider } from "../file-info/rest/repository/tests";
import { musicRepoMockProvider } from "../rest/repository/tests";
import { MusicUpdateRemoteController } from "./controller";
import { UpdateRemoteTreeService, UpdateResult } from "./service";
import { DomainEventEmitterModule } from "#main/domain-event-emitter/module";
import { createTestingAppModuleAndInit, TestingSetup } from "#main/app/tests/app";

const MUSICS_SAMPLES_IN_DISK = fixtureMusics.Disk.List;

describe("updateRemoteController", () => {
  let testingSetup: TestingSetup;
  let musicRepoMock: jest.Mocked<MusicRepository>;
  let musicFileInfoRepoMock: jest.Mocked<MusicFileInfoRepository>;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [DomainEventEmitterModule],
      controllers: [MusicUpdateRemoteController],
      providers: [
        UpdateRemoteTreeService,
        musicRepoMockProvider,
        MusicBuilderService,
        MusicUrlGeneratorService,
        musicFileInfoRepositoryMockProvider,
      ],
    }, {
      db: {
        using: "default",
      },
    } );

    musicRepoMock = testingSetup.module.get<jest.Mocked<MusicRepository>>(MusicRepository);
    musicFileInfoRepoMock = testingSetup.module.get<jest.Mocked<MusicFileInfoRepository>>(
      MusicFileInfoRepository,
    );
    musicRepoMock.createOneFromPath.mockImplementation((path: string) => {
      const musicFileInfo = fixtureMusicFileInfos.Disk.List.find((m) => m.path === path)!;
      const music = MUSICS_SAMPLES_IN_DISK.find(m=>m.id === musicFileInfo.musicId);

      assertIsDefined(music);

      return Promise.resolve( {
        ...music,
        id: "id",
      } );
    } );
    musicFileInfoRepoMock.upsertOneByPathAndGet.mockImplementation((path: string)=> {
      const musicFileInfo = fixtureMusicFileInfos.Disk.List.find((m) => m.path === path)!;

      return Promise.resolve(musicFileInfo);
    } );
  } );

  describe("should update remote tree", () => {
    let response: request.Response;

    beforeEach(async () => {
      if (response)
        return;

      musicFileInfoRepoMock.getAll.mockResolvedValue([]);
      response = await request(testingSetup.routerApp)
        .get("/update/remote")
        .expect(200)
        .send();
    } );

    it("should return a response with deleted, new, updated and moved", () => {
      expect(response.body).toBeDefined();
      expect(response.text).toBeDefined();
      expect(response.body).toHaveProperty("deleted");
      expect(response.body).toHaveProperty("new");
      expect(response.body).toHaveProperty("updated");
      expect(response.body).toHaveProperty("moved");
    } );

    it("should return empty updated, deleted and moved", () => {
      expect(response.body.updated).toHaveLength(0);
      expect(response.body.deleted).toHaveLength(0);
      expect(response.body.moved).toHaveLength(0);
    } );

    it("should return some new musics", () => {
      const actualNewMusics = response.body.new;

      expect(actualNewMusics).not.toHaveLength(0);
    } );
  } );

  it("fixAll no changes", async () => {
    musicFileInfoRepoMock.getAll.mockResolvedValue(fixtureMusicFileInfos.Disk.List);
    const response = await request(testingSetup.routerApp)
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
    const response = await request(testingSetup.routerApp)
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
