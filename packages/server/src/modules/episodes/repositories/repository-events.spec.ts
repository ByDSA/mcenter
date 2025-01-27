import { container } from "tsyringe";
import { EpisodeRepository } from "..";
import { EPISODE_QUEUE_NAME } from "./events";
import { Episode, EpisodeId } from "#episodes/models";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { TestMongoDatabase } from "#tests/main";
import { TestDatabase } from "#tests/main/db/TestDatabase";
import { EPISODES_SIMPSONS } from "#tests/main/db/fixtures/models";
import { loadFixtureSimpsons } from "#tests/main/db/fixtures/sets";
import { EventType, ModelEvent, ModelMessage } from "#utils/event-sourcing";
import { Consumer } from "#utils/message-broker";

let db: TestDatabase;
let episodeRepository: EpisodeRepository;
let domainMessageBroker: DomainMessageBroker<ModelMessage<Episode>>;

beforeAll(async () => {
  db = new TestMongoDatabase();

  db.init();
  await db.connect();
  await db.drop();
  await loadFixtureSimpsons();

  container.registerInstance(DomainMessageBroker, new DomainMessageBroker<ModelMessage<Episode>>());
  container.registerSingleton(EpisodeRepository);

  domainMessageBroker = container.resolve(DomainMessageBroker<ModelMessage<Episode>>);
  episodeRepository = container.resolve(EpisodeRepository);
} );

it("should emit Patch Event", async () => {
  const episodeId: EpisodeId = {
    serieId: "simpsons",
    innerId: "1x01",
  };
  const fn = jest.fn();

  await domainMessageBroker.subscribe(EPISODE_QUEUE_NAME, fn);

  const partialModel: Partial<Episode> = {
    title: "new title",
  };

  await episodeRepository.patchOneByIdAndGet(episodeId, partialModel);

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith( {
    type: EventType.PATCHED,
    payload: {
      entityId: episodeId,
      key: "title",
      value: partialModel.title,
    },
  } );
} );

it("should emit Create Event", async () => {
  const fn = jest.fn((event: ModelEvent<Episode>) => {
    expect(event.type).toBe(EventType.CREATED);
    expect(event.payload.entity.id.serieId).toBe("simpsons");
    expect(event.payload.entity.id.innerId.startsWith("X")).toBeTruthy();

    return Promise.resolve();
  } ) as Consumer<any>;

  await domainMessageBroker.subscribe(EPISODE_QUEUE_NAME, fn);

  const models = EPISODES_SIMPSONS.slice(0, 10).map(episode => ( {
    ...episode,
    id: {
      innerId: `X${episode.id.innerId}`,
      serieId: episode.id.serieId,
    } as EpisodeId,
  } ) as Episode);

  await episodeRepository.createManyAndGet(models);

  expect(fn).toHaveBeenCalledTimes(models.length);
} );

afterAll(async () => {
  await db.disconnect();
} );
