/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line import/no-extraneous-dependencies
import request from "supertest";
import App from "../../app";
import { TestingApp1 } from "../../app/TestingApps";

const app: App = new TestingApp1();

describe("fix", () => {
  beforeAll(async () => {
    await app.run();
  } );

  afterAll(async () => {
    await app.kill();
  } );

  describe("fixAll", () => {
    it("ok", async () => {
      await request(app.expressApp)
        .get("/api/music/update/fix/all")
        .expect(200);
    } );
  } );

  describe("fix one", () => {
    it("no arg not found", async () => {
      await request(app.expressApp)
        .get("/api/music/update/fix/one")
        .expect(404);
    } );

    describe("url", () => {
      it("not in remote - not found", async () => {
        await request(app.expressApp)
          .get("/api/music/update/fix/one?url=asdf")
          .expect(404);
      } );

      it("in remote - found", async () => {
        await request(app.expressApp)
          .get("/api/music/update/fix/one?url=dk")
          .expect(200);
      } );
    } );

    describe("local", () => {
      it("not found", async () => {
        await request(app.expressApp)
          .get("/api/music/update/fix/one?local=dk")
          .expect(404);
      } );

      it("found", async () => {
        await request(app.expressApp)
          .get("/api/music/update/fix/one?local=dk.mp3")
          .expect(200);
      } );
    } );
  } );
} );
