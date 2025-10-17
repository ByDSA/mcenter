import { Application } from "express";
import request from "supertest";
import { fixtureMusics } from "$sharedSrc/models/musics/tests/fixtures";
import { PATH_ROUTES } from "$shared/routing";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { createMockClass } from "$sharedTests/jest/mocking";
import { Music, MusicEntityWithUserInfo } from "#musics/models";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { loadFixtureMusicsInDisk } from "#core/db/tests/fixtures/sets";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { MusicsIndexService } from "#modules/search/indexes/musics.service";
import { loadFixtureMusicsUsersInDisk } from "#core/db/tests/fixtures/sets/MusicsUsers";
import { MusicsSearchService, SearchRet } from "#modules/search/search-services/musics.search.service";
import { MusicsCrudModule } from "../crud/module";
import { MusicHistoryModule } from "../history/module";
import { MusicHistoryEntryOdm } from "../history/crud/repository/odm";
import { MusicGetRandomController } from "./controller";

let routerApp: Application;
let testingSetup: TestingSetup;
const MUSICS_WITH_TAGS_SAMPLES = fixtureMusics.Disk.List;

async function loadFixtures() {
  await loadFixtureMusicsInDisk();
  await loadFixtureMusicsUsersInDisk();
}

function expectResponseIncludeAnyOfMusics(response: request.Response, musics: Music[]) {
  const expectedPossibleSlugs = musics.map((music) => music.slug);
  let found = false;

  for (const slug of expectedPossibleSlugs) {
    if (response.text.includes(PATH_ROUTES.musics.slug.withParams(slug))) {
      found = true;
      break;
    }
  }

  expect(found).toBeTruthy();
}

function expectNotEmpty(array: unknown[]) {
  expect(array.length).toBeGreaterThan(0);
}

describe("controller", () => {
  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
        DomainEventEmitterModule,
        MusicHistoryModule,
        MusicsCrudModule,
        ResourceResponseFormatterModule,
      ],
      controllers: [MusicGetRandomController],
      providers: [
      ],
    }, {
      beforeCompile: (module) => {
        module.overrideProvider(MusicsSearchService)
          .useClass(createMockClass(MusicsSearchService));
      },
      db: {
        using: "default",
      },
      auth: {
        repositories: "mock",
        cookies: "mock",
      },
    } );
    routerApp = testingSetup.routerApp;

    await loadFixtures();

    const musicsIndexService = testingSetup.app.get(MusicsIndexService);

    await musicsIndexService.syncAll();
    function getPrimerSubstringEntreComillas(texto: string): string | null {
      const match = texto.match(/"([^"]*)"/);

      return match ? match[1] : null;
    }
    testingSetup.getMock(MusicsSearchService).filter
      // eslint-disable-next-line require-await
      .mockImplementation(async (_userId, queryFilter)=> ( {
        data: fixtureMusics.Disk.WithUserInfo.List.map(music=>( {
          addedAt: music.timestamps.addedAt.getTime(),
          artist: music.artist,
          id: music.userInfo.id,
          lastTimePlayedAt: music.userInfo.lastTimePlayed,
          musicId: music.id,
          title: music.title,
          userId: music.userInfo.userId,
          weight: music.userInfo.weight,
          country: music.country,
          game: music.game,
          tags: [...music.tags ?? [], ...music.userInfo.tags ?? []],
          onlyTags: [],
        } )).filter(e=>{
          if (queryFilter.includes("tag"))
            return e.tags.includes(getPrimerSubstringEntreComillas(queryFilter) ?? "nope");
          else if (queryFilter.includes("weight")) {
            if (queryFilter.includes("> 10"))
              return e.weight > 10;
            else
              return false;
          } else
            return false;
        } ),
        total: fixtureMusics.Disk.WithUserInfo.List.length,
      } as SearchRet));

    await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);
  } );

  beforeEach(async () => {
    await MusicHistoryEntryOdm.Model.deleteMany( {} );
  } );

  it("should get random", async () => {
    const response = await request(routerApp)
      .get("/?format=m3u8")
      .expect(200)
      .send();

    expect(response.text.includes(PATH_ROUTES.musics.slug.path)).toBeTruthy();
  } );

  describe("query", () => {
    it("should get a music if query is put", async () => {
      const response = await request(routerApp)
        .get("/?format=m3u8&q=tag:t1")
        .expect(200)
        .send();

      expect(response.body).toBeDefined();
      expect(response.text).toBeDefined();

      expect(response.text.includes(PATH_ROUTES.musics.slug.path)).toBeTruthy();
    } );

    it("should get a music if query weight is put", async () => {
      const possibleMusics: MusicEntityWithUserInfo[] = fixtureMusics.Disk.WithUserInfo.List
        .filter((music) => music.userInfo.weight > 10);

      expectNotEmpty(possibleMusics);
      const response = await request(routerApp)
        .get("/?format=m3u8&q=weight:>10")
        .expect(200)
        .send();

      expectResponseIncludeAnyOfMusics(response, possibleMusics);
    } );

    it("should get a music with tag t1", async () => {
      const query = "tag:t1";
      const musicsWithTagT1 = MUSICS_WITH_TAGS_SAMPLES
        .filter((music) => music.tags?.includes("t1") || music.userInfo?.tags?.includes("t1"));

      expectNotEmpty(musicsWithTagT1);

      for (let i = 0; i < 5; i++) {
        const response = await request(routerApp)
          .get(`/?format=m3u8&q=${query}`)
          .expect(200)
          .send();

        expectResponseIncludeAnyOfMusics(response, musicsWithTagT1);
      }
    } );

    // TODO
    it.skip("should get a music with tag only-t2 using t2 query", async () => {
      const query = "tag:t2";
      const response = await request(routerApp)
        .get(`/?format=m3u8&q=${query}`)
        .expect(200)
        .send();
      const musicsWithTagT2Only = MUSICS_WITH_TAGS_SAMPLES.filter(
        (music) => music.tags?.includes("only-t2"),
      );
      const expectedPossibleSlugs = musicsWithTagT2Only.map((music) => music.slug);
      let found = false;

      for (const slug of expectedPossibleSlugs) {
        if (response.text.includes(PATH_ROUTES.musics.slug.withParams(slug))) {
          found = true;
          break;
        }
      }

      expect(found).toBeTruthy();
    } );

    // TODO
    it.skip("should ignore t4 tag of music with only-t2 tag", async () => {
      const query = "tag:t4";

      await request(routerApp)
        .get(`/?q=${query}`)
        .expect(422)
        .send();
    } );
  } );
} );
