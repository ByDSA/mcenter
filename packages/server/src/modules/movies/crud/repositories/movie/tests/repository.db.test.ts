import { MovieEntity } from "$shared/models/movies/movie";
import { fixtureMovies } from "$shared/models/movies/tests/fixtures";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { createMockedModule } from "#utils/nestjs/tests";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { loadFixtureAuthUsers } from "#core/db/tests/fixtures/sets/auth-users";
import { deleteFixtureSampleMovies, loadFixtureSampleMovies } from "#core/db/tests/fixtures/sets/SampleMovies";
import { MovieRepository } from "../repository";

const SAMPLE_MOVIE: MovieEntity = fixtureMovies.Samples.Inception;
const SAMPLE_MOVIE_2: MovieEntity = fixtureMovies.Samples.TheMatrix;
const UPLOADER_USER_ID = fixtureUsers.Normal.User.id;

describe("movieRepository (DB)", () => {
  let testingSetup: TestingSetup;
  let repo: MovieRepository;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        imports: [
          createMockedModule(DomainEventEmitterModule),
        ],
        controllers: [],
        providers: [
          MovieRepository,
        ],
      },
      {
        db: {
          using: "default",
        },
      },
    );

    await loadFixtureAuthUsers();

    await deleteFixtureSampleMovies();
    await loadFixtureSampleMovies();

    repo = testingSetup.module.get(MovieRepository);
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  describe("getOneById", () => {
    it("returns the entity when it exists", async () => {
      const created = await repo.createOneAndGet( {
        title: SAMPLE_MOVIE.title,
        slug: `${SAMPLE_MOVIE.slug}-get-one`,
        year: SAMPLE_MOVIE.year,
        genre: SAMPLE_MOVIE.genre,
        director: SAMPLE_MOVIE.director,
        synopsis: SAMPLE_MOVIE.synopsis,
        duration: SAMPLE_MOVIE.duration,
        imageCoverId: SAMPLE_MOVIE.imageCoverId,
        uploaderUserId: UPLOADER_USER_ID,
      } );
      const result = await repo.getOneById(created.id);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(created.id);
    } );

    it("returns null when not found", async () => {
      const result = await repo.getOneById("507f1f77bcf86cd799439999");

      expect(result).toBeNull();
    } );
  } );

  describe("getAll", () => {
    it("returns all movies", async () => {
      await repo.createOneAndGet( {
        title: SAMPLE_MOVIE.title,
        slug: `${SAMPLE_MOVIE.slug}-get-all`,
        year: SAMPLE_MOVIE.year,
        genre: SAMPLE_MOVIE.genre,
        director: SAMPLE_MOVIE.director,
        synopsis: SAMPLE_MOVIE.synopsis,
        duration: SAMPLE_MOVIE.duration,
        imageCoverId: SAMPLE_MOVIE.imageCoverId,
        uploaderUserId: UPLOADER_USER_ID,
      } );

      const result = await repo.getAll();

      expect(result.length).toBeGreaterThan(0);
    } );
  } );

  describe("getManyByCriteria", () => {
    it("returns movies matching filter", async () => {
      await repo.createOneAndGet( {
        title: SAMPLE_MOVIE.title,
        slug: `${SAMPLE_MOVIE.slug}-criteria-title`,
        year: SAMPLE_MOVIE.year,
        genre: SAMPLE_MOVIE.genre,
        director: SAMPLE_MOVIE.director,
        synopsis: SAMPLE_MOVIE.synopsis,
        duration: SAMPLE_MOVIE.duration,
        imageCoverId: SAMPLE_MOVIE.imageCoverId,
        uploaderUserId: UPLOADER_USER_ID,
      } );

      const result = await repo.getManyByCriteria( {
        filter: {
          title: "Inception",
        },
      } );

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].title).toContain("Inception");
    } );

    it("returns empty array when no match", async () => {
      const result = await repo.getManyByCriteria( {
        filter: {
          title: "NonExistentMovie",
        },
      } );

      expect(result).toHaveLength(0);
    } );

    it("filter by genre", async () => {
      await repo.createOneAndGet( {
        title: SAMPLE_MOVIE.title,
        slug: `${SAMPLE_MOVIE.slug}-criteria-genre`,
        year: SAMPLE_MOVIE.year,
        genre: ["Drama"],
        director: SAMPLE_MOVIE.director,
        synopsis: SAMPLE_MOVIE.synopsis,
        duration: SAMPLE_MOVIE.duration,
        imageCoverId: SAMPLE_MOVIE.imageCoverId,
        uploaderUserId: UPLOADER_USER_ID,
      } );

      const result = await repo.getManyByCriteria( {
        filter: {
          genre: "Drama",
        },
      } );

      expect(result.length).toBeGreaterThan(0);
    } );

    it("filter by year", async () => {
      const result = await repo.getManyByCriteria( {
        filter: {
          year: 2010,
        },
      } );

      expect(result.length).toBeGreaterThanOrEqual(1);
    } );

    it("filter by slug", async () => {
      const created = await repo.createOneAndGet( {
        title: SAMPLE_MOVIE_2.title,
        slug: "new-slug",
        year: SAMPLE_MOVIE_2.year,
        genre: SAMPLE_MOVIE_2.genre,
        director: SAMPLE_MOVIE_2.director,
        synopsis: SAMPLE_MOVIE_2.synopsis,
        duration: SAMPLE_MOVIE_2.duration,
        imageCoverId: SAMPLE_MOVIE_2.imageCoverId,
        uploaderUserId: UPLOADER_USER_ID,
      } );
      const result = await repo.getManyByCriteria( {
        filter: {
          slug: created.slug,
        },
      } );

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe(created.slug);
    } );
  } );

  describe("createOneAndGet", () => {
    it("persists and returns the new entity", async () => {
      const dto = {
        title: "New Movie",
        slug: "new-movie-test",
        year: 2024,
        genre: ["Drama"],
        director: "Test Director",
        synopsis: "A test movie",
        duration: 120,
        imageCoverId: SAMPLE_MOVIE.imageCoverId,
        uploaderUserId: UPLOADER_USER_ID,
      };
      const result = await repo.createOneAndGet(dto);

      expect(result.id).toBeDefined();
      expect(result.title).toBe(dto.title);
      expect(result.uploaderUserId).toBe(UPLOADER_USER_ID);
      expect(result.addedAt).toBeDefined();
    } );
  } );

  describe("patchOneByIdAndGet", () => {
    it("updates fields and returns updated entity", async () => {
      const created = await repo.createOneAndGet( {
        title: "Original Title",
        slug: "original-title-patch",
        year: 2000,
        genre: ["Drama"],
        imageCoverId: SAMPLE_MOVIE.imageCoverId,
        uploaderUserId: UPLOADER_USER_ID,
      } );
      const result = await repo.patchOneByIdAndGet(created.id, {
        entity: {
          title: "Updated Title",
        },
      } );

      expect(result.title).toBe("Updated Title");
    } );

    it("emits Patched domain event", async () => {
      const emitter = testingSetup.getMock(DomainEventEmitter);
      const created = await repo.createOneAndGet( {
        title: "Patch Event Test",
        slug: "patch-event-test",
        year: 2024,
        genre: ["Action"],
        imageCoverId: SAMPLE_MOVIE.imageCoverId,
        uploaderUserId: UPLOADER_USER_ID,
      } );

      await repo.patchOneByIdAndGet(created.id, {
        entity: {
          title: "Patched",
        },
      } );

      expect(emitter.emitPatch).toHaveBeenCalled();
    } );

    it("throws when entity does not exist", async () => {
      await expect(
        repo.patchOneByIdAndGet("507f1f77bcf86cd799439999", {
          entity: {
            title: "X",
          },
        } ),
      ).rejects.toThrow();
    } );
  } );

  describe("deleteOneByIdAndGet", () => {
    it("removes the document and returns the deleted entity", async () => {
      const created = await repo.createOneAndGet( {
        title: "To Delete",
        slug: "to-delete",
        year: 2024,
        genre: ["Drama"],
        imageCoverId: SAMPLE_MOVIE.imageCoverId,
        uploaderUserId: UPLOADER_USER_ID,
      } );
      const result = await repo.deleteOneByIdAndGet(created.id);

      expect(result.id).toBe(created.id);

      const recheck = await repo.getOneById(created.id);

      expect(recheck).toBeNull();
    } );

    it("throws when entity does not exist", async () => {
      await expect(
        repo.deleteOneByIdAndGet("507f1f77bcf86cd799439999"),
      ).rejects.toThrow();
    } );
  } );
} );
