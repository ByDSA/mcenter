import { Application } from "express";
import request from "supertest";
import { fixtureMusics } from "$sharedSrc/models/musics/tests/fixtures";
import { PATH_ROUTES } from "$shared/routing";
import { MusicEntity, Music } from "#musics/models";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { loadFixtureMusicsInDisk } from "#core/db/tests/fixtures/sets";
import { MusicHistoryEntryOdm } from "../history/rest/repository/odm";
import { MusicHistoryModule } from "../history/module";
import { MusicsCrudModule } from "../rest/module";
import { MusicGetRandomController } from "./get.controller";

let routerApp: Application;
let testingSetup: TestingSetup;
const MUSICS_WITH_TAGS_SAMPLES = fixtureMusics.Disk.List;

async function loadFixtures() {
  await loadFixtureMusicsInDisk();
}

function expectResponseIncludeAnyOfMusics(response: request.Response, musics: Music[]) {
  const expectedPossibleUrls = musics.map((music) => music.url);
  let found = false;

  for (const url of expectedPossibleUrls) {
    if (response.text.includes(`api/musics/get/raw/${url}`)) {
      found = true;
      break;
    }
  }

  expect(found).toBeTruthy();
}

function expectNotEmpty(array: unknown[]) {
  expect(array.length).toBeGreaterThan(0);
}

describe("musicGetController", () => {
  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [DomainEventEmitterModule, MusicHistoryModule, MusicsCrudModule],
      controllers: [MusicGetRandomController],
      providers: [
      ],
    }, {
      db: {
        using: "default",
      },
    } );
    routerApp = testingSetup.routerApp;

    await loadFixtures();
  } );

  beforeEach(async () => {
    await MusicHistoryEntryOdm.Model.deleteMany( {} );
  } );

  it("should get random", async () => {
    const response = await request(routerApp)
      .get("/")
      .expect(200)
      .send();

    expect(response.body).toBeDefined();
    expect(response.text).toBeDefined();

    expect(response.text.includes(PATH_ROUTES.musics.raw.path)).toBeTruthy();
  } );

  describe("query", () => {
    it("should get a music if query is put", async () => {
      const response = await request(routerApp)
        .get("/?q=tag:t1")
        .expect(200)
        .send();

      expect(response.body).toBeDefined();
      expect(response.text).toBeDefined();

      expect(response.text.includes(PATH_ROUTES.musics.raw.path)).toBeTruthy();
    } );

    it("should get a music if query weight is put", async () => {
      const possibleMusics: MusicEntity[] = MUSICS_WITH_TAGS_SAMPLES
        .filter((music) => music.weight > 10);

      expectNotEmpty(possibleMusics);
      const response = await request(routerApp)
        .get("/?q=weight:>10")
        .expect(200)
        .send();

      expectResponseIncludeAnyOfMusics(response, possibleMusics);
    } );

    it("should get a music with tag t1", async () => {
      const query = "tag:t1";
      const musicsWithTagT1 = MUSICS_WITH_TAGS_SAMPLES
        .filter((music) => music.tags?.includes("t1"));

      expectNotEmpty(musicsWithTagT1);
      const response = await request(routerApp)
        .get(`/?q=${query}`)
        .expect(200)
        .send();

      expectResponseIncludeAnyOfMusics(response, musicsWithTagT1);
    } );

    it("should get a music with tag only-t2 using t2 query", async () => {
      const query = "tag:t2";
      const response = await request(routerApp)
        .get(`/?q=${query}`)
        .expect(200)
        .send();
      const musicsWithTagT2Only = MUSICS_WITH_TAGS_SAMPLES.filter(
        (music) => music.tags?.includes("only-t2"),
      );
      const expectedPossibleUrls = musicsWithTagT2Only.map((music) => music.url);
      let found = false;

      for (const url of expectedPossibleUrls) {
        if (response.text.includes(`api/musics/get/raw/${url}`)) {
          found = true;
          break;
        }
      }

      expect(found).toBeTruthy();
    } );

    it("should ignore t4 tag of music with only-t2 tag", async () => {
      const query = "tag:t4";

      await request(routerApp)
        .get(`/?q=${query}`)
        .expect(500)
        .send();
    } );
  } );
} );
