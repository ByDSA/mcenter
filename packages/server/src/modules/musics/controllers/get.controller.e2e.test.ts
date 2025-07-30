import { Application } from "express";
import request from "supertest";
import { MusicEntity, Music } from "#musics/models";
import { loadFixtureMusicsInDisk } from "#tests/main/db/fixtures/sets";
import { createTestingAppModuleAndInit, TestingSetup } from "#tests/nestjs/app";
import { DomainEventEmitterModule } from "#modules/domain-event-emitter/module";
import { MusicHistoryRepository } from "../history";
import { MusicRepository } from "../repositories";
import { fixtureMusics } from "../tests/fixtures";
import { musicBuilderServiceMockProvicer } from "../builder/tests";
import { MusicFileInfoRepository } from "../file-info/repositories/repository";
import { MusicHistoryEntryOdm } from "../history/repositories/odm";
import { MusicGetController } from "./get.controller";
import { RawHandlerService } from "./raw-handler.service";

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
      imports: [DomainEventEmitterModule],
      controllers: [MusicGetController],
      providers: [
        MusicRepository,
        MusicFileInfoRepository,
        musicBuilderServiceMockProvicer,
        MusicHistoryRepository,
        RawHandlerService,
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
      .get("/get/random")
      .expect(200)
      .send();

    expect(response.body).toBeDefined();
    expect(response.text).toBeDefined();

    expect(response.text.includes("api/musics/get/raw/")).toBeTruthy();
    expect(response.text.includes("get/random")).toBeTruthy();
  } );

  describe("query", () => {
    it("should get a music if query is put", async () => {
      const response = await request(routerApp)
        .get("/get/random?q=tag:t1")
        .expect(200)
        .send();

      expect(response.body).toBeDefined();
      expect(response.text).toBeDefined();

      expect(response.text.includes("api/musics/get/raw/")).toBeTruthy();
      expect(response.text.includes("get/random")).toBeTruthy();
    } );

    it("should get a music if query weight is put", async () => {
      const possibleMusics: MusicEntity[] = MUSICS_WITH_TAGS_SAMPLES
        .filter((music) => music.weight > 10);

      expectNotEmpty(possibleMusics);
      const response = await request(routerApp)
        .get("/get/random?q=weight:>10")
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
        .get(`/get/random?q=${query}`)
        .expect(200)
        .send();

      expectResponseIncludeAnyOfMusics(response, musicsWithTagT1);
    } );

    it("should get a music with tag only-t2 using t2 query", async () => {
      const query = "tag:t2";
      const response = await request(routerApp)
        .get(`/get/random?q=${query}`)
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
        .get(`/get/random?q=${query}`)
        .expect(500)
        .send();
    } );
  } );
} );
