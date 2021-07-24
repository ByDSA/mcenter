import fs from "fs";
import { calcHashVideoFile, createVideoFromPath, deleteAllVideos, findVideoByHash, findVideoByPath, findVideoByUrl, getFullPathVideo } from ".";
import { TestingApp1 } from "../../../../tests/TestingApps";
import App from "../../../app";

describe("all tests", () => {
  describe("keep database", () => {
    const app: App = new TestingApp1();

    beforeAll(async () => {
      await app.run();
    } );

    afterAll(async () => {
      await app.kill();
    } );

    describe("findByHash", () => {
      it("not found", async () => {
        const actual = await findVideoByHash("asd");

        expect(actual).toBeNull();
      } );

      it("found", async () => {
        const HASH = "5e70b96ad27dc8581424be7069ee9de8da9388b716e6fe213d88385f19baf80a";
        const actual = await findVideoByHash(HASH);

        expect(actual).not.toBeNull();
        expect(actual?.hash).toBe(HASH);
      } );
    } );

    describe("findByUrl", () => {
      it("found", async () => {
        const URL = "sample1";
        const actual = await findVideoByUrl(URL);

        expect(actual).not.toBeNull();
        expect(actual?.url).toBe(URL);
      } );

      it("not found", async () => {
        const URL = "sample3";
        const actual = await findVideoByUrl(URL);

        expect(actual).toBeNull();
      } );
    } );

    describe("findByPath", () => {
      it("found", async () => {
        const path = "sample1.mp4";
        const actual = await findVideoByPath(path);

        expect(actual).not.toBeNull();
        expect(actual?.path).toBe(path);
      } );

      it("not found", async () => {
        const relativePath = "unadded.mp4";
        const actual = await findVideoByPath(relativePath);

        expect(actual).toBeNull();
        const fullPath = getFullPathVideo(relativePath);

        expect(fs.existsSync(fullPath)).toBeTruthy();
      } );
    } );

    it("calcHashFile", () => {
      const expected = "5e70b96ad27dc8581424be7069ee9de8da9388b716e6fe213d88385f19baf80a";
      const actual = calcHashVideoFile("sample1.mp4");

      expect(actual).toBe(expected);
    } );
  } );

  describe("edits database", () => {
    const app: App = new TestingApp1();

    beforeEach(async () => {
      await app.run();
    } );

    afterEach(async () => {
      await app.kill();
    } );

    it("deleteAll", async () => {
      const relativePath = "sample1.mp4";
      const oldVideo = await findVideoByPath(relativePath);

      expect(oldVideo).not.toBeNull();
      await deleteAllVideos();
      const newVideo = await findVideoByPath(relativePath);

      expect(newVideo).toBeNull();
    } );

    it("createFromPath", async () => {
      const relativePath = "unadded.mp4";
      const oldVideo = await findVideoByPath(relativePath);

      expect(oldVideo).toBeNull();

      const createdVideo = await createVideoFromPath(relativePath);

      await createdVideo.save();

      const newVideo = await findVideoByPath(relativePath);

      expect(newVideo).not.toBeNull();
    } );
  } );
} );
