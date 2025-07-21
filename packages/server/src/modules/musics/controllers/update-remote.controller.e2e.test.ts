import request from "supertest";
import { createTestingAppModuleAndInit, TestingSetup } from "#tests/nestjs/app";
import { DomainMessageBrokerModule } from "#modules/domain-message-broker/module";
import { UpdateRemoteTreeService } from "../services";
import { MusicRepository } from "../repositories";
import { MusicFileInfoRepository } from "../file-info/repositories/repository";
import { MusicBuilderService } from "../builder/music-builder.service";
import { MusicUrlGeneratorService } from "../builder/url-generator.service";
import { MusicUpdateRemoteController } from "./update-remote.controller";

describe("updateRemoteController", () => {
  let testingSetup: TestingSetup;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [DomainMessageBrokerModule],
      controllers: [MusicUpdateRemoteController],
      providers: [
        UpdateRemoteTreeService,
        MusicRepository,
        MusicBuilderService,
        MusicUrlGeneratorService,
        MusicFileInfoRepository,
      ],
    }, {
      db: {
        using: "default",
      },
    } );
  } );

  describe("should update remote tree", () => {
    let response: request.Response;

    beforeEach(async () => {
      if (response)
        return;

      await testingSetup.db!.drop();
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
