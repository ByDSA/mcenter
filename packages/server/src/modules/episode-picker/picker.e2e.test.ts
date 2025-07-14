import request from "supertest";
import { Application } from "express";
import { loadFixtureSimpsons } from "#tests/main/db/fixtures/sets";
import { createTestingAppModuleAndInit, TestingSetup } from "#tests/nestjs/app";
import { EpisodePickerModule } from "./module";

async function loadFixtures() {
  await loadFixtureSimpsons();
}

let testingSetup: TestingSetup;
let routerApp: Application;

describe("showPicker", () => {
  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [EpisodePickerModule],
      controllers: [],
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

  it("should get", async () => {
    const response = await request(routerApp)
      .get("/simpsons")
      .expect(200)
      .send();

    expect(response.body).toBeDefined();
  } );
} );
