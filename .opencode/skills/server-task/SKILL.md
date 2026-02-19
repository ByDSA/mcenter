---
name: server-task
description: Create an async background task for the server package using BullMQ. Covers the task handler class (TaskHandler interface + @TaskHandlerClass decorator), the trigger controller endpoint, SSE status streaming, and NestJS module wiring.
license: MIT
compatibility: opencode
metadata:
  package: server
  stack: nestjs, bullmq, redis, rxjs, sse
  domain: admin tasks, sync, import, batch processing
---

## What I do

I guide the agent through creating a production-ready async task that fits the existing BullMQ infrastructure. The canonical reference is `src/modules/episodes/admin/sync-disk-to-db/task.handler.ts`. Tasks are one-at-a-time (singleton per name), queued in Redis, monitored via SSE, and auto-registered through NestJS discovery.

## Task architecture overview

```
<domain>/admin/<task-name>/
  task.handler.ts        # Business logic — implements TaskHandler, decorated @TaskHandlerClass
  controller.ts          # HTTP trigger — uses @TaskCreatedResponseValidation + @IsAdmin
  module.ts              # NestJS @Module with TasksModule import
  index.ts               # re-exports
```

The `TaskController` at `src/core/tasks/controller.ts` already provides the SSE streaming endpoint (`GET /tasks/:id/status/stream`) — you do NOT recreate it.

---

## Step 1 — Define payload and result schemas

At the top of `task.handler.ts`, always define Zod schemas and infer types. These are the contracts between enqueuer and worker.

```ts
import z from "zod";
import { TasksCrudDtos } from "$shared/models/tasks";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { createOneResultResponseSchema } from "$shared/utils/http/responses";

// What the caller passes when triggering the task
export const payloadSchema = z.object({
  requesterUserId: mongoDbId,
  // add domain-specific fields here
});

// Shape of job.updateProgress() — always use progressSchemaBase
const progressSchema = TasksCrudDtos.TaskStatus.progressSchemaBase;

// What the task returns when done
const resultSchema = createOneResultResponseSchema(
  z.object({
    processed: z.number(),
    // add domain-specific result fields here
  }),
);

type Payload = z.infer<typeof payloadSchema>;
type Progress = z.infer<typeof progressSchema>;
type Result   = z.infer<typeof resultSchema>;
```

---

## Step 2 — Task Handler class (`task.handler.ts`)

```ts
import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { TaskHandler, TaskHandlerClass, TaskService } from "#core/tasks";
import { tasksMyDomain } from "$shared/models/my-domain/admin"; // task name constant lives in shared

const TASK_NAME = tasksMyDomain.myTask.name; // e.g. "my-domain.my-task"

@Injectable()
@TaskHandlerClass()              // ← REQUIRED: registers this class for BullMQ auto-discovery
export class MyDomainTaskHandler implements TaskHandler<Payload, Result> {
  private readonly logger = new Logger(MyDomainTaskHandler.name);

  readonly taskName = TASK_NAME; // ← REQUIRED: must match the constant above

  constructor(
    private readonly taskService: TaskService,
    // inject any repositories or services needed
  ) {}

  // Called by the HTTP trigger controller
  async addTask(
    payload: Payload,
    options?: Partial<TasksCrudDtos.CreateTask.TaskOptions>,
  ) {
    // Prevent duplicate execution: throws if already running/pending
    await this.taskService.assertJobIsNotRunningOrPendingByName(TASK_NAME);

    return await this.taskService.addTask<Payload>(
      TASK_NAME,
      payloadSchema.parse(payload), // always validate before enqueue
      { ...options },
    );
  }

  // Called by BullMQ worker — contains the actual business logic
  async execute(payload: Payload, job: Job<Payload, Result>): Promise<Result> {
    const updateProgress = (p: Progress) => job.updateProgress(p);

    await updateProgress({ message: "Starting…", percentage: 0 });

    // --- your logic here ---
    let processed = 0;

    await updateProgress({ message: "Processing…", percentage: 50 });

    // example: do something
    processed = 42;
    // --- end logic ---

    await updateProgress({ message: "Done!", percentage: 100 });

    return {
      data: { processed },
      errors: [],
    };
  }
}
```

Key rules:
- `@TaskHandlerClass()` is mandatory — without it, the BullMQ worker never discovers the handler.
- `readonly taskName` must be a stable string constant shared with `$shared`.
- Always call `assertJobIsNotRunningOrPendingByName` in `addTask` for singleton tasks.
- Always validate payload with `payloadSchema.parse()` before passing to `addTask`.
- Call `job.updateProgress()` at meaningful milestones for SSE clients.

---

## Step 3 — Trigger Controller (`controller.ts`)

The controller is intentionally tiny: it validates auth, calls `addTask`, and wraps the response.

```ts
import { Controller, Get, Query } from "@nestjs/common";
import { TaskCreatedResponseValidation } from "#core/tasks";
import { IsAdmin } from "#core/auth/users/roles/Roles.guard";
import { User } from "#core/auth/users/User.decorator";
import { UserPayload } from "$shared/models/auth";
import { payloadSchema } from "./task.handler";
import { MyDomainTaskHandler } from "./task.handler";

@Controller()
export class MyTaskController {
  constructor(private readonly handler: MyDomainTaskHandler) {}

  @Get("trigger")
  @IsAdmin()
  @TaskCreatedResponseValidation(payloadSchema)  // wraps response as task-created shape
  async trigger(@User() user: UserPayload) {
    return await this.handler.addTask({ requesterUserId: user.id });
  }
}
```

Notes:
- `@IsAdmin()` is the standard guard for admin-only tasks.
- `@TaskCreatedResponseValidation(schema)` is mandatory — it sets HTTP 200, wraps the BullMQ job info, and validates the response shape.
- No need to implement SSE here — use the global `GET /tasks/:id/status/stream` endpoint.

---

## Step 4 — Module (`module.ts`)

```ts
import { Module } from "@nestjs/common";
import { TasksModule } from "#core/tasks";
import { MyTaskController } from "./controller";
import { MyDomainTaskHandler } from "./task.handler";

@Module({
  imports: [
    TasksModule,    // ← REQUIRED: provides TaskService + BullMQ wiring
    // import any repository modules your handler needs
  ],
  controllers: [MyTaskController],
  providers: [MyDomainTaskHandler],
  exports: [MyDomainTaskHandler],
})
export class MyDomainAdminModule {}
```

---

## Step 5 — Register in routing (`src/core/routing/routes.ts`)

```ts
import { MyDomainAdminModule } from "#modules/my-domain/admin/module";

export const directImports = [
  // ...existing
  MyDomainAdminModule,
];

const myDomainRoutes: Routes = [
  {
    path: PATH_ROUTES.myDomain.admin.path,
    module: MyDomainAdminModule,
  },
];
```

---

## Monitoring the task from a client

Once triggered, the client receives a job ID. It then polls or streams the status:

```
GET /tasks/:jobId/status         → one-shot status object
GET /tasks/:jobId/status/stream  → SSE stream (heartbeat every 30s by default)
```

---

## Task name convention

Task names live in the `shared` package as constants, e.g.:

```ts
// shared/src/models/my-domain/admin/index.ts
export const tasksMyDomain = {
  myTask: { name: "my-domain.my-task" as const },
};
```

This keeps the task name shared between frontend (if it needs to show status) and backend.

---

## Critical rules

- One `@TaskHandlerClass()` provider per `taskName` — duplicates throw at startup.
- Never `await` long operations without calling `updateProgress` — SSE clients need feedback.
- Use `safeSequential` / `safeOneConcurrent` from `$shared/utils/errors` when orchestrating multiple sub-steps to collect partial errors gracefully.
- Task results must be JSON-serialisable (BullMQ stores them in Redis).
- Do not call `execute()` directly — it is called by the BullMQ worker inside `SingleTasksService`.
