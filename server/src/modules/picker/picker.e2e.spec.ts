import { PlaySerieControllerMock } from "#modules/play/tests";
import PlayStreamControllerMock from "#modules/play/tests/PlayStreamControllerMock copy";
import { TestMongoDatabase } from "#tests/main";
import { loadFixtureSerieAndEpisodesSimpsons } from "#tests/main/db/fixtures/sets";
import { RouterApp } from "#utils/express/test";
import { assertIsDefined } from "#utils/validation";
import { Application } from "express";
import request from "supertest";
import { ExpressApp } from "#main";
import PickerController from "./Controller";

const testDatabase = new TestMongoDatabase();
const pickerController = new PickerController();

async function loadFixtures() {
  await testDatabase.drop();
  await loadFixtureSerieAndEpisodesSimpsons();
}

describe("showPicker", () => {
  const app = new ExpressApp( {
    db: {
      instance: testDatabase,
    },
    play: {
      playSerieController: new PlaySerieControllerMock(),
      playStreamController: new PlayStreamControllerMock(),
    },
    pickerController,
  } );
  let expressApp: Application | null = null;

  beforeAll(async () => {
    await app.init();
    expressApp = app.getExpressApp();
    assertIsDefined(expressApp);
    await loadFixtures();
  } );

  afterAll(async () => {
    await app.close();
  } );
  it("should get", async () => {
    const routerApp = RouterApp(pickerController.getPickerRouter());
    const response = await request(routerApp)
      .get("/simpsons")
      .expect(200)
      .send();

    console.log(response);
  } );
} );