import { assertZod } from "$shared/utils/validation/zod";
import { StreamEntity, streamEntitySchema, StreamMode, StreamOriginType } from "#modules/streams/models";
import { StreamsRepository } from "#modules/streams/rest/repository";
import { type SerieEntity, assertIsSerieEntity } from "../../models";
import { SerieRepository } from "./repository";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";

let repository: SerieRepository;
let streamRepository: StreamsRepository;
let testingSetup: TestingSetup;

describe("repository", () => {
  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [DomainEventEmitterModule],
      controllers: [],
      providers: [
        SerieRepository,
        StreamsRepository,
      ],
    }, {
      db: {
        using: "default",
      },
    } );

    repository = testingSetup.module
      .get<SerieRepository>(SerieRepository);
    streamRepository = testingSetup.module
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
        await testingSetup.db!.drop();
      } );

      it("should not be in db", async () => {
        const got = await repository.getOneByKey(newModel.key);

        expect(got).toBeNull();
      } );

      it("should not be stream in db", async () => {
        const streamId = newModel.key;
        const got = await streamRepository.getOneByKey(streamId);

        expect(got).toBeNull();
      } );
    } );

    it("should execute function without errors", async () => {
      const got = await repository.createOneAndGet(newModel);

      assertIsSerieEntity(got);

      newModel.id = got.id;

      expect(got).toStrictEqual(newModel);
    } );

    describe("after Create", () => {
      it("should be in db", async () => {
        const got = await repository.getOneByKey(newModel.key);

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
        const got = await streamRepository.getOneByKey(streamExpected.key);

        assertZod(streamEntitySchema, got);

        streamExpected.id = got.id;

        expect(got).toStrictEqual(streamExpected);
      } );
    } );
  } );
} );
