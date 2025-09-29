import { assertIsDefined } from "$shared/utils/validation";
import { fixtureMusics } from "$sharedSrc/models/musics/tests/fixtures";
import { fixtureMusicFileInfos } from "$sharedSrc/models/musics/file-info/tests/fixtures";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { createMockedModule } from "#utils/nestjs/tests";
import { MockJob } from "#core/tasks/tests";
import { MusicsRepository } from "../../crud/repository";
import { MusicFileInfoRepository } from "../../file-info/crud/repository";
import { musicFileInfoEntitySchema } from "../../file-info/models";
import { musicEntitySchema } from "../../models";
import { MusicFileInfoModule } from "../../file-info/module";
import { MusicsCrudModule } from "../../crud/module";
import { UpdateRemoteTreeService, UpdateResult } from "./service";

const MUSICS_SAMPLES_IN_DISK = fixtureMusics.Disk.List;

describe("updateRemoteService", () => {
  let testingSetup: TestingSetup;
  let musicRepoMock: jest.Mocked<MusicsRepository>;
  let musicFileInfoRepoMock: jest.Mocked<MusicFileInfoRepository>;
  let service: UpdateRemoteTreeService;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
        createMockedModule(MusicFileInfoModule),
        createMockedModule(MusicsCrudModule),
      ],
      controllers: [],
      providers: [
        UpdateRemoteTreeService,
      ],
    }, {
      db: {
        using: "default",
      },
    } );

    musicRepoMock = testingSetup.getMock(MusicsRepository);
    musicFileInfoRepoMock = testingSetup.getMock(MusicFileInfoRepository);
    musicRepoMock.createOneFromPath.mockImplementation((path: string) => {
      const musicFileInfo = fixtureMusicFileInfos.Disk.List.find((m) => m.path === path)!;
      const music = MUSICS_SAMPLES_IN_DISK.find(m=>m.id === musicFileInfo.musicId);

      assertIsDefined(music);

      return Promise.resolve( {
        music: {
          ...music,
          id: "id",
        },
        fileInfo: musicFileInfo,
      } );
    } );
    musicFileInfoRepoMock.upsertOneByPathAndGet.mockImplementation((path: string)=> {
      const musicFileInfo = fixtureMusicFileInfos.Disk.List.find((m) => m.path === path)!;

      return Promise.resolve(musicFileInfo);
    } );
    service = testingSetup.app.get<UpdateRemoteTreeService>(UpdateRemoteTreeService);
  } );

  describe("should update remote tree", () => {
    let result: UpdateResult;

    beforeEach(async () => {
      if (result)
        return;

      musicFileInfoRepoMock.getAll.mockResolvedValue([]);

      result = await service.update( {
        job: new MockJob(),
      } );
    } );

    it("should return a response with deleted, new, updated and moved", () => {
      expect(result).toBeDefined();
      expect(result).toHaveProperty("deleted");
      expect(result).toHaveProperty("new");
      expect(result).toHaveProperty("updated");
      expect(result).toHaveProperty("moved");
    } );

    it("should return empty updated, deleted and moved", () => {
      expect(result.updated).toHaveLength(0);
      expect(result.deleted).toHaveLength(0);
      expect(result.moved).toHaveLength(0);
    } );

    it("should return some new musics", () => {
      const actualNewMusics = result.new;

      expect(actualNewMusics).not.toHaveLength(0);
    } );
  } );

  it("fixAll no changes", async () => {
    musicFileInfoRepoMock.getAll.mockResolvedValue(fixtureMusicFileInfos.Disk.List);
    const result = await service.update( {
      job: new MockJob(),
    } );

    expect(result).toBeDefined();
    expect(result.deleted).toHaveLength(0);
    expect(result.moved).toHaveLength(0);
    expect(result.updated).toHaveLength(0);
    expect(result.new).toHaveLength(0);
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

      return Promise.resolve( {
        music,
        fileInfo: musicFileInfo,
      } );
    } );
    const result = await service.update( {
      job: new MockJob(),
    } );

    expect(result).toBeDefined();
    expect(result.deleted).toHaveLength(0);
    expect(result.updated).toHaveLength(0);
    expect(result.moved).toHaveLength(0);
    expect(result.new).toHaveLength(1);

    const newGotParsedMusic = musicEntitySchema.parse(result.new[0].music);

    expect(newGotParsedMusic).toEqual(deletedMusic);

    const newGotParsedMusicFileInfo = musicFileInfoEntitySchema.parse(result.new[0].fileInfo);

    expect(newGotParsedMusicFileInfo).toEqual(deletedMusicFileInfo);
  } );
} );
