/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
import request from "supertest";
import App from "./app";
import { TestingApp1 } from "./tests/TestingApps";

const app: App = new TestingApp1();

describe("all", () => {
  beforeAll(async () => {
    await app.run();
  } );

  afterAll(async () => {
    await app.kill();
  } );
  it("not found", async () => {
    await request(app.expressApp)
      .get("/notfound")
      .expect(404);
  } );

  it("raw not found", async () => {
    await request(app.expressApp)
      .get("/api/get/raw/notfound")
      .expect(404);
  } );

  it("found", async () => {
    await request(app.expressApp)
      .get("/api/get/raw/dk")
      .expect(200);
  } );

  it("get all", async () => {
    const res = await request(app.expressApp)
      .get("/api/get/all")
      .expect(200);
    const expectedJson = [{
      tags: [],
      hash: "eacf40b68de85b759524e3bd0bea1b4393360f682db3a7f3ec25ff46b1d01872",
      path: "dk.mp3",
      title: "dk",
      url: "dk",
      __v: 0,
    }];

    for (const m of res.body) {
      // eslint-disable-next-line no-underscore-dangle
      expect(m._id).toBeDefined();
      // eslint-disable-next-line no-underscore-dangle
      delete m._id;
    }

    expect(res.body).toEqual(expectedJson);
  } );
} );
