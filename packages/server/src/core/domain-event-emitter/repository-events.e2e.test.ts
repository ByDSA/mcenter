import { Episode, EpisodeCompKey, EpisodeEntity } from "#episodes/models";
import { EpisodesModule } from "#episodes/module";
import { EpisodesRepository } from "#episodes/crud/repository";
import { EpisodeEvents } from "#episodes/crud/repository/events";
import { fixtureEpisodes } from "#episodes/tests";
import { loadFixtureSimpsons } from "#core/db/tests/fixtures/sets";
import { EntityEvent } from "#core/domain-event-emitter";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { DomainEventEmitter } from "#core/domain-event-emitter";

let episodesRepo: EpisodesRepository;
let domainEventEmitter: DomainEventEmitter;
let testingSetup: TestingSetup;

beforeAll(async () => {
  testingSetup = await createTestingAppModuleAndInit( {
    imports: [DomainEventEmitterModule, EpisodesModule],
    controllers: [],
    providers: [
    ],
  }, {
    db: {
      using: "default",
    },
  } );
  await loadFixtureSimpsons();

  domainEventEmitter = testingSetup.module
    .get<DomainEventEmitter>(DomainEventEmitter);

  episodesRepo = testingSetup.module
    .get<EpisodesRepository>(EpisodesRepository);
} );

it("should emit Patch Event", async () => {
  const episodeCompKey: EpisodeCompKey = {
    seriesKey: "simpsons",
    episodeKey: "1x01",
  };
  const fn = jest.fn();

  domainEventEmitter.subscribe(EpisodeEvents.Patched.TYPE, fn);

  const partialModel: Partial<Episode> = {
    title: "new title",
  };

  await episodesRepo.patchOneByCompKeyAndGet(episodeCompKey, {
    entity: partialModel,
  } );

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith( {
    type: EpisodeEvents.Patched.TYPE,
    payload: {
      entityId: fixtureEpisodes.Simpsons.Samples.EP1x01.id,
      key: "title",
      value: partialModel.title,
    },
  } );
} );

it("should emit Create Event", async () => {
  const fn = jest.fn((event: EntityEvent<EpisodeEntity>) => {
    expect(event.type).toBe(EpisodeEvents.Created.TYPE);
    expect(event.payload.entity.compKey?.seriesKey).toBe("simpsons");
    expect(event.payload.entity.compKey?.episodeKey.startsWith("X")).toBeTruthy();

    return Promise.resolve();
  } );

  domainEventEmitter.subscribe(EpisodeEvents.Created.TYPE, fn);

  const models = fixtureEpisodes.Simpsons.List.slice(0, 10).map(episode => ( {
    ...episode,
    compKey: {
      episodeKey: `X${episode.compKey?.episodeKey}`,
      seriesKey: episode.compKey?.seriesKey,
    } as EpisodeCompKey,
  } ) as EpisodeEntity);

  await testingSetup.db?.drop();
  await episodesRepo.createManyAndGet(models);

  expect(fn).toHaveBeenCalledTimes(models.length);
} );
