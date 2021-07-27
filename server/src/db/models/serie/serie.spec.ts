import { checkSerie, createSerieFromPath, findAllSeries, findSerieByName, findSerieByPath, findSerieByUrl, getFoldersInSerie, SerieInterface } from ".";
import { TestingApp1 } from "../../../../tests/TestingApps";
import App from "../../../app";

describe("all tests", () => {
  describe("no modify db", () => {
    const app: App = new TestingApp1();

    beforeAll(async () => {
      await app.run();
    } );

    afterAll(async () => {
      await app.kill();
    } );

    it("mock", async () => {
      const expected = {
        path: "serie 1",
        name: "serie 1",
        url: "serie-1",
        episodes: [{
          name: "1",
          path: "0/1.mp4",
          url: "0x01",
          hash: "",
        }, {
          name: "1",
          path: "1/1.mp4",
          url: "1x01",
          hash: "",
        }],
      };
      const actual = await findSerieByUrl("serie-1");

      checkSerie(actual, expected);
    } );

    describe("find", () => {
      describe("ByUrl", () => {
        it("found", async () => {
          const actual = await findSerieByUrl("serie-1");

          expect(actual).not.toBeNull();
        } );

        it("not found", async () => {
          const actual = await findSerieByUrl("serieNotAdded");

          expect(actual).toBeNull();
        } );
      } );

      describe("ByPath", () => {
        it("found", async () => {
          const actual = await findSerieByPath("serie 1");

          expect(actual).not.toBeNull();
        } );

        it("not found", async () => {
          const actual = await findSerieByPath("serie1");

          expect(actual).toBeNull();
        } );
      } );
      describe("ByName", () => {
        it("found", async () => {
          const actual = await findSerieByName("serie 1");

          expect(actual).not.toBeNull();
        } );

        it("not found", async () => {
          const actual = await findSerieByName("serie1");

          expect(actual).toBeNull();
        } );
      } );

      describe("All", () => {
        it("found", async () => {
          const actual = await findAllSeries();
          const actualNames = actual.map((s) => s.name);
          const expectedNames = ["serie 1",
          ];

          expect(actualNames.sort()).toEqual(expectedNames.sort());
        } );
      } );
    } );

    describe("files", () => {
      it("getFoldersIn", () => {
        const expected = ["1"];
        const actual = getFoldersInSerie("serie 2");

        expect(actual).toEqual(expected);
      } );
    } );
  } );

  describe("modify db", () => {
    const app: App = new TestingApp1();

    beforeEach(async () => {
      await app.run();
    } );

    afterEach(async () => {
      await app.kill();
    } );
    describe("create", () => {
      describe("fromPath", () => {
        it("found folder", async () => {
          const actual = await createSerieFromPath("serie 2");

          expect(actual).not.toBeNull();
        } );

        it("correct data", async () => {
          const actual = await createSerieFromPath("serie 2");
          const expected: SerieInterface = {
            name: "serie 2",
            path: "serie 2",
            url: "serie-2",
            episodes: [
              {
                path: "1/1.mp4",
                url: "1x01",
                name: "1",
                hash: "5e70b96ad27dc8581424be7069ee9de8da9388b716e6fe213d88385f19baf80a",
              },
            ],
          };

          await actual?.save();

          checkSerie(actual, expected);
        } );

        it("not found", async () => {
          const actual = await createSerieFromPath("serie2");

          expect(actual).toBeNull();
        } );
      } );
    } );
  } );
} );
