import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { assertIsDefined } from "$shared/utils/validation";
import { type SerieEntity, serieEntitySchema } from "../../models";
import { SeriesRepository } from "./repository";
import { StreamsRepository } from "#modules/streams/crud/repository";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { UsersRepository } from "#core/auth/users/crud/repository";
import { loadFixtureAuthUsers } from "#core/db/tests/fixtures/sets/auth-users";
import { loadFixtureSimpsons } from "#core/db/tests/fixtures/sets";

let repo: SeriesRepository;
let streamsRepo: StreamsRepository;
let testingSetup: TestingSetup;

describe("repository", () => {
  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [DomainEventEmitterModule],
      controllers: [],
      providers: [
        SeriesRepository,
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
    const newModel: SerieEntity = {
      id: "serieId",
      name: "title",
      key: "key",
      imageCoverId: null,
    };

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
      let createdGot: SerieEntity;

      beforeAll(async () => {
        createdGot = await repo.createOneAndGet(newModel);

        serieEntitySchema.parse(createdGot);

        newModel.id = createdGot.id;
      } );

      it("ok", () => {
        expect(createdGot).toStrictEqual(newModel);
      } );

      it("should be in db", async () => {
        const got = await repo.getOneByKey(newModel.key);

        assertIsDefined(got);

        newModel.id = got.id;

        expect(got).toStrictEqual(newModel);
      } );

      it("should not stream created", async () => {
        const userId = fixtureUsers.Normal.User.id;
        const got = await streamsRepo.getOneByKey(userId, newModel.key);

        expect(got).toBeNull();
      } );
    } );
  } );
} );
