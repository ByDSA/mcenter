import { Application } from "express";
import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { TestMongoDatabase } from "#tests/main";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { UpdateRemoteTreeService } from "../services";
import { MusicRepository } from "../repositories";
import { MusicUpdateRemoteController } from "./UpdateRemoteController";

describe("updateRemoteController", () => {
  let app: INestApplication;
  let routerApp: Application;
  const db = new TestMongoDatabase();

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule( {
      imports: [],
      controllers: [MusicUpdateRemoteController],
      providers: [
        UpdateRemoteTreeService,
        MusicRepository,
        DomainMessageBroker,
      ],
    } ).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
    routerApp = app.getHttpServer();

    db.init();
    await db.connect();
  } );

  beforeEach(async () => {
    await db.drop();
  } );

  afterAll(async () => {
    await db.disconnect();
    await app.close();
  } );

  describe("should update remote tree", () => {
    let response: request.Response;

    beforeAll(async () => {
      response = await request(routerApp)
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
