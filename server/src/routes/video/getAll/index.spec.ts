/* eslint-disable import/no-extraneous-dependencies */
import { TestingApp1 } from "@tests/TestingApps";
import request from "supertest";
import { VideoObjType } from "../getObj";

const app = new TestingApp1();

beforeAll(async () => {
  await app.run();
} );

afterAll(async () => {
  await app.kill();
} );

const url = "/api/video/getAll";

it("ok", async () => {
  await request(app.expressApp)
    .get(url)
    .expect(200);
} );

it("correct data", async () => {
  const res = await request(app.expressApp)
    .get(url);
  const expectedJson: VideoObjType[] = [
    {
      hash: "5e70b96ad27dc8581424be7069ee9de8da9388b716e6fe213d88385f19baf80a",
      raw: `${app.baseUrl}/api/video/get/sample1?raw=1`,
      url: `${app.baseUrl}/api/video/get/sample1`,
    }];
  const actualJson = JSON.parse(res.text);

  expect(actualJson.length).toBe(expectedJson.length);

  for (let i = 0; i < expectedJson.length; i++) {
    const actual = actualJson[i];
    const expected = expectedJson[i];

    expect(actual).toStrictEqual(expected);
  }
} );
