import { Application } from "express";
import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Music, MusicVO } from "#musics/models";
import { MUSICS_WITH_TAGS_SAMPLES } from "#tests/main/db/fixtures/models/music";
import { loadFixtureMusicsWithTags } from "#tests/main/db/fixtures/sets";
import { TestMongoDatabase } from "#tests/main";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { HistoryMusicModelOdm, MusicHistoryRepository } from "./history";
import { MusicGetController } from "./controllers/GetController";
import { MusicRepository } from "./repositories";

let app: INestApplication;
let routerApp: Application;
const db = new TestMongoDatabase();

async function loadFixtures() {
  await db.drop();
  await loadFixtureMusicsWithTags();
}

function expectResponseIncludeAnyOfMusics(response: request.Response, musics: MusicVO[]) {
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

describe("picker", () => {
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule( {
      imports: [],
      controllers: [MusicGetController],
      providers: [
        MusicRepository,
        MusicHistoryRepository,
        DomainMessageBroker,
      ],
    } ).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
    routerApp = app.getHttpServer();

    db.init();
    await db.connect();
    await loadFixtures();
  } );

  beforeEach(async () => {
    await HistoryMusicModelOdm.deleteMany( {} );
  } );

  afterAll(async () => {
    await db.disconnect();
    await app.close();
  } );

  it("should get random", async () => {
    const response = await request(routerApp)
      .get("/get/random")
      .expect(200)
      .send();

    expect(response.body).toBeDefined();
    expect(response.text).toBeDefined();

    expect(response.text.includes("api/musics/get/raw/")).toBeTruthy();
    expect(response.text.includes("api/musics/get/random")).toBeTruthy();
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
      expect(response.text.includes("api/musics/get/random")).toBeTruthy();
    } );

    it("should get a music if query weight is put", async () => {
      const possibleMusics: Music[] = MUSICS_WITH_TAGS_SAMPLES.filter((music) => music.weight > 10);

      expectNotEmpty(possibleMusics);
      const response = await request(routerApp)
        .get("/get/random?q=weight:>10")
        .expect(200)
        .send();

      expectResponseIncludeAnyOfMusics(response, possibleMusics);
    } );

    it("should get a music with tag t1", async () => {
      const query = "tag:t1";
      const musicsWithTagT1 = MUSICS_WITH_TAGS_SAMPLES.filter((music) => music.tags?.includes("t1"));

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
      const musicsWithTagT2Only = MUSICS_WITH_TAGS_SAMPLES.filter((music) => music.tags?.includes("only-t2"));
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
