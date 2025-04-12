import { assertIsDefined } from "#shared/utils/validation";
import { Application } from "express";
import request from "supertest";
import { registerSingletonIfNotAndGet } from "#tests/main";
import { ExpressAppMock } from "#tests/main/ExpressAppMock";
import { RouterApp } from "#utils/express/test";
import { MusicUpdateRemoteController } from "./UpdateRemoteController";

let app: ExpressAppMock;
const updateRemoteController = registerSingletonIfNotAndGet(MusicUpdateRemoteController);
let routerApp: Application;

describe("updateRemoteController", () => {
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

    it("should return a response with deleted, new, updated and moved", () => {
      expect(response.body).toBeDefined();
      expect(response.text).toBeDefined();
      expect(response.body).toHaveProperty("deleted");
      expect(response.body).toHaveProperty("new");
      expect(response.body).toHaveProperty("updated");
      expect(response.body).toHaveProperty("moved");
    } );

    it("should return empty updated, deleted and moved", () => {
      expect(response.body.updated).toHaveLength(0);
      expect(response.body.deleted).toHaveLength(0);
      expect(response.body.moved).toHaveLength(0);
    } );

    it("should return some new musics", () => {
      const actualNewMusics = response.body.new;

      expect(actualNewMusics).not.toHaveLength(0);
    } );
  } );
} );
