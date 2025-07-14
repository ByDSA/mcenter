import { Episode, EpisodeEntity, EpisodeId } from "#episodes/models";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { EPISODES_SIMPSONS } from "#tests/main/db/fixtures/models";
import { loadFixtureSimpsons } from "#tests/main/db/fixtures/sets";
import { EventType, ModelEvent, ModelMessage } from "#utils/event-sourcing";
import { Consumer } from "#utils/message-broker";
import { createTestingAppModuleAndInit, TestingSetup } from "#tests/nestjs/app";
import { EpisodeFileInfoRepository } from "#modules/file-info/repositories";
import { EpisodeRepository } from "..";
import { EPISODE_QUEUE_NAME } from "./events";

let episodeRepository: EpisodeRepository;
let domainMessageBroker: DomainMessageBroker<ModelMessage<Episode>>;
let testingSetup: TestingSetup;

beforeAll(async () => {
  testingSetup = await createTestingAppModuleAndInit( {
    controllers: [],
    providers: [
      DomainMessageBroker<ModelMessage<Episode>>,
      EpisodeRepository,
      EpisodeFileInfoRepository,
    ],
  }, {
    db: {
      using: "default",
    },
  } );
  await loadFixtureSimpsons();

  domainMessageBroker = testingSetup.module
    .get<DomainMessageBroker<ModelMessage<Episode>>>(DomainMessageBroker<ModelMessage<Episode>>);

  episodeRepository = testingSetup.module
    .get<EpisodeRepository>(EpisodeRepository);
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

  await episodeRepository.patchOneByIdAndGet(episodeId, {
    entity: partialModel,
  } );

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
  const fn = jest.fn((event: ModelEvent<EpisodeEntity>) => {
    expect(event.type).toBe(EventType.CREATED);
    expect(event.payload.entity.id?.serieId).toBe("simpsons");
    expect(event.payload.entity.id?.innerId.startsWith("X")).toBeTruthy();

    return Promise.resolve();
  } ) as Consumer<any>;

  await domainMessageBroker.subscribe(EPISODE_QUEUE_NAME, fn);

  const models = EPISODES_SIMPSONS.slice(0, 10).map(episode => ( {
    ...episode,
    id: {
      innerId: `X${episode.id?.innerId}`,
      serieId: episode.id?.serieId,
    } as EpisodeId,
  } ) as EpisodeEntity);

  await episodeRepository.createManyAndGet(models);

  expect(fn).toHaveBeenCalledTimes(models.length);
} );
