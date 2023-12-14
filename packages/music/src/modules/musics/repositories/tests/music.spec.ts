import { MusicRepository } from "#modules/musics";
import App from "../../../../routes/app";
import { TestingApp1 } from "../../../../routes/tests/TestingApps";

describe("all tests", () => {
  const repository = new MusicRepository();

  describe("getByHash", () => {
    const app: App = new TestingApp1();

    beforeAll(async () => {
      await app.run();
    } );

    afterAll(async () => {
      await app.kill();
    } );

    it("not found", async () => {
      const actual = await repository.findByHash("asd");

      expect(actual).toBeNull();
    } );

    it("found", async () => {
      const HASH = "eacf40b68de85b759524e3bd0bea1b4393360f682db3a7f3ec25ff46b1d01872";
      const actual = await repository.findByHash(HASH);

      expect(actual).not.toBeNull();
      expect(actual?.hash).toBe(HASH);
    } );
  } );

  describe("getByUrl", () => {
    const app: App = new TestingApp1();

    beforeAll(async () => {
      await app.run();
    } );

    afterAll(async () => {
      await app.kill();
    } );

    it("found", async () => {
      const URL = "dk";
      const actual = await repository.findByUrl(URL);

      expect(actual).not.toBeNull();
      expect(actual?.url).toBe(URL);
    } );
  } );
} );
