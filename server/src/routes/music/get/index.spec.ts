/* eslint-disable import/no-extraneous-dependencies */
import App from "@app/app";
import { TestingApp1 } from "@tests/TestingApps";
import request from "supertest";
import { MusicObjType } from "../getObj";

const app: App = new TestingApp1();

beforeAll(async () => {
  await app.run();
} );

afterAll(async () => {
  await app.kill();
} );

it("not found", async () => {
  await request(app.expressApp)
    .get("/api/music/get/notfound")
    .expect(404);
} );

it("found", async () => {
  await request(app.expressApp)
    .get("/api/music/get/dk")
    .expect(200);
} );

it("correct data", async () => {
  const res = await request(app.expressApp)
    .get("/api/music/get/dk");
  const expected: MusicObjType = {
    hash: "eacf40b68de85b759524e3bd0bea1b4393360f682db3a7f3ec25ff46b1d01872",
    name: "dk",
    raw: `${app.baseUrl}/api/music/get/dk?raw=1`,
    url: `${app.baseUrl}/api/music/get/dk`,
  };
  const actual = JSON.parse(res.text);

  expect(actual).toStrictEqual(expected);
} );
