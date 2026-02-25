import { TasksCrudDtos } from "$shared/models/tasks";
import z from "zod";

export const taskStatusAnySchema = TasksCrudDtos.TaskStatus.createSchema( {
  progressSchema: TasksCrudDtos.TaskStatus.progressSchemaBase,
  payloadSchema: z.any(),
  returnValueSchema: z.any().nullable(),
} );

export type TaskStatusAny = z.infer<typeof taskStatusAnySchema>;
