import App from "@app/app";
import { findVideoByUrl } from "@models/resources/video";
import { TestingApp1 } from "@tests/TestingApps";
import { Schema } from "mongoose";
import { checkGroup, findGroupByUrl, GroupInterface } from ".";

describe("group tests", () => {
  describe("keep database", () => {
    const app: App = new TestingApp1();

    beforeAll(async () => {
      await app.run();
    } );

    afterAll(async () => {
      await app.kill();
    } );
    describe("mock", () => {
      it("group1", async () => {
        const video1 = await findVideoByUrl("sample1");

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
              id: <Schema.Types.ObjectId>video1._id,
              weight: 0,
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
