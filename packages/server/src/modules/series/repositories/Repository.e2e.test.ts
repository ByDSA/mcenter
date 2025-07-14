import { DomainMessageBroker } from "#modules/domain-message-broker";
import { Stream, StreamMode, StreamOriginType, assertIsStream } from "#modules/streams/models";
import { StreamsRepository } from "#modules/streams/repositories";
import { createTestingAppModuleAndInit, type TestingSetup } from "#tests/nestjs/app";
import { type SerieEntity, assertIsSerieEntity } from "../models";
import { SerieRepository } from "./Repository";

let repository: SerieRepository;
let streamRepository: StreamsRepository;
let testingSetup: TestingSetup;

describe("repository", () => {
  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      controllers: [],
      providers: [
        DomainMessageBroker,
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
    };

    describe("before Create", () => {
      beforeAll(async () => {
        await testingSetup.db!.drop();
      } );

      it("should not be in db", async () => {
        const got = await repository.getOneById(newModel.id);

        expect(got).toBeNull();
      } );

      it("should not be stream in db", async () => {
        const streamId = newModel.id;
        const got = await streamRepository.getOneById(streamId);

        expect(got).toBeNull();
      } );
    } );

    it("should execute function without errors", async () => {
      const got = await repository.createOneAndGet(newModel);

      assertIsSerieEntity(got);

      expect(got).toStrictEqual(newModel);
    } );

    describe("after Create", () => {
      it("should be in db", async () => {
        const got = await repository.getOneById(newModel.id);

        assertIsSerieEntity(got);

        expect(got).toStrictEqual(newModel);
      } );

      it("should be stream in db", async () => {
        const streamExpected: Stream = {
          id: newModel.id,
          mode: StreamMode.SEQUENTIAL,
          group: {
            origins: [{
              type: StreamOriginType.SERIE,
              id: newModel.id,
            }],
          },
        };
        const got = await streamRepository.getOneById(streamExpected.id);

        assertIsStream(got);

        expect(got).toStrictEqual(streamExpected);
      } );
    } );
  } );
} );
