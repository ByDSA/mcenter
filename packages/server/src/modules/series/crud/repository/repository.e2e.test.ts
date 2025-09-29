import { assertZod } from "$shared/utils/validation/zod";
import { StreamEntity, streamEntitySchema, StreamMode, StreamOriginType } from "#modules/streams/models";
import { StreamsRepository } from "#modules/streams/crud/repository";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { type SerieEntity, assertIsSerieEntity } from "../../models";
import { SeriesRepository } from "./repository";

let repo: SeriesRepository;
let streamsRepo: StreamsRepository;
let testingSetup: TestingSetup;

describe("repository", () => {
  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [DomainEventEmitterModule],
      controllers: [],
      providers: [
        SeriesRepository,
        StreamsRepository,
      ],
    }, {
      db: {
        using: "default",
      },
    } );

    repo = testingSetup.module
      .get<SeriesRepository>(SeriesRepository);
    streamsRepo = testingSetup.module
      .get<StreamsRepository>(StreamsRepository);
  } );

  describe("create", () => {
    const newModel: SerieEntity = {
      id: "serieId",
      name: "title",
      key: "key",
    };

    describe("before Create", () => {
      beforeAll(async () => {
        await testingSetup.db!.dropAll();
      } );

      it("should not be in db", async () => {
        const got = await repo.getOneByKey(newModel.key);

        expect(got).toBeNull();
      } );

      it("should not be stream in db", async () => {
        const streamId = newModel.key;
        const got = await streamsRepo.getOneByKey(streamId);

        expect(got).toBeNull();
      } );
    } );

    it("should execute function without errors", async () => {
      const got = await repo.createOneAndGet(newModel);

      assertIsSerieEntity(got);

      newModel.id = got.id;

      expect(got).toStrictEqual(newModel);
    } );

    describe("after Create", () => {
      it("should be in db", async () => {
        const got = await repo.getOneByKey(newModel.key);

        assertIsSerieEntity(got);

        newModel.id = got.id;

        expect(got).toStrictEqual(newModel);
      } );

      it("should be stream in db", async () => {
        const streamExpected: StreamEntity = {
          id: "id",
          key: newModel.key,
          mode: StreamMode.SEQUENTIAL,
          group: {
            origins: [{
              type: StreamOriginType.SERIE,
              id: newModel.key,
            }],
          },
        };
        const got = await streamsRepo.getOneByKey(streamExpected.key);

        assertZod(streamEntitySchema, got);

        streamExpected.id = got.id;

        expect(got).toStrictEqual(streamExpected);
      } );
    } );
  } );
} );
