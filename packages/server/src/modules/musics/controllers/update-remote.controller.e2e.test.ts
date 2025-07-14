import request from "supertest";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { createTestingAppModuleAndInit, TestingSetup } from "#tests/nestjs/app";
import { UpdateRemoteTreeService } from "../services";
import { MusicRepository } from "../repositories";
import { MusicUpdateRemoteController } from "./update-remote.controller";

describe("updateRemoteController", () => {
  let testingSetup: TestingSetup;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [],
      controllers: [MusicUpdateRemoteController],
      providers: [
        UpdateRemoteTreeService,
        MusicRepository,
        DomainMessageBroker,
      ],
    }, {
      db: {
        using: "default",
      },
    } );
  } );

  beforeEach(async () => {
    await testingSetup.db!.drop();
  } );

  describe("should update remote tree", () => {
    let response: request.Response;

    beforeAll(async () => {
      response = await request(testingSetup.routerApp)
        .get("/update/remote")
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
