import { createFromPath, Music } from "../../db/models/music";
import { TestingApp1 } from "../TestingApps";
import { generateView } from "./routes.get-all";

const app = new TestingApp1();

beforeAll(async () => {
  await app.run();
} );

afterAll(async () => {
  await app.kill();
} );
it("generateView", async () => {
  const musics: Music[] = [await createFromPath("dk.mp3")];
  const actual = generateView(musics);
  const expectedText = "<ul><li><a href='/raw/dk'>dk</li></ul>";

  expect(actual).toEqual(expectedText);
}, 60000);
