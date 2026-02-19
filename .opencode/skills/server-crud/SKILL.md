---
name: server-crud
description: Create a complete NestJS CRUD module in the server package following the established architecture: controller with Zod-validated DTOs, repository with domain events, Mongoose ODM with adapters, NestJS module registration, and route wiring.
license: MIT
compatibility: opencode
metadata:
  package: server
  stack: nestjs, mongoose, zod, nestjs-zod
---

## What I do

I guide the agent through creating a fully wired CRUD module from scratch, following every pattern already present in the server package (using prototypes). The result is production-ready and consistent with the rest of the codebase.

Never use `tsc` or `pnpm build` to verify compilation: always use `jest`.

## Anatomy of a CRUD module

A complete module lives at `src/modules/<domain>/crud/` and contains:

```
src/modules/<domain>/crud/
  controller.ts            # NestJS controller — uses #utils/nestjs/rest decorators
  module.ts                # NestJS @Module binding controller + repository + sub-imports
  repositories/
    <entity>/
      index.ts             # re-exports
      events.ts            # Domain event namespace (EntityEvent, PatchEvent)
      repository.ts        # @Injectable class implementing Can* interfaces
      odm/
        odm.ts             # mongoose.Schema + Model + Doc types
        adapters.ts        # toEntity(), toDoc(), partialToDoc()
        index.ts           # re-exports
```

Only group under `<entity>` if there is more than one repository. If there is only one, place the contents of `<entity>` directly under `repositories/`. Only create a `<entity>/` subfolder if there is more than one repository in the module. If there is only one, the files (`repository.ts`, `events.ts`, `odm/`) go directly in `repositories/`, without an intermediate subfolder.

Then **register** in:
- `src/core/routing/routes.ts` → `directImports` + `routes` array.

---

Execute all following steps sequentially. Never omit any step. Abort if you can't end a step successfully.

## Step - Load references
Prototypes are available in the `references` folder inside this skill folder. You don't need read existing models. MANDATORY: before writing any line of code, read all files in references/ using the file reading tool. The prototypes are the source of truth for the structure and patterns of each layer. Do not rely on existing files in the codebase.

## Step — ODM (`odm/odm.ts`)

Use [prototype](./references/odm.ts)

---

## Step — Adapters (`odm/adapters.ts`)

Use [prototype](./references/adapters.ts).

Export everything from `odm/index.ts`. Use [prototype](./references/odm.index.ts).

---

## Step — Domain Events (`events.ts`)

Use [prototype](./references/events.ts).

---

## Step — Repository (`repository.ts`)

Use [prototype](./references/repository.ts).

Export from `index.ts`:
```ts
export { MyEntityRepository } from "./repository";
```

---

## Step — Controller (`controller.ts`)

Use the REST decorators from `#utils/nestjs/rest`. The controller is intentionally thin — it only delegates to the repository.

Use [prototype](./references/controller.ts).

---

## Step — Module (`module.ts`)

Use [prototype](./references/module.ts).

---

## Step — Register in routing (`src/core/routing/routes.ts`)

```ts
// 1. Import the module
import { MyEntityCrudModule } from "#modules/my-entity/crud/module";

// 2. Add to directImports
export const directImports = [
  // ... existing
  MyEntityCrudModule,
];

// 3. Add route entry (inside the correct grouping)
const myEntityRoutes: Routes = [
  {
    path: PATH_ROUTES.myEntity.path,   // define in $shared/routing first
    module: MyEntityCrudModule,
  },
];

export const routes: Routes = [
  // ... existing
  ...myEntityRoutes,
];
```

## Step - Create a repository mock
Create a global mock repository based on the repository just created. Use skill `server-tests-repository-globalmock` for this step.

## Step — Create and pass tests

Tests are an integral part of any complete CRUD module. A CRUD without tests is not finished.
Load all `server-tests-*` skills and create all needed tests. Create **ALL** tests in this order:
- repository.unit.test.ts
- repository.test.ts (optional)
- routes.test.ts (use skill `server-tests-routes`)
- controller.unit.test.ts (use skill `server-tests-controller-unit`)
- repository.db.test.ts (optional. Use skill `server-tests-repository-db`)
- controller.int.test.ts

Don't omit any test.

For each test creation, follow these steps in order:
- Create the test file following the references/prototypes if you can.
- Try to pass the single test file, like this: `NODE_ENV=test pnpm exec jest --maxWorkers=1 "<test_path>"`. IMPORTANT: DON'T use `tsc`, use jest instead.
- If it passes: create the next test file (or finish if there are no more tests to do)
- If it fails: fix the files and try to pass again (only this test).

IMPORTANT: do NOT use any hacks to force test-passing (like `as any`).

## Step — Apply linter

Only for created or modified files, apply eslint rules. For each file:
```sh
eslint --fix <file>
```

Never use eslint for entire project. Only for created or modifies files.

---

## Critical rules

- **Never** put business logic in the controller — only delegation. If you need additional business logic unrelated to the repository, create a new service inside the same module.
- Always use `assertFoundClient(result)` when the entity must exist after an operation.
- ODM adapters must be pure functions — no side effects.
- Domain events are mandatory on create/patch/delete — use `@EmitEntityEvent()` or `domainEventEmitter.emitPatch()`.
- `DomainEventEmitterModule` must be in `imports` of the NestJS module.