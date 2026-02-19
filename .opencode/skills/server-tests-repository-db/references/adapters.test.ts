/**
 * PROTOTIPO: odm/adapters.test.ts
 *
 * Tests unitarios puros para los adaptadores del ODM (toEntity, toDoc, partialToDoc).
 * NO necesitan TestMemoryDatabase ni NestJS — son funciones puras.
 *
 * Sustitutos que el agente debe reemplazar:
 *   - toEntity, toDoc, partialToDoc → las funciones reales del módulo de adapters
 *   - fakeDoc                        → la forma real del documento Mongoose del dominio
 *   - "507f1f77bcf86cd799439011"     → un ObjectId válido de 24 hex chars
 *
 * Los bloques marcados con "AGENT: incluir sólo si…" son opcionales.
 */

import { toEntity, toDoc, partialToDoc } from "./adapters";

// ── Fixture local (sin DB) ─────────────────────────────────────────────────────

const FAKE_ID = "507f1f77bcf86cd799439011";

const fakeDoc = {
  _id: { toString: () => FAKE_ID } as any,
  title: "Test title",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  // AGENT: añade los campos reales del DocOdm del dominio
};

// ── toEntity ───────────────────────────────────────────────────────────────────

describe("toEntity", () => {
  it("maps _id to string id", () => {
    const entity = toEntity(fakeDoc as any);

    expect(entity.id).toBe(FAKE_ID);
  });

  it("maps all scalar fields", () => {
    const entity = toEntity(fakeDoc as any);

    expect(entity.title).toBe(fakeDoc.title);
    // AGENT: añade expect por cada campo del modelo
  });

  // AGENT: incluir sólo si el doc tiene campos de fecha (timestamps)
  it("maps timestamps as UTC numbers", () => {
    const entity = toEntity(fakeDoc as any);

    expect(entity.createdAt).toBe(fakeDoc.createdAt.getTime());
    expect(entity.updatedAt).toBe(fakeDoc.updatedAt.getTime());
  });

  // AGENT: incluir sólo si el doc tiene relaciones embebidas o referencias populate
  it("maps nested relation", () => {
    const docWithRelation = {
      ...fakeDoc,
      relatedEntity: {
        _id: { toString: () => "507f1f77bcf86cd799439022" } as any,
        name: "Related",
      },
    };
    const entity = toEntity(docWithRelation as any);

    expect(entity.relatedEntity?.id).toBe("507f1f77bcf86cd799439022");
    expect(entity.relatedEntity?.name).toBe("Related");
  });
});

// ── toDoc ──────────────────────────────────────────────────────────────────────

// AGENT: incluir sólo si el repo usa toDoc (ej. createOneAndGet, upsert)

describe("toDoc", () => {
  const fakeEntity = {
    id: FAKE_ID,
    title: "Test title",
    createdAt: new Date("2024-01-01").getTime(),
    updatedAt: new Date("2024-01-01").getTime(),
    // AGENT: añade los campos reales del modelo de dominio
  };

  it("maps id to MongoDB ObjectId", () => {
    const doc = toDoc(fakeEntity as any);

    expect(doc._id?.toString()).toBe(FAKE_ID);
  });

  it("maps all scalar fields", () => {
    const doc = toDoc(fakeEntity as any);

    expect(doc.title).toBe(fakeEntity.title);
    // AGENT: añade expect por cada campo
  });
});

// ── partialToDoc ───────────────────────────────────────────────────────────────

// AGENT: incluir sólo si el repo usa partialToDoc (ej. patchOneByIdAndGet)

describe("partialToDoc", () => {
  it("only includes defined fields", () => {
    const partial = partialToDoc({ title: "Updated" });

    expect(partial).toEqual({ title: "Updated" });
    expect(Object.keys(partial)).toHaveLength(1);
  });

  it("does not include undefined fields", () => {
    const partial = partialToDoc({ title: undefined });

    expect(Object.keys(partial)).toHaveLength(0);
  });
});
