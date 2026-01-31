import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { assertIsDefined } from "$shared/utils/validation";
import { StreamsRepository } from "#episodes/streams/crud/repository";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { UsersRepository } from "#core/auth/users/crud/repository";
import { loadFixtureAuthUsers } from "#core/db/tests/fixtures/sets/auth-users";
import { loadFixtureSimpsons } from "#core/db/tests/fixtures/sets";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { type SeriesEntity, seriesEntitySchema } from "../../models";
import { CreateDto, SeriesRepository } from "./repository";
import { SeriesAvailableSlugGeneratorService } from "./available-slug-generator.service";

let repo: SeriesRepository;
let streamsRepo: StreamsRepository;
let testingSetup: TestingSetup;

describe("repository", () => {
  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
        EpisodesCrudModule,
        DomainEventEmitterModule,
      ],
      controllers: [],
      providers: [
        SeriesRepository,
        SeriesAvailableSlugGeneratorService,
        StreamsRepository,
        UsersRepository,
      ],
    }, {
      db: {
        using: "default",
      },
    } );

    await loadFixtureAuthUsers();

    await loadFixtureSimpsons();

    repo = testingSetup.module
      .get<SeriesRepository>(SeriesRepository);
    streamsRepo = testingSetup.module
      .get<StreamsRepository>(StreamsRepository);
  } );

  describe("create", () => {
    const newModel = {
      name: "title",
      key: "key",
      imageCoverId: null,
      releasedOn: "2000-01-01",
    } satisfies CreateDto;

    describe("before Create", () => {
      beforeAll(async () => {
        await testingSetup.db!.dropAll();
      } );

      it("should not be in db", async () => {
        const got = await repo.getOneByKey(newModel.key);

        expect(got).toBeNull();
      } );

      it("should not be stream in db", async () => {
        const streamId = newModel.key;
        const got = await streamsRepo.getOneByKey(
          fixtureUsers.Normal.User.id,
          streamId,
        );

        expect(got).toBeNull();
      } );
    } );

    describe("create", () => {
      let createdGot: SeriesEntity;

      beforeAll(async () => {
        createdGot = await repo.createOneAndGet(newModel);

        seriesEntitySchema.parse(createdGot);
      } );

      it("ok", () => {
        expect(createdGot).toMatchObject(newModel);
      } );

      it("should be in db", async () => {
        const got = await repo.getOneByKey(newModel.key);

        assertIsDefined(got);

        expect(got).toMatchObject(newModel);
      } );

      it("should not stream created", async () => {
        const userId = fixtureUsers.Normal.User.id;
        const got = await streamsRepo.getOneByKey(userId, newModel.key);

        expect(got).toBeNull();
      } );
    } );
  } );
} );
