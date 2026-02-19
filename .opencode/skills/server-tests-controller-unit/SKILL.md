---
name: server-tests-controller-unit
description: Write unit tests for NestJS controllers in the server package. Uses createTestingAppModuleAndInit, mocked repositories via getOrCreateMockProvider, supertest HTTP assertions, and the auth mocking helpers. The canonical reference is src/modules/episodes/crud/episodes/controller.unit.test.ts
license: MIT
compatibility: opencode
metadata:
  package: server
  stack: jest, supertest, nestjs-testing
  domain: any controller with mocked dependencies
---

## What I do

I guide the agent through writing controller unit tests that mock all dependencies (repositories, services) and exercise HTTP request/response validation, auth guards, and status codes. These tests live in `*.unit.test.ts` files alongside the controller.

## Test philosophy

Controller unit tests verify:
1. Correct HTTP status codes for happy / error paths.
2. Input validation (Zod DTOs) rejects bad payloads with 422.
3. Auth guards block/allow according to role.
4. The controller delegates to the repository (mock called with right args).

They do **NOT** test repository logic (use DB tests for that).

---

## File location
Same folder as the controller, named `<controller>.unit.test.ts`.

---

## Full test template

Follow `./<this-skill>/references/controller.unit.test.ts` as prototype template.
---

## Key helpers

| Helper | Where | What it does |
|---|---|---|
| `createTestingAppModuleAndInit` | `#core/app/tests/app` | Creates a full NestJS app with global pipes, guards, interceptors |
| `getOrCreateMockProvider` | `#utils/nestjs/tests` | Auto-mocks a class, wires return values from fixtures |
| `testingSetup.getMock(Class)` | result of above | Gets the typed Jest mock instance |
| `testingSetup.useMockedUser(user)` | same | Sets the authenticated user for subsequent requests |
| `expectControllerFinishRequest()` | `#core/auth/strategies/token/tests` | Asserts the request reached the controller (no guard/pipe rejection) |
| `expectControllerFailInValidationPhase()` | same | Asserts the request was rejected before the controller ran |
| `testFailValidation(label, { request })` | same | Generates a `describe` block that asserts 422 for the request |
| `fixtureUsers.Normal/Admin.UserWithRoles` | `$shared/models/auth/tests/fixtures` | Pre-built user payloads for different roles |

---

## Mock return values

`getOrCreateMockProvider` automatically configures mocks to return fixtures. If you need a specific return value:

```ts
mocks.repo.getOneById.mockResolvedValue(SAMPLE_ENTITY);
mocks.repo.createOneAndGet.mockResolvedValue(SAMPLE_ENTITY);
mocks.repo.patchOneByIdAndGet.mockResolvedValue(SAMPLE_ENTITY);
mocks.repo.deleteOneByIdAndGet.mockResolvedValue(SAMPLE_ENTITY);
```

Always do this inside the test or a `beforeEach`, after `jest.clearAllMocks()`.

---

## Auth scenarios cheat-sheet

```ts
// Unauthenticated request → 401
// (don't call useMockedUser at all, or explicitly set null)

// Normal user → may get 403 on admin routes
await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);

// Admin user → passes @IsAdmin() guard
await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);
```

---

## Critical rules

- Always call `jest.clearAllMocks()` in `beforeEach` — mocks from previous tests bleed through.
- Use `await testingSetup.useMockedUser(...)` **before** the `request(router)` call, not after.
- `createTestingAppModuleAndInit` should be called once in `beforeAll`, not per test.
- Do not import the real repository module — use `getOrCreateMockProvider` only.
- `testFailValidation` creates its own `describe` block — do not wrap it manually.
- Use `fixtureUsers` from `$shared` for consistency — never hard-code user IDs in tests.