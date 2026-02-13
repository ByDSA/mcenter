import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { MusicEntity } from "$shared/models/musics";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { expectControllerFinishRequest, testManyAuth } from "#core/auth/strategies/token/tests";
import { MusicsRepository } from "../../crud/repositories/music";
import { SearchDuplicatesController } from "./controller";
import { MusicDuplicatesIgnoreGroupsOdm } from "./repository/odm";
import { SearchDuplicatesService } from "./service";

const URL = "/search-duplicates";

function buildMusic(
  overrides: Partial<MusicEntity> & Pick<MusicEntity, "artist" | "id" | "slug" | "title">,
): MusicEntity {
  return {
    ...overrides,
  } as MusicEntity;
}

const MUSIC_A1 = buildMusic( {
  id: "aaa111aaa111aaa111aaa111",
  title: "Song Alpha",
  artist: "Artist One",
  slug: "song-alpha-artist-one",
} );
const MUSIC_A2 = buildMusic( {
  id: "aaa222aaa222aaa222aaa222",
  title: "Song Alpha",
  artist: "Artist One",
  slug: "song-alpha-artist-one2",
} );
const MUSIC_B1 = buildMusic( {
  id: "bbb111bbb111bbb111bbb111",
  title: "Song Beta",
  artist: "Artist Two",
  slug: "song-beta-artist-two",
} );
const MUSIC_SLUG_DUP = buildMusic( {
  id: "ccc111ccc111ccc111ccc111",
  title: "Song Beta Extended",
  artist: "Artist Two",
  slug: "song-beta-artist-two3",
} );
const SAMPLE_RESPONSE = {
  slugs: [] as MusicEntity[][],
  titleArtist: [] as MusicEntity[][],
};

describe("searchDuplicatesController integration (controller + service)", () => {
  let testingSetup: TestingSetup;
  let router: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;

  // eslint-disable-next-line require-await
  async function initMocks() {
    const ret = {
      musicRepo: testingSetup.getMock(MusicsRepository),
    };

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        controllers: [SearchDuplicatesController],
        providers: [
          getOrCreateMockProvider(MusicsRepository),
          SearchDuplicatesService,
        ],
      },
      {
        auth: {
          repositories: "mock",
          cookies: "mock",
        },
      },
    );

    router = testingSetup.routerApp;
    mocks = await initMocks();
  } );

  beforeEach(async () => {
    jest.clearAllMocks();
    await testingSetup.useMockedUser(null);

    jest.spyOn(MusicDuplicatesIgnoreGroupsOdm.Model, "find").mockResolvedValue([]);
    jest.spyOn(MusicDuplicatesIgnoreGroupsOdm, "toModels").mockReturnValue([]);
  } );

  describe("search (GET)", () => {
    it("valid request-response — no musics, empty duplicates", async () => {
      await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);
      mocks.musicRepo.getAll.mockResolvedValueOnce([]);

      const res = await request(router)
        .get(URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body).toEqual(SAMPLE_RESPONSE);
    } );

    it("valid request-response — returns title/artist duplicates", async () => {
      await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);
      mocks.musicRepo.getAll.mockResolvedValueOnce([MUSIC_A1, MUSIC_A2, MUSIC_B1]);

      const res = await request(router)
        .get(URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.titleArtist).toHaveLength(1);
      expect(res.body.titleArtist[0]).toHaveLength(2);
      expect(res.body.slugs).toHaveLength(1);
      expect(res.body.slugs[0]).toHaveLength(2);
    } );

    it("valid request-response — returns slug duplicates", async () => {
      await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);
      mocks.musicRepo.getAll.mockResolvedValueOnce([MUSIC_B1, MUSIC_SLUG_DUP]);

      const res = await request(router)
        .get(URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.slugs).toHaveLength(1);
      expect(res.body.titleArtist).toHaveLength(0);
    } );

    it("valid request-response — ignoreGroups filters out a duplicate group", async () => {
      await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);
      mocks.musicRepo.getAll.mockResolvedValueOnce([MUSIC_A1, MUSIC_A2]);

      jest.spyOn(MusicDuplicatesIgnoreGroupsOdm, "toModels").mockReturnValue([
        [MUSIC_A1.id, MUSIC_A2.id],
      ]);

      const res = await request(router)
        .get(URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.titleArtist).toHaveLength(0);
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: () => request(router)
          .get(URL),
        list: [
          {
            user: null,
            shouldPass: false,
          },
          {
            user: fixtureUsers.Normal.UserWithRoles,
            shouldPass: false,
          },
          {
            user: fixtureUsers.Admin.UserWithRoles,
            shouldPass: true,
          },
        ],
      } );
    } );

    describe("repositories", () => {
      it("should call musicRepo.getAll", async () => {
        await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);
        mocks.musicRepo.getAll.mockResolvedValueOnce([]);

        await request(router)
          .get(URL);

        expect(mocks.musicRepo.getAll).toHaveBeenCalled();
      } );

      it("should call MusicDuplicatesIgnoreGroupsOdm.Model.find", async () => {
        await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);
        mocks.musicRepo.getAll.mockResolvedValueOnce([]);

        await request(router)
          .get(URL);

        expect(MusicDuplicatesIgnoreGroupsOdm.Model.find).toHaveBeenCalled();
      } );
    } );
  } );
} );
