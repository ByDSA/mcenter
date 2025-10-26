import request from "supertest";
import { Application } from "express";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { loadFixtureSimpsons } from "#core/db/tests/fixtures/sets";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { loadFixtureAuthUsers } from "#core/db/tests/fixtures/sets/auth-users";
import { EpisodePickerModule } from "./module";

async function loadFixtures() {
  await loadFixtureSimpsons();
  await loadFixtureAuthUsers();
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
      auth: {
        repositories: "normal",
        cookies: "mock",
      },
      db: {
        using: "default",
      },
    } );
    routerApp = testingSetup.routerApp;
    await loadFixtures();
    await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);
  } );

  it("should get", async () => {
    const response = await request(routerApp)
      .get("/simpsons")
      .expect(200)
      .send();

    expect(response.body).toBeDefined();
  } );
} );
