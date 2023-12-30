import { DomainMessageBroker } from "#modules/domain-message-broker";
import { TestMongoDatabase } from "#tests/main";
import TestDatabase from "#tests/main/db/TestDatabase";
import { EPISODES_SIMPSONS } from "#tests/main/db/fixtures";
import { loadFixtureSimpsons } from "#tests/main/db/fixtures/sets";
import { EventType, ModelEvent, ModelMessage } from "#utils/event-sourcing";
import { Consumer } from "#utils/message-broker";
import { Model, ModelId } from "../models";
import Repository from "./Repository";
import { QUEUE_NAME } from "./events";

let db: TestDatabase;
let episodeRepository: Repository;
let domainMessageBroker: DomainMessageBroker<ModelMessage<Model>>;

beforeAll(async () => {
  db = new TestMongoDatabase();

  db.init();
  await db.connect();
  await db.drop();
  await loadFixtureSimpsons();

  domainMessageBroker = new DomainMessageBroker<ModelMessage<Model>>();

  episodeRepository = new Repository( {
    domainMessageBroker,
  } );
} );
it("should emit Patch Event", async () => {
  const episodeId: ModelId = {
    serieId: "simpsons",
    innerId: "1x01",
  };
  const fn = jest.fn();

  await domainMessageBroker.subscribe(QUEUE_NAME, fn);

  const partialModel: Partial<Model> = {
    title: "new title",
  };

  await episodeRepository.patchOneByIdAndGet(episodeId, partialModel);

  expect(fn).toBeCalledTimes(1);
  expect(fn).toBeCalledWith( {
    type: EventType.PATCHED,
    payload: {
      entityId: episodeId,
      key: "title",
      value: partialModel.title,
    },
  } );
} );
it("should emit Create Event", async () => {
  const fn = jest.fn((event: ModelEvent<Model>) => {
    expect(event.type).toBe(EventType.CREATED);
    expect(event.payload.entity.id.serieId).toBe("simpsons");
    expect(event.payload.entity.id.innerId.startsWith("X")).toBeTruthy();

    return Promise.resolve();
  } ) as Consumer<any>;

  await domainMessageBroker.subscribe(QUEUE_NAME, fn);

  const models = EPISODES_SIMPSONS.slice(0, 10).map(episode => ( {
    ...episode,
    id: {
      innerId: `X${episode.id.innerId}`,
      serieId: episode.id.serieId,
    } as ModelId,
  } ) as Model);

  await episodeRepository.createManyAndGet(models);

  expect(fn).toBeCalledTimes(models.length);
} );

afterAll(async () => {
  await db.disconnect();
} );