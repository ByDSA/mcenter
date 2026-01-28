import { DEPENDENCY_SIMPSONS } from "$sharedSrc/models/episodes/dependencies/test";
import { EpisodeDependenciesRepository } from "#episodes/dependencies/crud/repository";
import { episodeHistoryRepositoryMockProvider } from "#episodes/history/crud/repository/tests";
import { EpisodesRepository } from "#episodes/crud/repositories/episodes";
import { episodeRepositoryMockProvider } from "#episodes/crud/repositories/episodes/tests";
import { StreamEntity } from "#episodes/streams";
import { StreamsRepository } from "#episodes/streams/crud/repository";
import { streamsRepositoryMockProvider } from "#episodes/streams/crud/repository/tests";
import { episodeDependenciesRepositoryMockProvider } from "#episodes/dependencies/crud/repository/tests";
import { EpisodeDependencyEntity } from "#episodes/dependencies/models";
import { STREAM_SIMPSONS } from "#episodes/streams/tests";
import { EpisodeHistoryRepository } from "#episodes/history/crud/repository";
import { fixtureEpisodes } from "#episodes/tests";
import { fixtureEpisodeHistoryEntries } from "#episodes/history/tests";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { createMockProvider } from "#utils/nestjs/tests";
import { EpisodesUsersRepository } from "#episodes/crud/repositories/user-infos";
import { EpisodeEntity, EpisodeEntityWithUserInfo } from "#episodes/models";
import { seriesRepositoryMockProvider } from "#episodes/series/crud/repository/tests";
import { SeriesRepository } from "#episodes/series/crud/repository";
import { episodeFileInfoRepositoryMockProvider } from "#episodes/file-info/crud/repository/tests";
import { StreamGetRandomEpisodeService } from "./get-episode.service";

describe("streamGetRandomEpisode", () => {
  let testingSetup: TestingSetup;
  let service: StreamGetRandomEpisodeService;
  let repos: {
    dependencies: jest.Mocked<EpisodeDependenciesRepository>;
    episodes: jest.Mocked<EpisodesRepository>;
    historyEntries: jest.Mocked<EpisodeHistoryRepository>;
    streams: jest.Mocked<StreamsRepository>;
    episodesUsers: jest.Mocked<EpisodesUsersRepository>;
    series: jest.Mocked<SeriesRepository>;
    fileInfos: jest.Mocked<EpisodeDependenciesRepository>;
  };

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
      ],
      controllers: [],
      providers: [
        streamsRepositoryMockProvider,
        episodeRepositoryMockProvider,
        episodeHistoryRepositoryMockProvider,
        episodeDependenciesRepositoryMockProvider,
        createMockProvider(EpisodesUsersRepository),
        StreamGetRandomEpisodeService,
        seriesRepositoryMockProvider,
        episodeFileInfoRepositoryMockProvider,
      ],
    } );
    repos = {
      dependencies: testingSetup.module.get(EpisodeDependenciesRepository),
      episodes: testingSetup.module.get<jest.Mocked<EpisodesRepository>>(EpisodesRepository),
      historyEntries: testingSetup.module.get(EpisodeHistoryRepository),
      streams: testingSetup.module.get(StreamsRepository),
      episodesUsers: testingSetup.module.get(EpisodesUsersRepository),
      series: testingSetup.module.get(SeriesRepository),
      fileInfos: testingSetup.module.get(EpisodeDependenciesRepository),
    };
    service = testingSetup.module.get(StreamGetRandomEpisodeService);
    repos.episodesUsers.getFullSerieForUser.mockResolvedValue(
      fixtureEpisodes.Simpsons.ListForUser.NormalUser,
    );
  } );

  it("one dependency test", async ()=> {
    const stream: StreamEntity = STREAM_SIMPSONS;

    repos.historyEntries.findLast.mockResolvedValueOnce(
      fixtureEpisodeHistoryEntries.Simpsons.Samples.EP6x25,
    );
    repos.episodes.getOneByCompKey.mockResolvedValueOnce(
      fixtureEpisodes.Simpsons.Samples.Dependency.last,
    );
    repos.dependencies.getAll.mockResolvedValueOnce([DEPENDENCY_SIMPSONS]);

    const ret = await service.getByStream(stream);
    const expectedNext = addUserInfo(fixtureEpisodes.Simpsons.Samples.Dependency.next);

    expect(ret).toStrictEqual([expectedNext]);
  } );

  it("two dependency test", async ()=> {
    const stream: StreamEntity = STREAM_SIMPSONS;

    repos.historyEntries.findLast.mockResolvedValueOnce(
      fixtureEpisodeHistoryEntries.Simpsons.Samples.EP6x25,
    );
    repos.episodes.getOneByCompKey.mockResolvedValueOnce(
      fixtureEpisodes.Simpsons.Samples.Dependency.last,
    );

    const nextOne = fixtureEpisodes.Simpsons.Samples.Dependency.next;
    const nextTwo = fixtureEpisodes.Simpsons.Samples.EP1x02;
    const nextTwoDependency: EpisodeDependencyEntity = {
      id: "1",
      lastCompKey: nextOne.compKey,
      nextCompKey: nextTwo.compKey,
    };

    repos.dependencies.getAll.mockResolvedValueOnce([DEPENDENCY_SIMPSONS, nextTwoDependency]);

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
