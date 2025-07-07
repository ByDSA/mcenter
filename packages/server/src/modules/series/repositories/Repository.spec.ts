import { DomainMessageBroker } from "#modules/domain-message-broker";
import { Stream, StreamMode, StreamOriginType, assertIsStream } from "#modules/streams/models";
import { StreamRepository } from "#modules/streams/repositories";
import { TestMongoDatabase } from "#tests/main";
import { TestDatabase } from "#tests/main/db/TestDatabase";
import { createTestingAppModuleAndInit, TestingSetup } from "#tests/nestjs/app";
import { Serie, assertIsSerie } from "../models";
import { SerieRepository } from "./Repository";

let db: TestDatabase;
let repository: SerieRepository;
let streamRepository: StreamRepository;
let testingSetup: TestingSetup;

describe("repository", () => {
  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      controllers: [],
      providers: [
        DomainMessageBroker,
        SerieRepository,
        StreamRepository,
      ],
    } );

    repository = testingSetup.module
      .get<SerieRepository>(SerieRepository);
    streamRepository = testingSetup.module
      .get<StreamRepository>(StreamRepository);

    db = new TestMongoDatabase();

    db.init();
    await db.connect();
  } );

  afterAll(async () => {
    await db.disconnect();
  } );

  describe("create", () => {
    const newModel: Serie = {
      id: "serieId",
      name: "title",
    };

    describe("before Create", () => {
      beforeAll(async () => {
        await db.drop();
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

      assertIsSerie(got);

      expect(got).toStrictEqual(newModel);
    } );

    describe("after Create", () => {
      it("should be in db", async () => {
        const got = await repository.getOneById(newModel.id);

        assertIsSerie(got);

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
