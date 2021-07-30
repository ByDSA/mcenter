import App, { loadEnv } from "@app/app";
import { TestingApp1 } from "@tests/TestingApps";
import { Schema } from "mongoose";
import { checkSerie, createSerieFromPath, findAllSeries, findSerieByName, findSerieByPath, findSerieByUrl, getEpisodeByUrl, getEpisodeFullPath, getFoldersInSerie, getFullPathSerie, Serie, SerieInterface } from ".";

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
      const actual = await findSerieByUrl("serie-1");
      const expected: SerieInterface = {
        path: "serie 1",
        name: "serie 1",
        url: "serie-1",
        episodes: [{
          _id: actual?.episodes[0]._id,
          name: "1",
          path: "0/1.mp4",
          url: "0x01",
          hash: "",
        }, {
          _id: actual?.episodes[1]._id,
          name: "1",
          path: "1/1.mp4",
          url: "1x01",
          hash: "",
        }],
      };

      checkSerie(actual, expected);
    } );

    it("getFullPathSerie", async () => {
      loadEnv();
      const expected = `${process.env.SERIES_PATH}/serie 1`;
      const serie = await findSerieByUrl("serie-1");

      if (!serie)
        throw new Error();

      const actual = getFullPathSerie(serie.path);

      expect(actual).toBe(expected);
    } );

    it("getFullPathEpisode", async () => {
      loadEnv();
      const expected = `${process.env.SERIES_PATH}/serie 1/0/1.mp4`;
      const serie = await findSerieByUrl("serie-1");

      if (!serie)
        throw new Error();

      const episode = getEpisodeByUrl( {
        serie,
        url: "0x01",
      } );

      if (!episode)
        throw new Error();

      const actual = getEpisodeFullPath( {
        episode,
        serie,
      } );

      expect(actual).toBe(expected);
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
        describe("found", () => {
          let actual: Serie | null = null;

          beforeAll(async () => {
            actual = await createSerieFromPath("serie 2");
          } );

          it("not null", () => {
            expect(actual).not.toBeNull();
          } );

          it("correct data", async () => {
            const id = actual?.episodes[0]._id ?? new Schema.Types.ObjectId("0");
            const expected: SerieInterface = {
              name: "serie 2",
              path: "serie 2",
              url: "serie-2",
              episodes: [
                {
                  _id: id,
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
        } );

        it("not found", async () => {
          const actual = await createSerieFromPath("serie2");

          expect(actual).toBeNull();
        } );
      } );
    } );
  } );
} );
