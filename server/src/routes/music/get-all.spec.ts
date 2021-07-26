// eslint-disable-next-line import/no-extraneous-dependencies
import request from "supertest";
import { TestingApp1 } from "../../../tests/TestingApps";
import { checkMusic, createMusicFromPath, Music, MusicInterface } from "../../db/models/music";
import { generateView } from "./get-all";

const app = new TestingApp1();

beforeAll(async () => {
  await app.run();
} );

afterAll(async () => {
  await app.kill();
} );
it("generateView", async () => {
  const musics: Music[] = [<Music> await createMusicFromPath("dk.mp3")];
  const actual = generateView(musics);
  const expectedText = "<ul><li><a href='/raw/dk'>dk</li></ul>";

  expect(actual).toEqual(expectedText);
}, 60000);

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
