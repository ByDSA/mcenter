import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { TestingSetup, createTestingAppModuleAndInit } from "#core/app/tests/app";
import { loadFixtureAuthUsers } from "#core/db/tests/fixtures/sets/auth-users";
import { loadFixtureSampleSeries } from "#core/db/tests/fixtures/sets/SampleSeries";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { fixtureEpisodes } from "#episodes/tests";
import { createMockedModule } from "#utils/nestjs/tests";
import { EpisodesRepository } from ".";

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

      expect(ret.data).toHaveLength(fixtureEpisodes.SampleSeries.Episodes.List.length);
    } );

    it("filter: serieId + episodeKey", async () => {
      const props = [{
        filter: {
          episodeKey: fixtureEpisodes.SampleSeries.Episodes.Samples.EP1x01.episodeKey,
          seriesId: fixtureEpisodes.Series.Samples.SampleSeries.id,
        },
      }] satisfies Parameters<typeof repo.getMany>;
      const ret = await repo.getMany(...props);

      expect(ret.data).toHaveLength(1);
    } );

    it("cannot expand user info without authentication", async () => {
      const props = [{
        filter: {
          episodeKey: fixtureEpisodes.SampleSeries.Episodes.Samples.EP1x01.episodeKey,
          seriesId: fixtureEpisodes.Series.Samples.SampleSeries.id,
        },
        expand: ["userInfo"],
      }] satisfies Parameters<typeof repo.getMany>;
      const ret = await repo.getMany(...props);

      expect(ret.data[0].userInfo).toBeUndefined();
    } );

    it("expands", async () => {
      const props = [{
        filter: {
          episodeKey: fixtureEpisodes.SampleSeries.Episodes.Samples.EP1x01.episodeKey,
          seriesId: fixtureEpisodes.Series.Samples.SampleSeries.id,
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
