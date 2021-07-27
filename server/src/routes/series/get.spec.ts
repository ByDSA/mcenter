// eslint-disable-next-line import/no-extraneous-dependencies
import request from "supertest";
import { TestingApp1 } from "../../../tests/TestingApps";
import { checkSerie, SerieInterface } from "../../db/models/serie";

const app = new TestingApp1();

beforeAll(async () => {
  await app.run();
} );

afterAll(async () => {
  await app.kill();
} );
it("get ok", async () => {
  await request(app.expressApp)
    .get("/api/serie/get/serie-1")
    .expect(200);
} );

it("get correct data", async () => {
  const res = await request(app.expressApp)
    .get("/api/serie/get/serie-1");
  const expected: SerieInterface = {
    path: "serie 1",
    name: "serie 1",
    url: "serie-1",
    episodes: [],
  };
  const actual = JSON.parse(res.text);

  checkSerie(actual, expected);
} );
