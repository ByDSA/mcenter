---
name: server-tests-repository-db
description: Write MongoDB integration tests for repositories in the server package. Uses NestJS TestingModule with in-memory or real MongoDB, fixture data, and real Mongoose models.
license: MIT
compatibility: opencode
metadata:
  package: server
  stack: jest, mongodb-memory-server, mongoose, nestjs testing
  domain: repositories, ODM, data access layer
---

## What I do

I guide the agent through writing database integration tests for repositories. Tests run against a real MongoDB instance via the NestJS `TestingModule` infrastructure. They use actual Mongoose models and fixture data loaded once in `beforeAll`.

They do **NOT** test HTTP — use controller unit tests for that.

---

## Prototypes

Follow these templates, they are the reference implementation:

| Test type | Prototype |
|---|---|
| Repository DB test | `./references/repository.db.test.PROTOTYPE.ts` |
| ODM adapter unit tests | `./references/adapters.test.PROTOTYPE.ts` |

---

## File locations

```
src/modules/<domain>/crud/<entity>/repository/repository.db.test.ts
src/modules/<domain>/crud/<entity>/repository/odm/adapters.test.ts
```

---

## Setup helpers

| Helper | Path | What it does |
|---|---|---|
| `createTestingAppModuleAndInit` | `#core/app/tests/app` | Creates the NestJS testing module, wires DB, starts the app |
| `TestingSetup` | `#core/app/tests/app` | Type returned by `createTestingAppModuleAndInit` |
| `createMockedModule` | `#utils/nestjs/tests` | Mocks all providers of a NestJS module |
| `getOrCreateMockProvider` | `#utils/nestjs/tests` | Creates a singleton jest mock provider for an injectable class |
| `DomainEventEmitter` | `#core/domain-event-emitter` | Retrieve via `testingSetup.getMock()` to assert event calls |
| `DomainEventEmitterModule` | `#core/domain-event-emitter/module` | Always mock this via `createMockedModule` |
| `loadFixture*` | `#core/db/tests/fixtures/sets/*` | Fixture loaders — call in `beforeAll` after setup |

---

## Fixture sets

Check `#core/db/tests/fixtures/sets/index.ts` for the full list. Available sets:

- `loadFixtureAuthUsers` — auth users + roles + user-passes
- `loadFixtureSampleSeries` — series + episodes + fileInfos
- `loadFixtureSimpsons` — Simpsons series
- `loadFixtureMusicsInDisk` — musics + fileInfos
- `loadFixtureImageCoversInDisk` — image covers

If no matching set exists, create one under `src/core/db/tests/fixtures/sets/<YourSet>.ts`.

---

## What to test

Always test: happy path, each meaningful filter (individually and combined), empty-result case, not-found case.

Also test if the repo has:
- **Aggregation pipelines** — most failure-prone part; test each filter/lookup/sort stage.
- **`expand`** — test each expandable field, including auth-gated fields (e.g. `userInfo` requires `requestingUserId`).
- **Sorting / pagination** — verify order is correct.
- **Mutation methods** — verify DB state after create/patch/delete, and that domain events are emitted (`toHaveBeenCalled()`, not `toHaveBeenCalledWith()`).
- **Upsert (`getOneOrCreate`)** — verify no duplicates on repeated calls.

---

## Critical rules

- **`createTestingAppModuleAndInit` once per file** — it throws if called twice.
- **Never use `new TestMemoryDatabase()` with manual `connect`/`disconnect`** — use `createTestingAppModuleAndInit` with `db.using`.
- **Never mock `DomainEventEmitter` manually** — use `createMockedModule(DomainEventEmitterModule)` and `testingSetup.getMock(DomainEventEmitter)`.
- **Event assertions use `toHaveBeenCalled()` only** — not `toHaveBeenCalledWith()`.
- **Load fixtures in `beforeAll`, not `beforeEach`** — the DB is dropped once on connect.
- **`jest.clearAllMocks()` in `beforeEach`**, not `resetAllMocks()` — reset breaks `mockImplementation` set in `beforeAll`.
- **Test IDs must be valid 24-char hex strings**, e.g. `"507f1f77bcf86cd799439999"`.
- **Use fixture constants for IDs**, never `Math.random()` or `Date.now()`.
- **Mutation tests that break later tests**: reload the fixture in a nested `beforeEach` inside that `describe`, not globally.
- **`testingSetup.module.get(Repo)`** for simple providers; `testingSetup.app.get(Repo)` only for request-scoped.
- **Adapter tests are pure unit tests** — no DB, no NestJS. Keep them in `odm/adapters.test.ts`.