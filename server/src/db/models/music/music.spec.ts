import { calcMusicHashFile, checkMusic, findMusicByHash, findMusicByPath, findMusicByUrl, findMusicFiles, findMusicFilesAt } from ".";
import { TestingApp1 } from "../../../../tests/TestingApps";
import App from "../../../app";

describe("all tests", () => {
  describe("no modifies db", () => {
    const app: App = new TestingApp1();

    beforeAll(async () => {
      await app.run();
    } );

    afterAll(async () => {
      await app.kill();
    } );
    describe("mock", () => {
      it("dk.mp3", async () => {
        const expected = {
          path: "dk.mp3",
          url: "dk",
          name: "dk",
          hash: "eacf40b68de85b759524e3bd0bea1b4393360f682db3a7f3ec25ff46b1d01872",
          tags: [],
        };
        const actual = await findMusicByPath("dk.mp3");

        checkMusic(actual, expected);
      } );
    } );
    describe("find", () => {
      describe("findByHash", () => {
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
        it("found", async () => {
          const URL = "dk";
          const actual = await findMusicByUrl(URL);

          expect(actual).not.toBeNull();
          expect(actual?.url).toBe(URL);
        } );
      } );
    } );

    describe("files", () => {
      describe("getHashFile", () => {
        it("existing path", () => {
          const expected = "eacf40b68de85b759524e3bd0bea1b4393360f682db3a7f3ec25ff46b1d01872";
          const path = "dk.mp3";
          const actual = calcMusicHashFile(path);

          expect(actual).toBe(expected);
        } );
      } );

      describe("findMusicFiles", () => {
        it("folder", () => {
          const expected = [
            "dk.mp3",
            "aot4_copy.mp3",
            "a/aot4.mp3",
            "Driftveil.mp3"];
          const actual = findMusicFiles();

          expect(actual.sort()).toEqual(expected.sort());
        } );
      } );

      describe("findMusicFilesAt", () => {
        it("valid folder", () => {
          const path = "a";
          const expected = [
            "a/aot4.mp3",
          ];
          const actual = findMusicFilesAt(path);

          expect(actual.sort()).toEqual(expected.sort());
        } );
        it("unexisting folder", () => {
          const path = "unexisting/folder";
          const actual = findMusicFilesAt(path);
          const expected: string[] = [];

          expect(actual).toStrictEqual(expected);
        } );
      } );
    } );
  } );
} );
