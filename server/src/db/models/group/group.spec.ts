import { checkGroup, findGroupByUrl, GroupInterface } from ".";
import { TestingApp1 } from "../../../../tests/TestingApps";
import App from "../../../app";
import { findVideoByUrl } from "../video";

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
      it("group1", async () => {
        const video1 = await findVideoByUrl("video1");

        if (!video1)
          throw new Error();

        const expected: GroupInterface = {
          url: "group-1",
          name: "group 1",
          type: "fixed",
          visibility: "public",
          content: [
            {
              type: "video",
              // eslint-disable-next-line no-underscore-dangle
              id: video1._id,
            },
          ],
        };
        const actual = await findGroupByUrl("group-1");

        checkGroup(actual, expected);
      } );
    } );
    describe("find", () => {
      describe("findByUrl", () => {
        it("found", async () => {
          const URL = "group-1";
          const actual = await findGroupByUrl(URL);

          expect(actual).not.toBeNull();
          expect(actual?.url).toBe(URL);
        } );
      } );
    } );
  } );
} );
