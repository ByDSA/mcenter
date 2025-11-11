import request from "supertest";
import { Application } from "express";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { HttpStatus } from "@nestjs/common";
import { loadFixtureSimpsons } from "#core/db/tests/fixtures/sets";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { loadFixtureAuthUsers } from "#core/db/tests/fixtures/sets/auth-users";
import { StreamPickerModule } from "./module";

async function loadFixtures() {
  await loadFixtureSimpsons();
  await loadFixtureAuthUsers();
}

let testingSetup: TestingSetup;
let routerApp: Application;

describe("showPicker", () => {
  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [StreamPickerModule],
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
  } );

  it("should return valid data with user provided", async () => {
    await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);
    const response = await request(routerApp)
      .get("/picker/simpsons")
      .expect(HttpStatus.OK)
      .send();

    expect(response.body).toBeDefined();
  } );

  it("should throw and error because no token provided", async () => {
    await testingSetup.useMockedUser(null);
    const response = await request(routerApp)
      .get("/picker/simpsons")
      .expect(HttpStatus.UNAUTHORIZED)
      .send();

    expect(response.body).toBeDefined();
  } );

  it("should return valid data with token provided", async () => {
    await testingSetup.useMockedUser(null);
    const token = fixtureUsers.Normal.UserWithRoles.id;
    const response = await request(routerApp)
      .get("/picker/simpsons?token=" + token)
      .expect(200)
      .send();

    expect(response.body).toBeDefined();
  } );

  it("should return 422 on invalid stream", async () => {
    await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);
    const response = await request(routerApp)
      .get("/picker/invalid-stream")
      .expect(HttpStatus.UNPROCESSABLE_ENTITY)
      .send();

    expect(response.body).toBeDefined();
  } );
} );
