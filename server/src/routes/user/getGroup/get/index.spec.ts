/* eslint-disable import/no-extraneous-dependencies */
import App from "@app/app";
import { TestingApp1 } from "@tests/TestingApps";
import request from "supertest";

const app: App = new TestingApp1();

beforeAll(async () => {
  await app.run();
} );

afterAll(async () => {
  await app.kill();
} );

describe("get", () => {
  it("not found", async () => {
    await request(app.expressApp)
      .get("/api/user/get/user1/group/notfound")
      .expect(404);
  } );

  it("found", async () => {
    await request(app.expressApp)
      .get("/api/user/get/user1/group/group-1")
      .expect(200);
  } );
} );
