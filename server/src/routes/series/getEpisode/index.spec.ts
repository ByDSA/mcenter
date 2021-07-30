// eslint-disable-next-line import/no-extraneous-dependencies
import request from "supertest";
import { TestingApp1 } from "../../../../tests/TestingApps";

const app = new TestingApp1();

beforeAll(async () => {
  await app.run();
} );

afterAll(async () => {
  await app.kill();
} );
it("get ok", async () => {
  await request(app.expressApp)
    .get("/api/serie/get/serie-1/0x01")
    .expect(200);
} );

it("get correct data", async () => {
  const res = await request(app.expressApp)
    .get("/api/serie/get/serie-1/0x01");
  const actual = JSON.parse(res.text);
  const expected = {
    hash: "5e70b96ad27dc8581424be7069ee9de8da9388b716e6fe213d88385f19baf80a",
    url: `http://localhost:${app.port}/api/serie/get/serie-1/0x01`,
    raw: `http://localhost:${app.port}/api/serie/get/serie-1/0x01?raw=1`,
    name: "1",
  };

  expect(actual).toStrictEqual(expected);
} );

it("get raw ok", async () => {
  await request(app.expressApp)
    .get("/api/serie/get/serie-1/0x01?raw=1")
    .expect(200);
} );

it("get raw correct data", async () => {
  const res = await request(app.expressApp)
    .get("/api/serie/get/serie-1/0x01?raw=1");
  const actual = res.header["content-type"];
  const expected = "video/mp4";

  expect(actual).toBe(expected);
} );
