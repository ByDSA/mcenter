import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { Types } from "mongoose";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { fixtureEpisodes } from "#episodes/tests";
import { EpisodesUsersRepository } from "#episodes/crud/repositories/user-infos";
import { EpisodeHistoryRepository } from "../crud/repository";
import { EpisodeHistoryEntryEntity } from "../models";
import { EpisodeLastTimePlayedService } from "./service";

describe("episodeLastTimePlayedService", () => {
  let testingSetup: TestingSetup;
  let service: EpisodeLastTimePlayedService;
  let mocks: Awaited<ReturnType<typeof initMocks>>;
  const options = {
    requestingUserId: fixtureUsers.Normal.User.id,
  };

  // eslint-disable-next-line require-await
  async function initMocks(setup: TestingSetup) {
    const ret = {
      historyRepo: setup.getMock(EpisodeHistoryRepository),
      usersInfo: setup.getMock(EpisodesUsersRepository),
    };
    const episode = fixtureEpisodes.SampleSeries.Samples.EP1x01;
    const entry: EpisodeHistoryEntryEntity = {
      id: new Types.ObjectId().toString(),
      resourceId: episode.id,
      streamId: new Types.ObjectId().toString(),
      userId: fixtureUsers.Normal.User.id,
      date: new Date(),
    };

    ret.historyRepo.findLastByEpisodeId.mockResolvedValue(entry);

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [],
      controllers: [],
      providers: [
        getOrCreateMockProvider(EpisodesUsersRepository),
        getOrCreateMockProvider(EpisodeHistoryRepository),
        EpisodeLastTimePlayedService,
      ],
    } );

    mocks = await initMocks(testingSetup);
    service = await testingSetup.app.get(EpisodeLastTimePlayedService);
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  describe("calcEpisodeLastTimePlayedByEpisodeId", () => {
    const episode = fixtureEpisodes.SampleSeries.Samples.EP1x01;
    const episodeId = episode.id;

    it("should return timestamp of last time episode was played", async () => {
      const timestamp = await service.calcEpisodeLastTimePlayedByEpisodeId(episode.id, options);

      expect(timestamp).not.toBeNull();
      expect(timestamp!.getTime()).toBeGreaterThan(0);
    } );

    it("should return null for episode never played", async () => {
      mocks.historyRepo.findLastByEpisodeId.mockResolvedValue(null);
      const timestamp = await service.calcEpisodeLastTimePlayedByEpisodeId(episodeId, options);

      expect(timestamp).toBeNull();
    } );
  } );
} );
