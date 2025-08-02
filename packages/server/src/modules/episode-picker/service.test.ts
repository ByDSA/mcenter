import { DEPENDENCY_SIMPSONS } from "$sharedSrc/models/episodes/dependencies/test";
import clone from "just-clone";
import { EpisodeDependenciesRepository } from "#episodes/dependencies/rest/repository";
import { episodeHistoryEntriesRepositoryMockProvider } from "#episodes/history/rest/repository/tests";
import { EpisodesRepository } from "#episodes/rest/repository";
import { episodeRepositoryMockProvider } from "#episodes/rest/repository/tests";
import { StreamEntity } from "#modules/streams";
import { StreamsRepository } from "#modules/streams/rest/repository";
import { streamsRepositoryMockProvider } from "#modules/streams/rest/repository/tests";
import { createTestingAppModuleAndInit, TestingSetup } from "#tests/nestjs/app";
import { episodeDependenciesRepositoryMockProvider } from "#episodes/dependencies/rest/repository/tests";
import { EpisodeDependencyEntity } from "#episodes/dependencies/models";
import { STREAM_SIMPSONS } from "#modules/streams/tests";
import { EpisodeHistoryEntriesRepository } from "#episodes/history/rest/repository";
import { EpisodePickerService } from "./service";
import { fixtureEpisodes } from "#episodes/tests";
import { HISTORY_ENTRY_SIMPSONS_6_25 } from "#episodes/history/tests";

describe("tests", () => {
  let testingSetup: TestingSetup;
  let service: EpisodePickerService;
  let repos: {
    dependencies: jest.Mocked<EpisodeDependenciesRepository>;
    episodes: jest.Mocked<EpisodesRepository>;
    historyEntries: jest.Mocked<EpisodeHistoryEntriesRepository>;
    streams: jest.Mocked<StreamsRepository>;
  };

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [],
      controllers: [],
      providers: [
        streamsRepositoryMockProvider,
        episodeRepositoryMockProvider,
        episodeHistoryEntriesRepositoryMockProvider,
        episodeDependenciesRepositoryMockProvider,
        EpisodePickerService,
      ],
    } );
    repos = {
      dependencies: testingSetup.module.get(EpisodeDependenciesRepository),
      episodes: testingSetup.module.get<jest.Mocked<EpisodesRepository>>(EpisodesRepository),
      historyEntries: testingSetup.module.get(EpisodeHistoryEntriesRepository),
      streams: testingSetup.module.get(StreamsRepository),
    };
    service = testingSetup.module.get(EpisodePickerService);
  } );

  it("one dependency test", async ()=> {
    const stream: StreamEntity = STREAM_SIMPSONS;

    repos.episodes.getManyBySerieKey.mockResolvedValueOnce(fixtureEpisodes.Simpsons.List);
    repos.historyEntries.findLast.mockResolvedValueOnce(HISTORY_ENTRY_SIMPSONS_6_25);
    repos.episodes.getOneByCompKey.mockResolvedValueOnce(
      fixtureEpisodes.Simpsons.Samples.Dependency.last,
    );
    repos.dependencies.getAll.mockResolvedValueOnce([DEPENDENCY_SIMPSONS]);

    const ret = await service.getByStream(stream);

    expect(ret).toStrictEqual([fixtureEpisodes.Simpsons.Samples.Dependency.next]);
  } );

  it("two dependency test", async ()=> {
    const stream: StreamEntity = STREAM_SIMPSONS;

    repos.episodes.getManyBySerieKey.mockResolvedValueOnce(clone(fixtureEpisodes.Simpsons.List));
    repos.historyEntries.findLast.mockResolvedValueOnce(HISTORY_ENTRY_SIMPSONS_6_25);
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
    const { lastTimePlayed: _1, ...actualFirstWithoutLastTimePlayed } = ret[0];
    const { lastTimePlayed: _2, ...actualSecondWithoutLastTimePlayed } = ret[1];

    expect([
      actualFirstWithoutLastTimePlayed,
      actualSecondWithoutLastTimePlayed,
    ]).toStrictEqual([
      nextOne,
      nextTwo,
    ]);
  } );
} );
