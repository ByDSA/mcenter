// eslint-disable-next-line import/no-extraneous-dependencies
import request from "supertest";
import { TestingApp1 } from "../../../tests/TestingApps";
import { checkMusic, MusicInterface } from "../../db/models/music";

const app = new TestingApp1();

beforeAll(async () => {
  await app.run();
} );

afterAll(async () => {
  await app.kill();
} );

it("get all", async () => {
  const res = await request(app.expressApp)
    .get("/api/music/get/all")
    .expect(200);
  const expectedJson: MusicInterface[] = [
    {
      tags: [],
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
