import { Types } from "mongoose";
import { SERIES_SAMPLE_SERIES } from "$shared/models/episodes/series/tests/fixtures";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { StreamsRepository } from "#episodes/streams/crud/repository";
import { StreamEntity, StreamMode, StreamOriginType } from "#episodes/streams";
import { fixtureEpisodes } from "#episodes/tests";
import { loadFixtureSampleSeries } from "#core/db/tests/fixtures/sets/SampleSeries";
import { loadFixtureImageCoversInDisk } from "#core/db/tests/fixtures/sets/image-covers";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { EpisodeHistoryRepository } from "./repository";

describe("episodeHistoryRepository", () => {
  let testingSetup: TestingSetup;
  let repo: EpisodeHistoryRepository;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let mocks: Awaited<ReturnType<typeof initMocks>>;
  const options = {
    requestingUserId: fixtureUsers.Normal.User.id,
  };

  // eslint-disable-next-line require-await
  async function initMocks(setup: TestingSetup) {
    const ret = {
      streamsRepo: setup.getMock(StreamsRepository),
    };

    ret.streamsRepo.getOneOrCreateBySeriesId
      // eslint-disable-next-line require-await
      .mockImplementation(async (userId: string, seriesKey: string)=>{
        return {
          id: new Types.ObjectId().toString(),
          group: {
            origins: [
              {
                type: StreamOriginType.SERIE,
                id: seriesKey,
              },
            ],
          },
          userId,
          mode: StreamMode.SEQUENTIAL,
          key: seriesKey,
        } satisfies StreamEntity;
      } );

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [DomainEventEmitterModule],
      controllers: [],
      providers: [
        getOrCreateMockProvider(StreamsRepository),
        EpisodeHistoryRepository,
      ],
    }, {
      db: {
        using: "default",
      },
    } );

    mocks = await initMocks(testingSetup);
    repo = await testingSetup.app.get(EpisodeHistoryRepository);

    await loadFixtureSampleSeries();
    await loadFixtureImageCoversInDisk();
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  describe("getManyByCriteria", ()=> {
    describe("filters", () => {
      it("all for user", async () => {
        const criteria: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {},
        };
        const ret = await repo.getManyByCriteria(criteria, options);

        expect(ret).toHaveLength(1);
      } );

      it("filter by seriesId + episodeKey", async () => {
        const criteria: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {
            seriesId: SERIES_SAMPLE_SERIES.id,
            episodeKey: fixtureEpisodes.SampleSeries.Samples.EP1x01.episodeKey,
          },
          expand: ["episodes"],
        };
        const ret = await repo.getManyByCriteria(criteria, options);

        expect(ret).toHaveLength(1);
        expect(ret[0].resourceId).toBe(fixtureEpisodes.SampleSeries.Samples.EP1x01.id);
      } );

      it("filter by seriesId only", async () => {
        const criteria: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {
            seriesId: SERIES_SAMPLE_SERIES.id,
          },
          expand: ["episodes"],
        };
        const ret = await repo.getManyByCriteria(criteria, options);

        expect(ret.length).toBeGreaterThan(0);
        expect(
          ret.every((entry) => entry.resource?.seriesId === SERIES_SAMPLE_SERIES.id),
        ).toBe(true);
      } );

      it("filter by episodeId only", async () => {
        const episode = fixtureEpisodes.SampleSeries.Samples.EP1x01;
        const criteriaPast: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {
            episodeId: episode.id,
          },
        };
        const ret = await repo.getManyByCriteria(criteriaPast, options);

        expect(ret).toHaveLength(1);
      } );

      it("filter by timestampMax - future timestamp should return results", async () => {
        const futureTimestamp = Math.floor(Date.now() / 1000) + 86400; // +1 day
        const criteriaFuture: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {
            timestampMax: futureTimestamp,
          },
        };
        const retFuture = await repo.getManyByCriteria(criteriaFuture, options);

        expect(retFuture.length).toBeGreaterThan(0);
      } );

      it("filter by timestampMax - past timestamp should return no results", async () => {
        const pastTimestamp = Math.floor(Date.now() / 1000) - 86400; // -1 day
        const criteriaPast: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {
            timestampMax: pastTimestamp,
          },
        };
        const retPast = await repo.getManyByCriteria(criteriaPast, options);

        expect(retPast).toHaveLength(0);
      } );

      it("combined filters - seriesId + episodeKey + timestampMax", async () => {
        const futureTimestamp = Math.floor(Date.now() / 1000) + 86400;
        const criteria: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {
            seriesId: SERIES_SAMPLE_SERIES.id,
            episodeKey: fixtureEpisodes.SampleSeries.Samples.EP1x01.episodeKey,
            timestampMax: futureTimestamp,
          },
          expand: ["episodes"],
        };
        const ret = await repo.getManyByCriteria(criteria, options);

        expect(ret).toHaveLength(1);
        expect(ret[0].resourceId).toBe(fixtureEpisodes.SampleSeries.Samples.EP1x01.id);
      } );
    } );

    describe("sorting", () => {
      beforeEach(async () => {
        // Crear múltiples entradas con diferentes timestamps
        const episode1 = fixtureEpisodes.SampleSeries.Samples.EP1x01;
        const episode2 = fixtureEpisodes.SampleSeries.Samples.EP1x02;

        await repo.createNewEntryNowFor( {
          episodeId: episode1.id,
          seriesId: episode1.seriesId,
        }, options);
        await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
        await repo.createNewEntryNowFor( {
          episodeId: episode2.id,
          seriesId: episode2.seriesId,
        }, options);
      } );

      it("sort by timestamp ascending", async () => {
        const criteria: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {},
          sort: {
            timestamp: "asc",
          },
        };
        const ret = await repo.getManyByCriteria(criteria, options);

        expect(ret.length).toBeGreaterThanOrEqual(2);

        for (let i = 1; i < ret.length; i++)
          expect(ret[i].date.getTime()).toBeGreaterThanOrEqual(ret[i - 1].date.getTime());
      } );

      it("sort by timestamp descending", async () => {
        const criteria: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {},
          sort: {
            timestamp: "desc",
          },
        };
        const ret = await repo.getManyByCriteria(criteria, options);

        expect(ret.length).toBeGreaterThan(0);

        for (let i = 1; i < ret.length; i++)
          expect(ret[i].date.getTime()).toBeLessThanOrEqual(ret[i - 1].date.getTime());
      } );

      it("no sort specified should use default order", async () => {
        const criteria: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {},
        };
        const ret = await repo.getManyByCriteria(criteria, options);

        expect(ret.length).toBeGreaterThan(0);
      } );
    } );

    describe("pagination", () => {
      it("pagination with offset", async () => {
        const criteriaAll: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {},
          sort: {
            timestamp: "asc",
          },
        };
        const all = await repo.getManyByCriteria(criteriaAll, options);

        if (all.length < 2) {
          // Skip test if not enough data
          return;
        }

        const criteriaWithOffset: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {},
          sort: {
            timestamp: "asc",
          },
          offset: 1,
        };
        const withOffset = await repo.getManyByCriteria(criteriaWithOffset, options);

        expect(withOffset).toHaveLength(all.length - 1);
        expect(withOffset[0].id).toBe(all[1].id);
      } );

      it("pagination with limit", async () => {
        const criteria: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {},
          limit: 1,
        };
        const ret = await repo.getManyByCriteria(criteria, options);

        expect(ret.length).toBeLessThanOrEqual(1);
      } );

      it("pagination with offset and limit", async () => {
        const criteria: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {},
          offset: 1,
          limit: 2,
        };
        const ret = await repo.getManyByCriteria(criteria, options);

        expect(ret.length).toBeLessThanOrEqual(2);
      } );

      it("offset beyond available results", async () => {
        const criteria: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {},
          offset: 9999,
        };
        const ret = await repo.getManyByCriteria(criteria, options);

        expect(ret).toHaveLength(0);
      } );

      it("limit of 0 should return no results", async () => {
        const criteria: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {},
          limit: 0,
        };
        const ret = await repo.getManyByCriteria(criteria, options);

        expect(ret).toHaveLength(0);
      } );
    } );

    describe("expansions", () => {
      it("expand episodes", async () => {
        const criteria: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {},
          expand: ["episodes"],
        };
        const ret = await repo.getManyByCriteria(criteria, options);

        expect(ret.length).toBeGreaterThan(0);
        expect(ret[0].resource).toBeTruthy();
        expect(ret[0].resource!.id).toBeTruthy();
        expect(ret[0].resource!.episodeKey).toBeTruthy();
      } );

      it("expand episodesFileInfos", async () => {
        const criteria: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {},
          expand: ["episodes", "episodesFileInfos"],
        };
        const ret = await repo.getManyByCriteria(criteria, options);

        expect(ret.length).toBeGreaterThan(0);
        expect(ret[0].resource).toBeTruthy();
        expect(ret[0].resource!.fileInfos).toBeTruthy();
      } );

      it("expand episodesUserInfo", async () => {
        const criteria: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {},
          expand: ["episodes", "episodesUserInfo"],
        };
        const ret = await repo.getManyByCriteria(criteria, options);

        expect(ret.length).toBeGreaterThan(0);
        expect(ret[0].resource).toBeTruthy();
        expect(ret[0].resource!.userInfo).toBeTruthy();
      } );

      it("expand episodesSeries", async () => {
        const criteria: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {},
          expand: ["episodes", "episodesSeries"],
        };
        const ret = await repo.getManyByCriteria(criteria, options);

        expect(ret.length).toBeGreaterThan(0);
        expect(ret[0].resource).toBeTruthy();
        expect(ret[0].resource!.series).toBeTruthy();
        expect(ret[0].resource!.series!.id).toBeTruthy();
      } );

      it("expand episodesSeriesImageCover", async () => {
        const criteria: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {},
          expand: ["episodes", "episodesSeries", "episodesSeriesImageCover"],
        };
        const ret = await repo.getManyByCriteria(criteria, options);

        expect(ret.length).toBeGreaterThan(0);
        expect(ret[0].resource).toBeTruthy();
        expect(ret[0].resource!.series).toBeTruthy();
        expect(ret[0].resource!.series!.imageCover).toBeTruthy();
      } );

      it("expand all fields", async () => {
        const criteria: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {
            seriesId: SERIES_SAMPLE_SERIES.id,
            episodeKey: fixtureEpisodes.SampleSeries.Samples.EP1x01.episodeKey,
          },
          expand: ["episodes", "episodesFileInfos", "episodesSeries",
            "episodesUserInfo", "episodesSeriesImageCover"],
        };
        const ret = await repo.getManyByCriteria(criteria, options);

        expect(ret[0].resource).toBeTruthy();
        expect(ret[0].resource!.fileInfos).toBeTruthy();
        expect(ret[0].resource!.userInfo).toBeTruthy();
        expect(ret[0].resource!.series).toBeTruthy();
        expect(ret[0].resource!.series!.imageCover).toBeTruthy();
      } );

      it("no expand should not include episode data", async () => {
        const criteria: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {},
        };
        const ret = await repo.getManyByCriteria(criteria, options);

        expect(ret.length).toBeGreaterThan(0);
        expect(ret[0].resource).toBeUndefined();
      } );
    } );

    describe("combined criteria", () => {
      it("filters + sort + pagination + expand", async () => {
        const criteria: Parameters<typeof repo.getManyByCriteria>[0] = {
          filter: {
            seriesId: SERIES_SAMPLE_SERIES.id,
            timestampMax: Math.floor(Date.now() / 1000) + 86400,
          },
          sort: {
            timestamp: "desc",
          },
          offset: 0,
          limit: 5,
          expand: ["episodes", "episodesSeries"],
        };
        const ret = await repo.getManyByCriteria(criteria, options);

        expect(ret.length).toBeGreaterThan(0);
        expect(ret.length).toBeLessThanOrEqual(5);
        expect(ret[0].resource).toBeTruthy();
        expect(ret[0].resource!.series).toBeTruthy();
      } );
    } );
  } );

  describe("createOne", () => {
    it("should create a new entry", async () => {
      const newEntry = {
        date: new Date(),
        resourceId: fixtureEpisodes.SampleSeries.Samples.EP1x01.id,
        streamId: new Types.ObjectId().toString(),
      };

      await repo.createOneAndGet(newEntry, options);

      const all = await repo.getAll(options);
      const created = all.find(
        e => e.resourceId === newEntry.resourceId && e.streamId === newEntry.streamId,
      );

      expect(created).toBeTruthy();
      expect(created!.userId).toBe(fixtureUsers.Normal.User.id);
      expect(created!.date).toBeInstanceOf(Date);
    } );

    it("should create multiple entries", async () => {
      const entry1 = {
        date: new Date(),
        resourceId: fixtureEpisodes.SampleSeries.Samples.EP1x01.id,
        streamId: new Types.ObjectId().toString(),
      };
      const entry2 = {
        date: new Date(),
        resourceId: fixtureEpisodes.SampleSeries.Samples.EP1x02.id,
        streamId: new Types.ObjectId().toString(),
      };

      await repo.createOneAndGet(entry1, options);
      await repo.createOneAndGet(entry2, options);

      const all = await repo.getAll(options);

      expect(all.length).toBeGreaterThanOrEqual(2);
    } );
  } );

  describe("getAll", () => {
    it("should return all entries", async () => {
      const all = await repo.getAll(options);

      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBeGreaterThan(0);
    } );

    it("should return entries with all required fields", async () => {
      const all = await repo.getAll(options);

      expect(all.length).toBeGreaterThan(0);
      expect(all[0].id).toBeTruthy();
      expect(all[0].userId).toBeTruthy();
      expect(all[0].resourceId).toBeTruthy();
      expect(all[0].date).toBeInstanceOf(Date);
    } );
  } );

  describe("getManyBySeriesId", () => {
    it("should return entries for a specific series", async () => {
      const ret = await repo.getManyBySeriesId(
        SERIES_SAMPLE_SERIES.id,
        options,
      );

      expect(ret.length).toBeGreaterThan(0);
      expect(ret.every(entry => entry.resource?.seriesId === SERIES_SAMPLE_SERIES.id)).toBe(true);
    } );

    it("should return empty array for non-existent series", async () => {
      const ret = await repo.getManyBySeriesId(
        new Types.ObjectId().toString(),
        options,
      );

      expect(ret).toHaveLength(0);
    } );

    it("should include episode data in results", async () => {
      const ret = await repo.getManyBySeriesId(
        SERIES_SAMPLE_SERIES.id,
        options,
      );

      expect(ret.length).toBeGreaterThan(0);
      expect(ret[0].resource).toBeTruthy();
    } );
  } );

  describe("deleteOneByIdAndGet", () => {
    it("should delete and return the entry", async () => {
      const newEntry = {
        date: new Date(),
        resourceId: fixtureEpisodes.SampleSeries.Samples.EP1x01.id,
        streamId: new Types.ObjectId().toString(),
      };

      await repo.createOneAndGet(newEntry, options);
      const all = await repo.getAll(options);
      const created = all.find(
        e => e.resourceId === newEntry.resourceId && e.streamId === newEntry.streamId,
      );

      expect(created).toBeTruthy();

      const deleted = await repo.deleteOneByIdAndGet(created!.id, options);

      expect(deleted.id).toBe(created!.id);
      expect(deleted.userId).toBe(options.requestingUserId);

      const allAfter = await repo.getAll(options);
      const stillExists = allAfter.find(e => e.id === created!.id);

      expect(stillExists).toBeUndefined();
    } );

    it("should throw error when deleting non-existent entry", async () => {
      const fakeId = new Types.ObjectId().toString();

      await expect(repo.deleteOneByIdAndGet(fakeId, options)).rejects.toThrow();
    } );
  } );

  describe("findLastByEpisodeId", () => {
    const episodeId = fixtureEpisodes.SampleSeries.Samples.EP1x01.id;

    it("should return the last entry for an episode", async () => {
      const last = await repo.findLastByEpisodeId(episodeId, options);

      expect(last).toBeTruthy();
      expect(last!.resourceId).toBe(episodeId);
    } );

    it("should return null for non-existent episode", async () => {
      const last = await repo.findLastByEpisodeId(new Types.ObjectId().toString(), options);

      expect(last).toBeNull();
    } );

    it("should return most recent entry when multiple exist", async () => {
      const episode = fixtureEpisodes.SampleSeries.Samples.EP1x01;

      await repo.createNewEntryNowFor( {
        episodeId: episode.id,
        seriesId: episode.seriesId,
      }, options);
      await new Promise(resolve => setTimeout(resolve, 10));
      await repo.createNewEntryNowFor( {
        episodeId: episode.id,
        seriesId: episode.seriesId,
      }, options);

      const last = await repo.findLastByEpisodeId(episode.id, options);
      const all = await repo.getManyByCriteria( {
        filter: {},
        sort: {
          timestamp: "desc",
        },
      }, options);
      const expectedLast = all.find(e => e.resourceId === episode.id);

      expect(last).toBeTruthy();
      expect(last!.id).toBe(expectedLast!.id);
    } );
  } );

  describe("findLast", () => {
    const episode = fixtureEpisodes.SampleSeries.Samples.EP1x01;

    it("should return the last entry for a stream", async () => {
      const newEntry = {
        date: new Date(),
        resourceId: episode.id,
        streamId: new Types.ObjectId().toString(),
      };

      await repo.createNewEntryNowFor( {
        episodeId: episode.id,
        seriesId: episode.seriesId,
        streamId: newEntry.streamId,
      }, options);

      await repo.createOneAndGet(newEntry, options);

      const last = await repo.findLast( {
        streamId: newEntry.streamId,
      }, options);

      expect(last).toBeTruthy();
      expect(last!.streamId).toBe(newEntry.streamId);
    } );

    it("should return null for non-existent stream", async () => {
      const last = await repo.findLast( {
        streamId: new Types.ObjectId().toString(),
      }, options);

      expect(last).toBeNull();
    } );

    it("should return most recent entry for stream", async () => {
      const streamId = new Types.ObjectId().toString();
      const entry1 = {
        date: new Date(),
        resourceId: episode.id,
        streamId,
      };

      await repo.createOneAndGet(entry1, options);

      await new Promise(resolve => setTimeout(resolve, 10));

      const entry2 = {
        date: new Date(),
        resourceId: fixtureEpisodes.SampleSeries.Samples.EP1x02.id,
        streamId,
      };

      await repo.createOneAndGet(entry2, options);

      const last = await repo.findLast( {
        streamId,
      }, options);

      expect(last).toBeTruthy();
      expect(last!.resourceId).toBe(entry2.resourceId);
    } );
  } );

  describe("isLast", () => {
    it("should return true if episode is the last one played by user", async () => {
      const episode = fixtureEpisodes.SampleSeries.Samples.EP1x01;

      await repo.createNewEntryNowFor( {
        episodeId: episode.id,
        seriesId: episode.seriesId,
      }, options);

      const isLast = await repo.isLast(episode.id, options);

      expect(isLast).toBe(true);
    } );

    it("should return false if episode is not the last one played by user", async () => {
      const episode1 = fixtureEpisodes.SampleSeries.Samples.EP1x01;
      const episode2 = fixtureEpisodes.SampleSeries.Samples.EP1x02;

      await repo.createNewEntryNowFor( {
        episodeId: episode1.id,
        seriesId: episode1.seriesId,
      }, options);
      await new Promise(resolve => setTimeout(resolve, 10));
      await repo.createNewEntryNowFor( {
        episodeId: episode2.id,
        seriesId: episode2.seriesId,
      }, options);

      const isLast = await repo.isLast(episode1.id, options);

      expect(isLast).toBe(false);
    } );

    it("should return false for episode never played", async () => {
      const isLast = await repo.isLast(
        new Types.ObjectId().toString(),
        options,
      );

      expect(isLast).toBe(false);
    } );
  } );

  describe("createNewEntryNowFor", () => {
    beforeEach(async () => {
      await repo.deleteAllAndGet(options);
    } );

    it("should create a new entry with provided streamId", async () => {
      const episode = fixtureEpisodes.SampleSeries.Samples.EP1x01;
      const streamId = new Types.ObjectId().toString();

      await repo.createNewEntryNowFor( {
        episodeId: episode.id,
        seriesId: episode.seriesId,
        streamId,
      }, options);

      const all = await repo.getAll(options);
      const created = all.find(e => e.resourceId === episode.id && e.streamId === streamId);

      expect(created).toBeTruthy();
      expect(created!.userId).toBe(fixtureUsers.Normal.User.id);
      expect(created!.resourceId).toBe(episode.id);
    } );

    it("should create a new entry with default stream when streamId not provided", async () => {
      const episode = fixtureEpisodes.SampleSeries.Samples.EP1x01;

      await repo.createNewEntryNowFor( {
        episodeId: episode.id,
        seriesId: episode.seriesId,
      }, options);

      const all = await repo.getAll(options);
      const created = all.find(
        e => e.resourceId === episode.id && e.userId === fixtureUsers.Normal.User.id,
      );

      expect(created).toBeTruthy();
      expect(created!.streamId).toBeTruthy();
    } );

    it("should set current date on entry", async () => {
      const episode = fixtureEpisodes.SampleSeries.Samples.EP1x01;
      const beforeCreate = new Date();

      await repo.createNewEntryNowFor( {
        episodeId: episode.id,
        seriesId: episode.seriesId,
      }, options);

      const afterCreate = new Date();
      const all = await repo.getAll(options);
      const created = all.find(
        e => e.resourceId === episode.id && e.userId === fixtureUsers.Normal.User.id,
      );

      expect(created).toBeTruthy();
      expect(created!.date.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(created!.date.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    } );
  } );

  describe("addEpisodesToHistory", () => {
    beforeEach(async () => {
      await repo.deleteAllAndGet(options);
    } );

    it("should add multiple episodes to history", async () => {
      const episodes = [
        fixtureEpisodes.SampleSeries.Samples.EP1x01,
        fixtureEpisodes.SampleSeries.Samples.EP1x02,
      ];
      const streamId = new Types.ObjectId().toString();

      await repo.addEpisodesToHistory( {
        episodes,
        streamId,
      }, options);

      const all = await repo.getAll(options);
      const createdEntries = all.filter(e => episodes.some(ep => ep.id === e.resourceId)
        && e.streamId === streamId);

      expect(createdEntries).toHaveLength(episodes.length);
    } );

    it("should add episodes with correct streamId and userId", async () => {
      const episodes = [
        fixtureEpisodes.SampleSeries.Samples.EP1x01,
      ];
      const streamId = new Types.ObjectId().toString();

      await repo.addEpisodesToHistory( {
        episodes,
        streamId,
      }, options);

      const all = await repo.getAll(options);
      const created = all.find(e => e.resourceId === episodes[0].id && e.streamId === streamId);

      expect(created).toBeTruthy();
      expect(created!.streamId).toBe(streamId);
      expect(created!.userId).toBe(fixtureUsers.Normal.User.id);
    } );

    it("should handle empty episodes array", async () => {
      const streamId = new Types.ObjectId().toString();

      await repo.addEpisodesToHistory( {
        episodes: [],
        streamId,
      }, options);

      // Should not throw error
      expect(true).toBe(true);
    } );
  } );
} );
