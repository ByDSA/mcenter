import { SERIES_SAMPLE_SERIES } from "$shared/models/episodes/series/tests/fixtures";
import { Episode, EpisodeEntity } from "#episodes/models";
import { EpisodesRepository } from "#episodes/crud/repositories/episodes";
import { EpisodeEvents } from "#episodes/crud/repositories/episodes/events";
import { fixtureEpisodes } from "#episodes/tests";
import { EntityEvent } from "#core/domain-event-emitter";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { loadFixtureSampleSeries } from "#core/db/tests/fixtures/sets/SampleSeries";

let episodesRepo: EpisodesRepository;
let domainEventEmitter: DomainEventEmitter;
let testingSetup: TestingSetup;

beforeAll(async () => {
  testingSetup = await createTestingAppModuleAndInit( {
    imports: [DomainEventEmitterModule, EpisodesCrudModule],
    controllers: [],
    providers: [
    ],
  }, {
    db: {
      using: "default",
    },
  } );
  await loadFixtureSampleSeries();

  domainEventEmitter = testingSetup.module.get(DomainEventEmitter);

  episodesRepo = testingSetup.module.get(EpisodesRepository);
} );

it("should emit Patch Event", async () => {
  const episodeId = fixtureEpisodes.SampleSeries.Samples.EP1x01.id;
  const fn = jest.fn();

  domainEventEmitter.subscribe(EpisodeEvents.Patched.TYPE, fn);

  const partialModel: Partial<Episode> = {
    title: "new title",
  };

  await episodesRepo.patchOneByIdAndGet(episodeId, {
    entity: partialModel,
  } );

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith( {
    type: EpisodeEvents.Patched.TYPE,
    payload: {
      hasOld: false,
      entityId: fixtureEpisodes.SampleSeries.Samples.EP1x01.id,
      key: "title",
      value: partialModel.title,
      partialEntity: partialModel,
    },
  } );
} );

it("should emit Create Event", async () => {
  const fn = jest.fn((event: EntityEvent<EpisodeEntity>) => {
    expect(event.type).toBe(EpisodeEvents.Created.TYPE);
    expect(event.payload.entity.seriesId).toBe(SERIES_SAMPLE_SERIES.id);
    expect(event.payload.entity.episodeKey.startsWith("X")).toBeTruthy();

    return Promise.resolve();
  } );

  domainEventEmitter.subscribe(EpisodeEvents.Created.TYPE, fn);

  const models = fixtureEpisodes.SampleSeries.List.slice(0, 10).map(episode => ( {
    ...episode,
    episodeKey: `X${episode.episodeKey}`,
    seriesId: SERIES_SAMPLE_SERIES.id,
  } ) as EpisodeEntity);

  await testingSetup.db?.dropAll();
  await episodesRepo.createManyAndGet(models);

  expect(fn).toHaveBeenCalledTimes(models.length);
} );
