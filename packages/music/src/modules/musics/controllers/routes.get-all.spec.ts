import { Music } from "#shared/models/musics";
import { TestingApp1 } from "../../../routes/tests/TestingApps";
import { generateView } from "../repositories/Repository";

const app = new TestingApp1();

beforeAll(async () => {
  await app.run();
} );

afterAll(async () => {
  await app.kill();
} );
it("generateView", async () => {
  const musics: Music[] = [await app.getMusicRepository().createFromPath("dk.mp3")];
  const actual = generateView(musics);
  const expectedText = "<ul><li><a href='/raw/dk'>dk</li></ul>";

  expect(actual).toEqual(expectedText);
}, 60000);
