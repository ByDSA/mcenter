import { findByHash, findByUrl } from ".";
import App from "../../../app";
import { TestingApp1 } from "../../../app/TestingApps";

describe("all tests", () => {
  describe("getByHash", () => {
    const app: App = new TestingApp1();

    beforeAll(async () => {
      await app.run();
    } );

    afterAll(async () => {
      await app.kill();
    } );

    it("not found", async () => {
      const actual = await findByHash("asd");

      expect(actual).toBeNull();
    } );

    it("found", async () => {
      const HASH = "eacf40b68de85b759524e3bd0bea1b4393360f682db3a7f3ec25ff46b1d01872";
      const actual = await findByHash(HASH);

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
      const actual = await findByUrl(URL);

      expect(actual).not.toBeNull();
      expect(actual?.url).toBe(URL);
    } );
  } );
} );
