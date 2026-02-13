import { assertIsDefined } from "$shared/utils/validation";
import { SERIES_SAMPLE_SERIES } from "$shared/models/episodes/series/tests/fixtures";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { loadFixtureAuthUsers } from "#core/db/tests/fixtures/sets/auth-users";
import { loadFixtureSampleSeries } from "#core/db/tests/fixtures/sets/SampleSeries";
import { fixtureEpisodes } from "#episodes/tests";
import { type SeriesEntity, seriesEntitySchema } from "../../models";
import { CreateDto, SeriesRepository } from "./repository";

describe("repository", () => {
  let repo: SeriesRepository;
  let testingSetup: TestingSetup;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
        DomainEventEmitterModule,
      ],
      controllers: [],
      providers: [
        SeriesRepository,
      ],
    }, {
      db: {
        using: "default",
      },
    } );

    await loadFixtureAuthUsers();

    await loadFixtureSampleSeries();

    repo = testingSetup.app.get(SeriesRepository);
  } );

  describe("create", () => {
    const newModel = {
      name: "title",
      key: "key",
      imageCoverId: null,
      releasedOn: "2000-01-01",
    } satisfies CreateDto;

    describe("before Create", () => {
      it("should not be in db", async () => {
        const got = await repo.getOneByKey(newModel.key);

        expect(got).toBeNull();
      } );
    } );

    describe("create", () => {
      let createdGot: SeriesEntity;

      beforeAll(async () => {
        createdGot = await repo.createOneAndGet(newModel);

        seriesEntitySchema.parse(createdGot);
      } );

      it("ok", () => {
        expect(createdGot).toMatchObject(newModel);
      } );

      it("should be in db", async () => {
        const got = await repo.getOneByKey(newModel.key);

        assertIsDefined(got);

        expect(got).toMatchObject(newModel);
      } );
    } );
  } );

  describe("getMany", ()=> {
    it("get all", async () => {
      const criteria = {
        requestUserId: null,
      } satisfies Parameters<typeof repo.getMany>[0];
      const ret = await repo.getMany(criteria);

      expect(ret.data.length).toBeGreaterThan(0);
    } );

    it("count episodes and seasons", async () => {
      const criteria = {
        requestUserId: null,
        filter: {
          id: SERIES_SAMPLE_SERIES.id,
        },
        expand: ["countEpisodes", "countSeasons"],
      } satisfies Parameters<typeof repo.getMany>[0];
      const ret = await repo.getMany(criteria);

      expect(ret.data[0].metadata?.countEpisodes).toBe(fixtureEpisodes.SampleSeries.List.length);
      expect(ret.data[0].metadata?.countSeasons).toBe(2);
    } );
  } );
} );
