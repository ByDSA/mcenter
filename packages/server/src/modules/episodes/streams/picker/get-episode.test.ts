import { DEPENDENCY_SIMPSONS } from "$sharedSrc/models/episodes/dependencies/test";
import { EpisodeDependenciesRepository } from "#episodes/dependencies/crud/repository";
import { EpisodesRepository } from "#episodes/crud/repositories/episodes";
import { StreamEntity } from "#episodes/streams";
import { StreamsRepository } from "#episodes/streams/crud/repository";
import { EpisodeDependencyEntity } from "#episodes/dependencies/models";
import { STREAM_SIMPSONS } from "#episodes/streams/tests";
import { EpisodeHistoryRepository } from "#episodes/history/crud/repository";
import { fixtureEpisodes } from "#episodes/tests";
import { fixtureEpisodeHistoryEntries } from "#episodes/history/tests";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { EpisodesUsersRepository } from "#episodes/crud/repositories/user-infos";
import { EpisodeEntity, EpisodeEntityWithUserInfo } from "#episodes/models";
import { SeriesRepository } from "#episodes/series/crud/repository";
import { EpisodeFileInfoRepository } from "#episodes/file-info";
import { StreamGetRandomEpisodeService } from "./get-episode.service";

describe("streamGetRandomEpisode", () => {
  let testingSetup: TestingSetup;
  let service: StreamGetRandomEpisodeService;
  let mocks: Awaited<ReturnType<typeof initMocks>>;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
      ],
      controllers: [],
      providers: [
        getOrCreateMockProvider(StreamsRepository),
        getOrCreateMockProvider(EpisodesRepository),
        getOrCreateMockProvider(EpisodeHistoryRepository),
        getOrCreateMockProvider(EpisodeDependenciesRepository),
        getOrCreateMockProvider(EpisodesUsersRepository),
        getOrCreateMockProvider(EpisodeFileInfoRepository),
        getOrCreateMockProvider(SeriesRepository),
        StreamGetRandomEpisodeService,
      ],
    } );

    mocks = await initMocks(testingSetup);
    service = testingSetup.module.get(StreamGetRandomEpisodeService);
    mocks.episodesUsersRepo.getFullSerieForUser.mockResolvedValue(
      fixtureEpisodes.Simpsons.ListForUser.NormalUser,
    );
  } );

  // eslint-disable-next-line require-await
  async function initMocks(setup: TestingSetup) {
    const ret = {
      dependenciesRepo: setup.getMock(EpisodeDependenciesRepository),
      episodesRepo: setup.getMock(EpisodesRepository),
      historyEntriesRepo: setup.getMock(EpisodeHistoryRepository),
      streamsRepo: setup.getMock(StreamsRepository),
      episodesUsersRepo: setup.getMock(EpisodesUsersRepository),
      seriesRepo: setup.getMock(SeriesRepository),
      fileInfosRepo: setup.getMock(EpisodeDependenciesRepository),
    };

    return ret;
  }

  beforeEach(()=> {
    jest.clearAllMocks();
  } );

  it("one dependency test", async ()=> {
    const stream: StreamEntity = STREAM_SIMPSONS;

    mocks.historyEntriesRepo.findLast.mockResolvedValueOnce(
      fixtureEpisodeHistoryEntries.Simpsons.Samples.EP6x25,
    );
    mocks.episodesRepo.getOneById.mockResolvedValueOnce(
      fixtureEpisodes.Simpsons.Samples.Dependency.last,
    );
    mocks.dependenciesRepo.getAll.mockResolvedValueOnce([DEPENDENCY_SIMPSONS]);

    const ret = await service.getByStream(stream);
    const expectedNext = addUserInfo(fixtureEpisodes.Simpsons.Samples.Dependency.next);

    expect(ret).toStrictEqual([expectedNext]);
  } );

  it("two dependency test", async ()=> {
    const stream: StreamEntity = STREAM_SIMPSONS;

    mocks.historyEntriesRepo.findLast.mockResolvedValueOnce(
      fixtureEpisodeHistoryEntries.Simpsons.Samples.EP6x25,
    );
    mocks.episodesRepo.getOneById.mockResolvedValueOnce(
      fixtureEpisodes.Simpsons.Samples.Dependency.last,
    );

    const nextOne = fixtureEpisodes.Simpsons.Samples.Dependency.next;
    const nextTwo = fixtureEpisodes.Simpsons.Samples.EP1x02;
    const nextTwoDependency: EpisodeDependencyEntity = {
      id: "1",
      lastEpisodeId: nextOne.id,
      nextEpisodeId: nextTwo.id,
    };

    mocks.dependenciesRepo.getAll.mockResolvedValueOnce([DEPENDENCY_SIMPSONS, nextTwoDependency]);

    const ret = await service.getByStream(stream, 2);
    const actualFirstWithoutLastTimePlayed = ret[0];
    const actualSecondWithoutLastTimePlayed = ret[1];

    expect([
      actualFirstWithoutLastTimePlayed,
      actualSecondWithoutLastTimePlayed,
    ]).toStrictEqual([
      addUserInfo(nextOne),
      addUserInfo(nextTwo),
    ]);
  } );
} );

function addUserInfo(episode: EpisodeEntity): EpisodeEntityWithUserInfo {
  return {
    ...episode,
    userInfo: fixtureEpisodes.Simpsons.ListForUser.NormalUser.find(
      e=>e.id === episode.id,
    )!.userInfo,
  };
}
