import { EpisodeDependenciesRepository } from "#episodes/dependencies/crud/repository";
import { EpisodesRepository } from "#episodes/crud/episodes/repository";
import { StreamEntity } from "#episodes/streams";
import { StreamsRepository } from "#episodes/streams/crud/repository";
import { EpisodeDependencyEntity } from "#episodes/dependencies/models";
import { EpisodeHistoryRepository } from "#episodes/history/crud/repository";
import { fixtureEpisodes } from "#episodes/tests";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { EpisodesUsersRepository } from "#episodes/crud/user-infos/repository";
import { SeriesRepository } from "#episodes/series/crud/repository";
import { EpisodeFileInfoRepository } from "#episodes/file-info";
import { StreamGetRandomEpisodeService } from "./service";

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

    mocks = await initMocks();
    service = testingSetup.module.get(StreamGetRandomEpisodeService);
  } );

  // eslint-disable-next-line require-await
  async function initMocks() {
    const ret = {
      dependenciesRepo: testingSetup.getMock(EpisodeDependenciesRepository),
      episodesRepo: testingSetup.getMock(EpisodesRepository),
      historyEntriesRepo: testingSetup.getMock(EpisodeHistoryRepository),
      streamsRepo: testingSetup.getMock(StreamsRepository),
      episodesUsersRepo: testingSetup.getMock(EpisodesUsersRepository),
      seriesRepo: testingSetup.getMock(SeriesRepository),
      fileInfosRepo: testingSetup.getMock(EpisodeDependenciesRepository),
    };

    return ret;
  }

  beforeEach(()=> {
    jest.clearAllMocks();
  } );

  const stream: StreamEntity = fixtureEpisodes.Streams.Samples.Simpsons;

  it("one dependency test", async ()=> {
    mocks.historyEntriesRepo.findLast.mockResolvedValueOnce(
      fixtureEpisodes.Simpsons.HistoryEntries.Samples.EP6x25,
    );

    const ret = await service.getByStream(stream);

    expect(ret).toHaveLength(1);
    expect(ret[0].userInfo).toBeDefined();
    expect(ret[0]).toMatchObject(fixtureEpisodes.Simpsons.Episodes.Samples.EP7x01);
  } );

  it("two dependency test", async ()=> {
    mocks.historyEntriesRepo.findLast.mockResolvedValueOnce(
      fixtureEpisodes.Simpsons.HistoryEntries.Samples.EP6x25,
    );

    const nextOne = fixtureEpisodes.Simpsons.Episodes.Samples.EP7x01;
    const nextTwo = fixtureEpisodes.Simpsons.Episodes.Samples.EP1x02;
    const nextTwoDependency: EpisodeDependencyEntity = {
      id: "1",
      lastEpisodeId: nextOne.id,
      nextEpisodeId: nextTwo.id,
    };

    mocks.dependenciesRepo.getAll.mockResolvedValueOnce([
      fixtureEpisodes.Simpsons.Episodes.Dependencies.Sample,
      nextTwoDependency,
    ]);

    const ret = await service.getByStream(stream, 2);

    expect(ret).toHaveLength(2);

    expect(ret[0].userInfo).toBeDefined();
    expect(ret[0]).toMatchObject(nextOne);
    expect(ret[1].userInfo).toBeDefined();
    expect(ret[1]).toMatchObject(nextTwo);
  } );
} );
