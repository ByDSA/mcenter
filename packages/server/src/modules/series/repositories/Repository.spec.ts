import { DomainMessageBroker } from "#modules/domain-message-broker";
import { OriginType, Stream, StreamMode, StreamRepository, assertIsStream } from "#modules/streams";
import { TestMongoDatabase, registerSingletonIfNotAndGet } from "#tests/main";
import TestDatabase from "#tests/main/db/TestDatabase";
import { Model, assertIsModel } from "../models";
import Repository from "./Repository";

let db: TestDatabase;
let repository: Repository;
let streamRepository: StreamRepository;

describe("Repository", () => {
  beforeAll(async () => {
    db = new TestMongoDatabase();

    db.init();
    await db.connect();
    registerSingletonIfNotAndGet(DomainMessageBroker);
    repository = registerSingletonIfNotAndGet(Repository);
    streamRepository = registerSingletonIfNotAndGet(StreamRepository);
  } );

  afterAll(async () => {
    await db.disconnect();
  } );

  describe("Create", () => {
    const newModel: Model = {
      id: "serieId",
      name: "title",
    };

    describe("Before Create", () => {
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

      assertIsModel(got);

      expect(got).toStrictEqual(newModel);
    } );

    describe("After Create", () => {
      it("should be in db", async () => {
        const got = await repository.getOneById(newModel.id);

        assertIsModel(got);
        expect(got).toStrictEqual(newModel);
      } );

      it("should be stream in db", async () => {
        const streamExpected: Stream = {
          id: newModel.id,
          mode: StreamMode.SEQUENTIAL,
          group: {
            origins: [{
              type: OriginType.SERIE,
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