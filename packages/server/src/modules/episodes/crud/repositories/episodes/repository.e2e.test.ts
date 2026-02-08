import { SERIES_SAMPLE_SERIES } from "$shared/models/episodes/series/tests/fixtures";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { loadFixtureAuthUsers } from "#core/db/tests/fixtures/sets/auth-users";
import { loadFixtureSampleSeries } from "#core/db/tests/fixtures/sets/SampleSeries";
import { createMockedModule } from "#utils/nestjs/tests";
import { fixtureEpisodes } from "#episodes/tests";
import { EpisodesRepository } from "./repository";

describe("episodesRepository", () => {
  let repo: EpisodesRepository;
  let testingSetup: TestingSetup;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
        createMockedModule(DomainEventEmitterModule),
      ],
      controllers: [],
      providers: [
        EpisodesRepository,
      ],
    }, {
      db: {
        using: "default",
      },
    } );

    await loadFixtureAuthUsers();

    await loadFixtureSampleSeries();

    repo = testingSetup.module.get(EpisodesRepository);
  } );

  describe("getMany", ()=> {
    it("get all", async () => {
      const props = [{}] satisfies Parameters<typeof repo.getMany>;
      const ret = await repo.getMany(...props);

      expect(ret.data).toHaveLength(fixtureEpisodes.SampleSeries.List.length);
    } );

    it("filter: serieId + episodeKey", async () => {
      const props = [{
        filter: {
          episodeKey: fixtureEpisodes.SampleSeries.Samples.EP1x01.episodeKey,
          seriesId: SERIES_SAMPLE_SERIES.id,
        },
      }] satisfies Parameters<typeof repo.getMany>;
      const ret = await repo.getMany(...props);

      expect(ret.data).toHaveLength(1);
    } );

    it("cannot expand user info without authentication", async () => {
      const props = [{
        filter: {
          episodeKey: fixtureEpisodes.SampleSeries.Samples.EP1x01.episodeKey,
          seriesId: SERIES_SAMPLE_SERIES.id,
        },
        expand: ["userInfo"],
      }] satisfies Parameters<typeof repo.getMany>;
      const ret = await repo.getMany(...props);

      expect(ret.data[0].userInfo).toBeUndefined();
    } );

    it("expands", async () => {
      const props = [{
        filter: {
          episodeKey: fixtureEpisodes.SampleSeries.Samples.EP1x01.episodeKey,
          seriesId: SERIES_SAMPLE_SERIES.id,
        },
        expand: ["fileInfos", "series", "userInfo"],
      }, {
        requestingUserId: fixtureUsers.Normal.User.id,
      }] satisfies Parameters<typeof repo.getMany>;
      const ret = await repo.getMany(...props);

      expect(ret.data[0].fileInfos).toBeDefined();
      expect(ret.data[0].series).toBeDefined();
      expect(ret.data[0].userInfo).toBeDefined();
    } );
  } );
} );
