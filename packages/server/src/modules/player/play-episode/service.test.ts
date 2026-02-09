import { UnprocessableEntityException } from "@nestjs/common";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { UserPayload } from "$shared/models/auth";
import { SERIES_SAMPLE_SERIES } from "$shared/models/episodes/series/tests/fixtures";
import { SeriesCrudModule } from "#episodes/series/crud/module";
import { EpisodeHistoryCrudModule } from "#episodes/history/crud/module";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { createMockedModule, getOrCreateMockProvider } from "#utils/nestjs/tests";
import { StreamPickerModule } from "#episodes/streams/picker/module";
import { EpisodePickerService } from "#episodes/streams/picker";
import { StreamsCrudModule } from "#episodes/streams/crud/module";
import { StreamsRepository } from "#episodes/streams/crud/repository";
import { mockMongoId } from "#tests/mongo";
import { SeriesRepository } from "#episodes/series/crud/repository";
import { EpisodeHistoryRepository } from "#episodes/history/crud/repository";
import { STREAM_SAMPLE } from "#episodes/streams/tests";
import { fixtureEpisodes } from "#episodes/tests";
import { mockRemotePlayersRepositoryProvider } from "../player-services/repository/tests/repository";
import { PlayService } from "../play.service";
import { RemotePlayersRepository } from "../player-services/repository";
import { PlayEpisodeService } from "./service";

describe("playEpisodeService", () => {
  let testingSetup: TestingSetup;
  let service: PlayEpisodeService;
  let mocks: Awaited<ReturnType<typeof initMocks>>;
  let validRemotePlayerId = mockMongoId;

  async function initMocks(setup: TestingSetup) {
    const ret = {
      streamRepo: setup.getMock(StreamsRepository),
      episodePickerService: setup.getMock(EpisodePickerService),
      seriesRepo: setup.getMock(SeriesRepository),
      historyRepo: setup.getMock(EpisodeHistoryRepository),
      remotePlayersRepo: setup.getMock(RemotePlayersRepository),
      playService: setup.getMock(PlayService),
    };

    ret.streamRepo.getOneByKey.mockResolvedValue(STREAM_SAMPLE);
    // eslint-disable-next-line require-await
    ret.streamRepo.getOneById.mockImplementation(async id=> id === STREAM_SAMPLE.id
      ? STREAM_SAMPLE
      : null);
    ret.episodePickerService.getByStream
      .mockResolvedValue([fixtureEpisodes.SampleSeries.Samples.EP1x01]);
    ret.seriesRepo.getOneById.mockResolvedValue(SERIES_SAMPLE_SERIES);

    ret.remotePlayersRepo.getAllViewersOf.mockResolvedValue([fixtureUsers.Normal.User.id]);

    // User
    await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles as UserPayload);

    return ret;
  }

  const validPlayEpisodeStreamProps: Parameters<typeof service.playEpisodeStream>[0] = {
    remotePlayerId: validRemotePlayerId,
    query: {},
    userId: fixtureUsers.Normal.User.id,
    streamKey: "streamId",
  };

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
        createMockedModule(StreamPickerModule),
        createMockedModule(StreamsCrudModule),
        createMockedModule(EpisodeHistoryCrudModule),
        createMockedModule(SeriesCrudModule),
        createMockedModule(EpisodesCrudModule),
      ],
      controllers: [],
      providers: [
        getOrCreateMockProvider(PlayService),
        mockRemotePlayersRepositoryProvider,
        PlayEpisodeService,
      ],
    }, {
      auth: {
        repositories: "mock",
        cookies: "mock",
      },
    } );

    mocks = await initMocks(testingSetup);
    service = await testingSetup.app.get(PlayEpisodeService);
  } );

  beforeEach(()=> {
    jest.clearAllMocks();
  } );

  describe("playEpisodeStream", () => {
    it("should go ok with valid props", async () => {
      const res = await service.playEpisodeStream(validPlayEpisodeStreamProps).catch(e=>e);

      expect(mocks.streamRepo.getOneByKey).toHaveBeenCalled();
      expect(mocks.episodePickerService.getByStream).toHaveBeenCalled();
      expect(mocks.seriesRepo.getOneById).toHaveBeenCalled();
      expect(mocks.remotePlayersRepo.getAllViewersOf).toHaveBeenCalled();
      expect(mocks.historyRepo.addEpisodesToHistory).toHaveBeenCalled();
      expect(mocks.playService.play).toHaveBeenCalled();
      expect(res).not.toBeInstanceOf(Error);
    } );

    it("should return 422 if stream not found", async () => {
      mocks.streamRepo.getOneByKey.mockResolvedValueOnce(null);

      await expect(service.playEpisodeStream(validPlayEpisodeStreamProps))
        .rejects.toThrow(UnprocessableEntityException);
    } );

    it("should return 422 if no episodes found", async () => {
      mocks.episodePickerService.getByStream.mockResolvedValueOnce([]);

      await expect(service.playEpisodeStream(validPlayEpisodeStreamProps))
        .rejects.toThrow(UnprocessableEntityException);
    } );

    it("should return 422 if episodes are null/undefined", async () => {
      mocks.episodePickerService.getByStream.mockResolvedValueOnce([null, undefined] as any[]);

      await expect(service.playEpisodeStream(validPlayEpisodeStreamProps))
        .rejects.toThrow(UnprocessableEntityException);
    } );

    describe("param query", ()=> {
      describe("combinations of force and n", () => {
        const forces = [true, false, undefined];
        const ns = [1, 5, undefined];
        const testCases = forces.flatMap(force => ns.map(n => ( {
          force,
          n,
        } )));

        describe.each(testCases)(
          "when force is $force and n is $n",
          ( { force, n } ) => {
            it("should go ok and not return an Error", async () => {
              const res = await service.playEpisodeStream( {
                ...validPlayEpisodeStreamProps,
                query: {
                  ...validPlayEpisodeStreamProps.query,
                  force,
                  n,
                },
              } ).catch(e => e);

              expect(res).not.toBeInstanceOf(Error);
            } );
          },
        );
      } );

      it("edge case with n negative should not throw error", async () => {
        await expect(service.playEpisodeStream( {
          ...validPlayEpisodeStreamProps,
          query: {
            ...validPlayEpisodeStreamProps.query,
            n: -5,
          },
        } )).resolves.not.toBeInstanceOf(Error);
      } );
    } );
  } );
} );
