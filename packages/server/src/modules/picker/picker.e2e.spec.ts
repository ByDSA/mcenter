import { DomainMessageBroker } from "#modules/domain-message-broker";
import { assertIsDefined } from "#shared/utils/validation";
import ExpressAppMock from "#tests/main/ExpressAppMock";
import { loadFixtureSimpsons } from "#tests/main/db/fixtures/sets";
import { RouterApp } from "#utils/express/test";
import { Application } from "express";
import request from "supertest";
import PickerController from "./Controller";

let app: ExpressAppMock;
const pickerController = new PickerController( {
  domainMessageBroker: new DomainMessageBroker(),
} );

async function loadFixtures() {
  await app.dropDb();
  await loadFixtureSimpsons();
}

describe("showPicker", () => {
  app = new ExpressAppMock( {
    modules: {
      picker: {
        controller: pickerController,
      },
    },
    controllers: {
      cors: false,
    },
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
    const routerApp = RouterApp(pickerController.getRouter());
    const response = await request(routerApp)
      .get("/simpsons")
      .expect(200)
      .send();

    expect(response.body).toBeDefined();
  } );
} );