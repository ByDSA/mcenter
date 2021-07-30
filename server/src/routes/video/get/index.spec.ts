/* eslint-disable import/no-extraneous-dependencies */
import App from "@app/app";
import { TestingApp1 } from "@tests/TestingApps";
import request from "supertest";
import { VideoObjType } from "../getObj";

const app: App = new TestingApp1();

beforeAll(async () => {
  await app.run();
} );

afterAll(async () => {
  await app.kill();
} );

it("not found", async () => {
  await request(app.expressApp)
    .get("/api/video/get/notfound")
    .expect(404);
} );

it("ok", async () => {
  await request(app.expressApp)
    .get("/api/video/get/sample1")
    .expect(200);
} );

it("correct data", async () => {
  const res = await request(app.expressApp)
    .get("/api/video/get/sample1");
  const expected: VideoObjType = {
    hash: "5e70b96ad27dc8581424be7069ee9de8da9388b716e6fe213d88385f19baf80a",
    raw: `${app.baseUrl}/api/video/get/sample1?raw=1`,
    url: `${app.baseUrl}/api/video/get/sample1`,
  };
  const actual = JSON.parse(res.text);

  expect(actual).toStrictEqual(expected);
} );
