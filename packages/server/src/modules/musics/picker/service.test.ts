import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { dateToTimestampInSeconds } from "$shared/utils/time/timestamp";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { createMockedModule } from "#utils/nestjs/tests";
import { MusicHistoryModule } from "#musics/history/module";
import { MusicsCrudModule } from "#musics/crud/module";
import { MusicsRepository } from "#musics/crud/repositories/music";
import { MusicHistoryRepository } from "#musics/history/crud/repository";
import { fixtureMusics } from "#musics/tests";
import { mockMongoId } from "#tests/mongo";
import { MusicHistoryEntryEntity } from "../history/models";
import { MusicGetRandomService } from "./service";

const fixtureUser = fixtureUsers.Normal.User;
const userId = fixtureUser.id;
const baseMusicA = fixtureMusics.Disk.Samples.DK;
const musicWithUserInfo = fixtureMusics.Disk.WithUserInfo.List.find(m => m.id === baseMusicA.id)!;
const musicWithoutUserInfo = {
  ...baseMusicA,
};
const VALID_QUERY = "weight:>10";
// Adjust to whatever queryToExpressionNode considers syntactically invalid
const INVALID_QUERY = ":::";
const makeHistoryEntry = (resourceId: string): MusicHistoryEntryEntity => ( {
  id: mockMongoId,
  userId: fixtureUser.id,
  resourceId,
  date: {
    day: 1,
    month: 1,
    year: 1,
    timestamp: dateToTimestampInSeconds(new Date()),
  },
} );

describe("musicGetRandomService", () => {
  let testingSetup: TestingSetup;
  let service: MusicGetRandomService;
  let serviceAny: any;
  let mocks: Awaited<ReturnType<typeof initMocks>>;

  // eslint-disable-next-line require-await
  async function initMocks() {
    return {
      musicRepo: testingSetup.getMock(MusicsRepository),
      historyRepo: testingSetup.getMock(MusicHistoryRepository),
    };
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        imports: [
          createMockedModule(MusicsCrudModule),
          createMockedModule(MusicHistoryModule),
        ],
        controllers: [],
        providers: [MusicGetRandomService],
      },
      {
        auth: {
          repositories: "mock",
          cookies: "mock",
        },
      },
    );

    mocks = await initMocks();
    service = await testingSetup.app.get(MusicGetRandomService);
    serviceAny = service;
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  // ─── getRandom e2e ───────────────────────────────────────────────────────────
  // Full flow. Only repos/external services are mocked.
  // Internal methods (findMusics, randomPick) run for real.
  // ─────────────────────────────────────────────────────────────────────────────
  describe("getRandom e2e", () => {
    describe("normal flow", () => {
      it("normal valid flow", async () => {
        mocks.musicRepo.getManyByQuery.mockResolvedValue([musicWithUserInfo]);
        mocks.historyRepo.getLast.mockResolvedValue(null);

        const result = await service.getRandom( {
          query: VALID_QUERY,
          userId,
        } );

        expect(result).toBeDefined();
        expect(result.id).toBe(musicWithUserInfo.id);
      } );

      it("returns music without userInfo when userId is null and music has userInfo", async () => {
        mocks.musicRepo.getAll.mockResolvedValue([musicWithUserInfo]);

        const result = await service.getRandom( {
          query: null,
          userId: null,
        } );

        expect(result).not.toHaveProperty("userInfo");
      } );

      it("returns music as-is when userId is null and music has no userInfo", async () => {
        mocks.musicRepo.getAll.mockResolvedValue([musicWithUserInfo]);

        const result = await service.getRandom( {
          query: null,
          userId: null,
        } );

        expect(result).toEqual(musicWithoutUserInfo);
      } );

      it("keeps userInfo when userId is present", async () => {
        mocks.musicRepo.getAll.mockResolvedValue([musicWithUserInfo]);
        mocks.historyRepo.getLast.mockResolvedValue(null);

        const result = await service.getRandom( {
          query: null,
          userId,
        } );

        expect(result).toHaveProperty("userInfo");
      } );

      it("calls historyRepo.getLast with the userId when userId is present", async () => {
        mocks.musicRepo.getAll.mockResolvedValue([musicWithUserInfo]);
        mocks.historyRepo.getLast.mockResolvedValue(makeHistoryEntry(baseMusicA.id));

        await service.getRandom( {
          query: null,
          userId,
        } );

        expect(mocks.historyRepo.getLast).toHaveBeenCalled();
      } );

      it(
        "returns a result even when history is non-empty (picker avoids last played)",
        async () => {
          mocks.musicRepo.getAll.mockResolvedValue([musicWithUserInfo]);
          mocks.historyRepo.getLast.mockResolvedValue(makeHistoryEntry(musicWithUserInfo.id));

          const result = await service.getRandom( {
            query: null,
            userId,
          } );

          expect(result).toBeDefined();
        },
      );
    } );

    describe("failure cases", () => {
      it("should fail when findMusics (getAll) returns an empty array", async () => {
        mocks.musicRepo.getAll.mockResolvedValue([]);

        await expect(service.getRandom( {
          query: null,
          userId,
        } )).rejects.toThrow();
      } );

      it(
        "should fail when findMusics (getManyByQuery) returns an empty array",
        async () => {
          mocks.musicRepo.getManyByQuery.mockResolvedValue([]);

          await expect(service.getRandom( {
            query: VALID_QUERY,
            userId,
          } )).rejects.toThrow();
        },
      );

      it("throws when an invalid query string is provided", async () => {
        await expect(service.getRandom( {
          query: INVALID_QUERY,
          userId,
        } )).rejects.toThrow();
      } );
    } );
  } );

  // ─── getRandom (unit) ────────────────────────────────────────────────────────
  // findMusics and randomPick are mocked. Tests every combination of their
  // return values and how getRandom reacts.
  // ─────────────────────────────────────────────────────────────────────────────
  describe("getRandom (unit — findMusics and randomPick mocked)", () => {
    let findMusicsSpy: jest.SpyInstance;
    let randomPickSpy: jest.SpyInstance;

    beforeEach(() => {
      findMusicsSpy = jest.spyOn(serviceAny, "findMusics");
      randomPickSpy = jest.spyOn(serviceAny, "randomPick");
    } );

    afterEach(() => {
      findMusicsSpy.mockRestore();
      randomPickSpy.mockRestore();
    } );

    it("throws when findMusics returns empty array", async () => {
      findMusicsSpy.mockResolvedValue([]);

      await expect(service.getRandom( {
        query: VALID_QUERY,
        userId,
      } )).rejects.toThrow();
      expect(randomPickSpy).not.toHaveBeenCalled();
    } );

    it("calls randomPick with the userId and the list returned by findMusics", async () => {
      const musics = [musicWithUserInfo, musicWithoutUserInfo];

      findMusicsSpy.mockResolvedValue(musics);
      randomPickSpy.mockResolvedValue(musicWithUserInfo);

      await service.getRandom( {
        query: null,
        userId,
      } );

      expect(randomPickSpy).toHaveBeenCalled();
    } );

    it(
      "strips userInfo from result when userId is null and picked music has userInfo",
      async () => {
        findMusicsSpy.mockResolvedValue([musicWithUserInfo]);
        randomPickSpy.mockResolvedValue(musicWithUserInfo);

        const result = await service.getRandom( {
          query: null,
          userId: null,
        } );

        expect(result).not.toHaveProperty("userInfo");
      },
    );

    it("returns music as-is when userId is null and picked music has no userInfo", async () => {
      findMusicsSpy.mockResolvedValue([musicWithoutUserInfo]);
      randomPickSpy.mockResolvedValue(musicWithoutUserInfo);

      const result = await service.getRandom( {
        query: null,
        userId: null,
      } );

      expect(result).toEqual(musicWithoutUserInfo);
    } );

    it("returns music with userInfo intact when userId is present", async () => {
      findMusicsSpy.mockResolvedValue([musicWithUserInfo]);
      randomPickSpy.mockResolvedValue(musicWithUserInfo);

      const result = await service.getRandom( {
        query: null,
        userId,
      } );

      expect(result).toHaveProperty("userInfo");
      expect((result as typeof musicWithUserInfo).userInfo).toEqual(musicWithUserInfo.userInfo);
    } );
  } );

  // ─── randomPick ──────────────────────────────────────────────────────────────
  // No internal mocks. Only historyRepo is mocked.
  // ─────────────────────────────────────────────────────────────────────────────
  describe("randomPick", () => {
    it("does not call historyRepo.getLast when userId is null", async () => {
      await serviceAny.randomPick(null, [musicWithUserInfo]);

      expect(mocks.historyRepo.getLast).not.toHaveBeenCalled();
    } );

    it("calls historyRepo.getLast with the userId when userId is present", async () => {
      mocks.historyRepo.getLast.mockResolvedValue(null);

      await serviceAny.randomPick(userId, [musicWithUserInfo]);

      expect(mocks.historyRepo.getLast).toHaveBeenCalledWith(userId);
    } );

    it("returns one entity from the provided list", async () => {
      mocks.historyRepo.getLast.mockResolvedValue(null);
      const musics = [musicWithUserInfo, musicWithoutUserInfo];
      const result = await serviceAny.randomPick(userId, musics);

      expect(musics.map(m => m.id)).toContain(result.id);
    } );

    it("returns the only music when the list has a single element", async () => {
      mocks.historyRepo.getLast.mockResolvedValue(null);

      const result = await serviceAny.randomPick(userId, [musicWithUserInfo]);

      expect(result.id).toBe(musicWithUserInfo.id);
    } );

    it(
      "returns a result even when picker falls back (default case guarantees musics[0])",
      async () => {
        mocks.historyRepo.getLast.mockResolvedValue(null);
        const musics = [musicWithUserInfo, musicWithoutUserInfo];
        const result = await serviceAny.randomPick(userId, musics);

        expect(result).toBeDefined();
        expect(musics.map(m => m.id)).toContain(result.id);
      },
    );

    it(
      "avoids last-played music when history entry exists and list has multiple items",
      async () => {
        mocks.historyRepo.getLast.mockResolvedValue(makeHistoryEntry(musicWithUserInfo.id));
        const musics = [musicWithUserInfo, musicWithoutUserInfo];
        const result = await serviceAny.randomPick(userId, musics);

        // With two musics and the picker filtering the last one, it should prefer the other
        expect(result.id).toBe(musicWithoutUserInfo.id);
      },
    );

    it(
      "still returns a result when lastId matches the only music in the list (unavoidable repeat)",
      async () => {
        mocks.historyRepo.getLast.mockResolvedValue(makeHistoryEntry(musicWithUserInfo.id));

        const result = await serviceAny.randomPick(userId, [musicWithUserInfo]);

        expect(result).toBeDefined();
        expect(result.id).toBe(musicWithUserInfo.id);
      },
    );

    it("uses null lastId when historyRepo returns null (empty history)", async () => {
      mocks.historyRepo.getLast.mockResolvedValue(null);

      const result = await serviceAny.randomPick(userId, [musicWithUserInfo]);

      expect(result).toBeDefined();
    } );
  } );

  // ─── findMusics ──────────────────────────────────────────────────────────────
  // No internal mocks. Only musicRepo is mocked.
  // ─────────────────────────────────────────────────────────────────────────────
  describe("findMusics", () => {
    it("calls musicRepo.getAll when query is null", async () => {
      await serviceAny.findMusics(userId, null);

      expect(mocks.musicRepo.getAll).toHaveBeenCalled();
      expect(mocks.musicRepo.getManyByQuery).not.toHaveBeenCalled();
    } );

    it("calls musicRepo.getAll when query is empty string (falsy)", async () => {
      await serviceAny.findMusics(userId, "");

      expect(mocks.musicRepo.getAll).toHaveBeenCalled();
      expect(mocks.musicRepo.getManyByQuery).not.toHaveBeenCalled();
    } );

    it("calls musicRepo.getManyByQuery when query is a non-empty string", async () => {
      await serviceAny.findMusics(userId, VALID_QUERY);

      expect(mocks.musicRepo.getManyByQuery).toHaveBeenCalled();
      expect(mocks.musicRepo.getAll).not.toHaveBeenCalled();
    } );

    it("always returns userInfo", async () => {
      mocks.musicRepo.getAll.mockResolvedValue([musicWithUserInfo]);

      const ret = await serviceAny.findMusics(userId, null);

      expect(ret[0].userInfo).toBeDefined();
    } );

    it("throws when the query string is invalid (queryToExpressionNode fails)", async () => {
      await expect(serviceAny.findMusics(userId, INVALID_QUERY)).rejects.toThrow();
    } );
  } );
} );
