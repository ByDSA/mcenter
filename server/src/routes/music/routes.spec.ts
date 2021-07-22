/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
import request from "supertest";
import App from "../../app";
import { TestingApp1 } from "../../app/TestingApps";

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
      .get("/api/music/raw/notfound")
      .expect(404);
  } );

  it("found", async () => {
    await request(app.expressApp)
      .get("/api/music/raw/dk")
      .expect(200);
  } );

  it("get all", async () => {
    const res = await request(app.expressApp)
      .get("/api/music/get/all")
      .expect(200);
    const expectedJson = [
      {
        tags: [],
        hash: "eacf40b68de85b759524e3bd0bea1b4393360f682db3a7f3ec25ff46b1d01872",
        path: "dk.mp3",
        title: "dk",
        url: "dk",
      }];
    const actualJson = JSON.parse(res.text);

    delete actualJson[0]._id;
    delete actualJson[0].__v;

    expect(actualJson).toStrictEqual(expectedJson);
  } );
} );
