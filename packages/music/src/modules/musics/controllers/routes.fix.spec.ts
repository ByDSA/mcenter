/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line import/no-extraneous-dependencies
import request from "supertest";
import App from "../../../routes/app";
import { TestingApp1 } from "../../../routes/tests/TestingApps";

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
        .get("/api/update/fix/all")
        .expect(200);
    } );
  } );
} );
