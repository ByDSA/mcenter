import { Episode, EpisodeCompKey, EpisodeEntity } from "#episodes/models";
import { fixtureEpisodes } from "#tests/main/db/fixtures/models";
import { loadFixtureSimpsons } from "#tests/main/db/fixtures/sets";
import { EventType, ModelEvent, ModelMessage } from "#utils/event-sourcing";
import { Consumer } from "#utils/message-broker";
import { createTestingAppModuleAndInit, TestingSetup } from "#tests/nestjs/app";
import { DomainMessageBrokerModule } from "#modules/domain-message-broker/module";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { EpisodesModule } from "#episodes/module";
import { EpisodesRepository } from "../repositories";
import { EPISODE_QUEUE_NAME } from "./events";

let episodeRepository: EpisodesRepository;
let domainMessageBroker: DomainMessageBroker<ModelMessage<EpisodeEntity>>;
let testingSetup: TestingSetup;

beforeAll(async () => {
  testingSetup = await createTestingAppModuleAndInit( {
    imports: [DomainMessageBrokerModule, EpisodesModule],
    controllers: [],
    providers: [
    ],
  }, {
    db: {
      using: "default",
    },
  } );
  await loadFixtureSimpsons();

  domainMessageBroker = testingSetup.module
    .get<DomainMessageBroker<ModelMessage<EpisodeEntity>>>(
      DomainMessageBroker<ModelMessage<EpisodeEntity>>,
    );

  episodeRepository = testingSetup.module
    .get<EpisodesRepository>(EpisodesRepository);
} );

it("should emit Patch Event", async () => {
  const episodeCompKey: EpisodeCompKey = {
    seriesKey: "simpsons",
    episodeKey: "1x01",
  };
  const fn = jest.fn();

  await domainMessageBroker.subscribe(EPISODE_QUEUE_NAME, fn);

  const partialModel: Partial<Episode> = {
    title: "new title",
  };

  await episodeRepository.patchOneByCompKeyAndGet(episodeCompKey, {
    entity: partialModel,
  } );

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith( {
    type: EventType.PATCHED,
    payload: {
      entityId: fixtureEpisodes.Simpsons.Samples.EP1x01.id,
      key: "title",
      value: partialModel.title,
    },
  } );
} );

it("should emit Create Event", async () => {
  const fn = jest.fn((event: ModelEvent<EpisodeEntity>) => {
    expect(event.type).toBe(EventType.CREATED);
    expect(event.payload.entity.compKey?.seriesKey).toBe("simpsons");
    expect(event.payload.entity.compKey?.episodeKey.startsWith("X")).toBeTruthy();

    return Promise.resolve();
  } ) as Consumer<any>;

  await domainMessageBroker.subscribe(EPISODE_QUEUE_NAME, fn);

  const models = fixtureEpisodes.Simpsons.List.slice(0, 10).map(episode => ( {
    ...episode,
    compKey: {
      episodeKey: `X${episode.compKey?.episodeKey}`,
      seriesKey: episode.compKey?.seriesKey,
    } as EpisodeCompKey,
  } ) as EpisodeEntity);

  await testingSetup.db?.drop();
  await episodeRepository.createManyAndGet(models);

  expect(fn).toHaveBeenCalledTimes(models.length);
} );
