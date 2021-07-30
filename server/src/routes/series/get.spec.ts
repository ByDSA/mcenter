// eslint-disable-next-line import/no-extraneous-dependencies
import request from "supertest";
import { TestingApp1 } from "../../../tests/TestingApps";
import { checkSerie, SerieInterface } from "../../db/models/resources/serie";

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
  const actual = JSON.parse(res.text);
  const expected: SerieInterface = {
    path: "serie 1",
    name: "serie 1",
    url: "serie-1",
    episodes: [
      {
        _id: actual.episodes[0]._id,
        hash: "61027d69ef6c92db1f9307b0",
        path: "0/1.mp4",
        url: "0x01",
        name: "1",
      },
      {
        _id: actual.episodes[1]._id,
        hash: "61027d69ef6c92db1f9307b0",
        path: "1/1.mp4",
        url: "1x01",
        name: "1",
      },
    ],
  };

  checkSerie(actual, expected);
} );
