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
      .get("/api/user/get/user1/serie/notfound")
      .expect(404);
  } );

  it("found", async () => {
    await request(app.expressApp)
      .get("/api/user/get/user1/serie/serie-1")
      .expect(200);
  } );
} );

describe("pick", () => {
  it("not found", async () => {
    await request(app.expressApp)
      .get("/api/user/get/user1/serie/notfound?pick=1&mode=seq")
      .expect(404);
  } );

  it("no mode", async () => {
    await request(app.expressApp)
      .get("/api/user/get/user1/serie/serie-1?pick=1")
      .expect(400);
  } );

  it("mode rand", async () => {
    await request(app.expressApp)
      .get("/api/user/get/user1/serie/serie-1?pick=1&mode=rand")
      .expect(200);
  } );

  it("mode seq", async () => {
    await request(app.expressApp)
      .get("/api/user/get/user1/serie/serie-1?pick=1&mode=seq")
      .expect(200);
  } );
} );
