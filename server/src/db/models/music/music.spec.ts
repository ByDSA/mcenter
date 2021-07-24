import { calcHashMusicFile, findMusicByHash, findMusicByUrl } from ".";
import { TestingApp1 } from "../../../../tests/TestingApps";
import App from "../../../app";

describe("all tests", () => {
  describe("findByHash", () => {
    const app: App = new TestingApp1();

    beforeAll(async () => {
      await app.run();
    } );

    afterAll(async () => {
      await app.kill();
    } );

    it("not found", async () => {
      const actual = await findMusicByHash("asd");

      expect(actual).toBeNull();
    } );

    it("found", async () => {
      const HASH = "eacf40b68de85b759524e3bd0bea1b4393360f682db3a7f3ec25ff46b1d01872";
      const actual = await findMusicByHash(HASH);

      expect(actual).not.toBeNull();
      expect(actual?.hash).toBe(HASH);
    } );
  } );

  describe("findByUrl", () => {
    const app: App = new TestingApp1();

    beforeAll(async () => {
      await app.run();
    } );

    afterAll(async () => {
      await app.kill();
    } );

    it("found", async () => {
      const URL = "dk";
      const actual = await findMusicByUrl(URL);

      expect(actual).not.toBeNull();
      expect(actual?.url).toBe(URL);
    } );
  } );

  describe("files", () => {
    describe("getHashFile", () => {
      it("existing path", () => {
        const expected = "eacf40b68de85b759524e3bd0bea1b4393360f682db3a7f3ec25ff46b1d01872";
        const path = "dk.mp3";
        const actual = calcHashMusicFile(path);

        expect(actual).toBe(expected);
      } );
    } );
  } );
} );
