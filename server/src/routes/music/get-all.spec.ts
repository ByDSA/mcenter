// eslint-disable-next-line import/no-extraneous-dependencies
import request from "supertest";
import { TestingApp1 } from "../../../tests/TestingApps";
import { checkMusic, MusicInterface } from "../../db/models/resources/music";

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

it("get all", async () => {
  const res = await request(app.expressApp)
    .get(url);
  const expectedJson: MusicInterface[] = [
    {
      hash: "eacf40b68de85b759524e3bd0bea1b4393360f682db3a7f3ec25ff46b1d01872",
      path: "dk.mp3",
      name: "dk",
      url: "dk",
    }];
  const actualJson = JSON.parse(res.text);

  expect(actualJson.length).toBe(expectedJson.length);

  for (let i = 0; i < expectedJson.length; i++) {
    const actual = actualJson[i];
    const expected = expectedJson[i];

    checkMusic(actual, expected);
  }
} );
