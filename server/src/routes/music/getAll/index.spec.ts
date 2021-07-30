/* eslint-disable import/no-extraneous-dependencies */
import { TestingApp1 } from "@tests/TestingApps";
import request from "supertest";
import { MusicObjType } from "../getObj";

const app = new TestingApp1();

beforeAll(async () => {
  await app.run();
} );

afterAll(async () => {
  await app.kill();
} );

const url = "/api/music/getAll";

it("ok", async () => {
  await request(app.expressApp)
    .get(url)
    .expect(200);
} );

it("correct data", async () => {
  const res = await request(app.expressApp)
    .get(url);
  const expectedJson: MusicObjType[] = [
    {
      hash: "eacf40b68de85b759524e3bd0bea1b4393360f682db3a7f3ec25ff46b1d01872",
      name: "dk",
      raw: `${app.baseUrl}/api/music/get/dk?raw=1`,
      url: `${app.baseUrl}/api/music/get/dk`,
    }];
  const actualJson = JSON.parse(res.text);

  expect(actualJson.length).toBe(expectedJson.length);

  for (let i = 0; i < expectedJson.length; i++) {
    const actual = actualJson[i];
    const expected = expectedJson[i];

    expect(actual).toStrictEqual(expected);
  }
} );
