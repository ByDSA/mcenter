/**
 * PROTOTIPO: repository.db.test.ts
 *
 * Sustitutos que el agente debe reemplazar:
 *   - MyRepository        → la clase real del repositorio
 *   - fixtureXxx          → las constantes de fixture del dominio
 *   - loadFixtureXxx      → los loaders de fixture que apliquen
 *   - ExternalDependency  → cada dependencia inyectada que no sea DomainEventEmitter
 *
 * Los bloques describe marcados con "AGENT: incluir sólo si…" son opcionales.
 * Elimina los que no apliquen al repositorio en cuestión.
 */

import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { createMockedModule } from "#utils/nestjs/tests";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { DomainEventEmitter } from "#core/domain-event-emitter";
// AGENT: importa los loadFixture* necesarios desde #core/db/tests/fixtures/sets/*
// AGENT: importa las constantes de fixture del dominio (fixtureXxx)
// AGENT: importa ExternalDependency si el repo inyecta dependencias externas
import { MyRepository } from "./repository";

// ── Suite ──────────────────────────────────────────────────────────────────────

describe("myRepository (DB)", () => {
  let testingSetup: TestingSetup;
  let repo: MyRepository;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        imports: [
          createMockedModule(DomainEventEmitterModule),
          // AGENT: añade createMockedModule(OtherModule) si el repo depende de otros módulos NestJS
        ],
        controllers: [],
        providers: [
          // AGENT: añade getOrCreateMockProvider(ExternalDependency) por cada dependencia externa
          MyRepository,
        ],
      },
      {
        db: { using: "default" },
        // AGENT: usa "memory" si el entorno no tiene MongoDB local (ej. CI puro)
      },
    );

    // AGENT: configura aquí los mockImplementation de dependencias externas:
    // const depMock = testingSetup.getMock(ExternalDependency);
    // depMock.someMethod.mockImplementation(async (...) => someFixtureValue);

    // AGENT: carga los fixtures necesarios. El orden importa si hay foreign keys.
    // await loadFixtureAuthUsers();
    // await loadFixtureXxx();

    repo = testingSetup.module.get(MyRepository);
    // AGENT: usa testingSetup.app.get() sólo si el provider es request-scoped
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // AGENT: si algún test muta datos y los siguientes necesitan estado limpio,
    // recarga el fixture aquí (sólo si es necesario, es costoso):
    // await loadFixtureXxx();
  });

  // ── AGENT: incluir sólo si el repo tiene getMany / getManyByCriteria ──────────

  describe("getMany", () => {
    it("returns all entities without filters", async () => {
      const props = [{}] satisfies Parameters<typeof repo.getMany>;
      const ret = await repo.getMany(...props);

      expect(ret.data).toHaveLength(fixtureXxx.List.length);
    });

    // AGENT: añade un it por cada filtro relevante del repo

    it("filter: <campo>", async () => {
      const props = [{
        filter: {
          someId: fixtureXxx.Samples.SomeItem.id,
        },
      }] satisfies Parameters<typeof repo.getMany>;
      const ret = await repo.getMany(...props);

      expect(ret.data).toHaveLength(1);
    });

    it("returns empty array when no match", async () => {
      const props = [{
        filter: {
          someId: "507f1f77bcf86cd799439999",
        },
      }] satisfies Parameters<typeof repo.getMany>;
      const ret = await repo.getMany(...props);

      expect(ret.data).toHaveLength(0);
    });

    // AGENT: incluir sólo si el repo soporta expand / populate
    describe("expand", () => {
      it("expands <relatedEntity>", async () => {
        const props = [{
          expand: ["relatedEntity"],
        }] satisfies Parameters<typeof repo.getMany>;
        const ret = await repo.getMany(...props);

        expect(ret.data[0].relatedEntity).toBeDefined();
      });

      // AGENT: incluir sólo si expandir ciertos campos requiere requestingUserId
      it("does not expand userInfo without requestingUserId", async () => {
        const props = [{
          expand: ["userInfo"],
        }] satisfies Parameters<typeof repo.getMany>;
        const ret = await repo.getMany(...props);

        expect(ret.data[0].userInfo).toBeUndefined();
      });
    });

    // AGENT: incluir sólo si el repo soporta sorting
    describe("sorting", () => {
      it("sorts by <campo> asc", async () => {
        const props = [{
          sort: { someField: "asc" as const },
        }] satisfies Parameters<typeof repo.getMany>;
        const ret = await repo.getMany(...props);
        const values = ret.data.map((d) => d.someField);

        expect(values).toEqual([...values].sort());
      });
    });
  });

  // ── AGENT: incluir sólo si el repo tiene getOneById ───────────────────────────

  describe("getOneById", () => {
    it("returns the entity when it exists", async () => {
      const id = fixtureXxx.Samples.SomeItem.id;
      const result = await repo.getOneById(id);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(id);
    });

    it("returns null when not found", async () => {
      const result = await repo.getOneById("507f1f77bcf86cd799439999");

      expect(result).toBeNull();
    });
  });

  // ── AGENT: incluir sólo si el repo tiene createOneAndGet / getOneOrCreate ─────
  // OJO: estos tests mutan estado. Si los tests siguientes dependen de datos
  // limpios, recarga el fixture en el beforeEach de este describe.

  describe("createOneAndGet", () => {
    it("persists and returns the new entity", async () => {
      const dto = { title: "Test entity" };
      const result = await repo.createOneAndGet(dto);

      expect(result.id).toBeDefined();
      expect(result.title).toBe(dto.title);
    });

    // AGENT: incluir sólo si el repo emite evento Created
    it("emits Created domain event", async () => {
      const emitter = testingSetup.getMock(DomainEventEmitter);
      const dto = { title: "Event test" };

      await repo.createOneAndGet(dto);

      expect(emitter.emitEntity).toHaveBeenCalled();
    });

    // AGENT: incluir sólo si el repo usa upsert (getOneOrCreate)
    it("does not duplicate on upsert", async () => {
      const dto = { key: "existing-key" };

      await repo.getOneOrCreate(dto);
      await repo.getOneOrCreate(dto);

      const all = await repo.getAll();
      const matches = all.filter((e) => e.key === dto.key);

      expect(matches).toHaveLength(1);
    });
  });

  // ── AGENT: incluir sólo si el repo tiene patchOneByIdAndGet ──────────────────

  describe("patchOneByIdAndGet", () => {
    it("updates fields and returns updated entity", async () => {
      const id = fixtureXxx.Samples.SomeItem.id;
      const result = await repo.patchOneByIdAndGet(id, {
        entity: { title: "Updated" },
      });

      expect(result.title).toBe("Updated");
    });

    // AGENT: incluir sólo si el repo emite evento Patched
    it("emits Patched domain event", async () => {
      const emitter = testingSetup.getMock(DomainEventEmitter);
      const id = fixtureXxx.Samples.SomeItem.id;

      await repo.patchOneByIdAndGet(id, { entity: { title: "X" } });

      expect(emitter.emitPatch).toHaveBeenCalled();
    });

    it("throws when entity does not exist", async () => {
      await expect(
        repo.patchOneByIdAndGet("507f1f77bcf86cd799439999", {
          entity: { title: "X" },
        }),
      ).rejects.toThrow();
    });
  });

  // ── AGENT: incluir sólo si el repo tiene deleteOneByIdAndGet ─────────────────
  // OJO: eliminar muta estado. Si otros tests necesitan ese documento,
  // añade un beforeEach local que recargue el fixture.

  describe("deleteOneByIdAndGet", () => {
    it("removes the document and returns the deleted entity", async () => {
      const id = fixtureXxx.Samples.SomeItem.id;
      const result = await repo.deleteOneByIdAndGet(id);

      expect(result.id).toBe(id);

      const recheck = await repo.getOneById(id);

      expect(recheck).toBeNull();
    });

    // AGENT: incluir sólo si el repo emite evento Deleted
    it("emits Deleted domain event", async () => {
      const emitter = testingSetup.getMock(DomainEventEmitter);
      const id = fixtureXxx.Samples.SomeItem.id;

      await repo.deleteOneByIdAndGet(id);

      expect(emitter.emitEntity).toHaveBeenCalled();
    });

    it("throws when entity does not exist", async () => {
      await expect(
        repo.deleteOneByIdAndGet("507f1f77bcf86cd799439999"),
      ).rejects.toThrow();
    });
  });
});