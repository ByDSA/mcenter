import { UnprocessableEntityException } from "@nestjs/common";
import { fixtureMusicFileInfos } from "$sharedSrc/models/musics/file-info/tests/fixtures";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { createMockedModule, getOrCreateMockProvider } from "#utils/nestjs/tests";
import { MusicHistoryModule } from "#musics/history/module";
import { MusicsCrudModule } from "#musics/crud/module";
import { MusicsRepository } from "#musics/crud/repositories/music";
import { fixtureMusics } from "#musics/tests";
import { mockMongoId } from "#tests/mongo";
import { MusicHistoryRepository } from "#musics/history/crud/repository";
import { PlayService } from "../play.service";
import { mockRemotePlayersRepositoryProvider } from "../player-services/repository/tests/repository";
import { RemotePlayersRepository } from "../player-services/repository";
import { PlayMusicService } from "./service";

describe("playMusicService", () => {
  let testingSetup: TestingSetup;
  let service: PlayMusicService;
  let mocks: Awaited<ReturnType<typeof initMocks>>;
  let validRemotePlayerId = mockMongoId;

  // eslint-disable-next-line require-await
  async function initMocks(setup: TestingSetup) {
    const ret = {
      musicRepo: setup.getMock(MusicsRepository),
      playService: setup.getMock(PlayService),
      historyRepo: setup.getMock(MusicHistoryRepository),
      remotePlayersRepo: setup.getMock(RemotePlayersRepository),
    };

    ret.musicRepo.getOneBySlug
      .mockResolvedValue( {
        ...fixtureMusics.Disk.Samples.DK,
        fileInfos: [
          fixtureMusicFileInfos.Disk.Samples.DK,
        ],
      } );

    ret.remotePlayersRepo.getAllViewersOf.mockResolvedValue([fixtureUsers.Normal.User.id]);

    return ret;
  }

  const validPlayMusicParams: Parameters<typeof service.playMusic> = [
    validRemotePlayerId,
    "slugMusic",
    {},
  ];

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
        createMockedModule(MusicsCrudModule),
        createMockedModule(MusicHistoryModule),
      ],
      controllers: [],
      providers: [
        getOrCreateMockProvider(PlayService),
        PlayMusicService,
        mockRemotePlayersRepositoryProvider,
      ],
    }, {
      auth: {
        repositories: "mock",
        cookies: "mock",
      },
    } );

    mocks = await initMocks(testingSetup);
    service = await testingSetup.app.get(PlayMusicService);
  } );

  beforeEach(()=> {
    jest.clearAllMocks();
  } );

  describe("playMusic", () => {
    it("should go ok with valid props", async () => {
      const res = await service.playMusic(...validPlayMusicParams).catch(e=>e);

      expect(mocks.musicRepo.getOneBySlug).toHaveBeenCalled();
      expect(mocks.playService.play).toHaveBeenCalled();
      expect(mocks.remotePlayersRepo.getAllViewersOf).toHaveBeenCalled();
      expect(mocks.historyRepo.createNewEntryNowFor).toHaveBeenCalled();
      expect(res).not.toBeInstanceOf(Error);
    } );

    it("should return 422 if music not found", async () => {
      mocks.musicRepo.getOneBySlug.mockResolvedValueOnce(null);
      const res = await service.playMusic(...validPlayMusicParams).catch(e=>e);

      expect(res).toBeInstanceOf(UnprocessableEntityException);
    } );

    it("should return 200 if episode found", async () => {
      const spy = mocks.playService.play;
      const res = await service.playMusic(...validPlayMusicParams).catch(e=>e);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(res).not.toBeInstanceOf(Error);
    } );
  } );
} );
