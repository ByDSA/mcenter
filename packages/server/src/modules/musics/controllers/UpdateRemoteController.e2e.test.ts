/* eslint-disable import/no-internal-modules */
import { assertIsDefined } from "#shared/utils/validation";
import { registerSingletonIfNotAndGet } from "#tests/main";
import ExpressAppMock from "#tests/main/ExpressAppMock";
import { RouterApp } from "#utils/express/test";
import { Application } from "express";
import request from "supertest";
import UpdateRemoteController from "./UpdateRemoteController";

let app: ExpressAppMock;
const updateRemoteController = registerSingletonIfNotAndGet(UpdateRemoteController);
let routerApp: Application | null = null;

describe("UpdateRemoteController", () => {
  app = new ExpressAppMock();
  let expressApp: Application | null = null;

  beforeAll(async () => {
    await app.init();
    expressApp = app.getExpressApp();
    assertIsDefined(expressApp);
    routerApp = RouterApp(updateRemoteController.getRouter());
  } );

  beforeEach(async () => {
    await app.dropDb();
  } );

  afterAll(async () => {
    await app.close();
  } );

  describe("should update remote tree", () => {
    let response: request.Response;

    beforeAll(async () => {
      response = await request(routerApp)
        .get("/")
        .expect(200)
        .send();
    } );

    it("should return a response with deleted, new, updated and moved", async () => {
      expect(response.body).toBeDefined();
      expect(response.text).toBeDefined();
      expect(response.body).toHaveProperty("deleted");
      expect(response.body).toHaveProperty("new");
      expect(response.body).toHaveProperty("updated");
      expect(response.body).toHaveProperty("moved");
    } );

    it("should return empty updated, deleted and moved", async () => {
      expect(response.body.updated).toHaveLength(0);
      expect(response.body.deleted).toHaveLength(0);
      expect(response.body.moved).toHaveLength(0);
    } );

    it("should return some new musics", async () => {
      const actualNewMusics = response.body.new;

      expect(actualNewMusics).not.toHaveLength(0);
    } );
  } );
} );