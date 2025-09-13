import z from "zod";
import { createOneResultResponseSchema } from "../../utils/http/responses";
import { dateSchema } from "../utils/schemas/timestamps/date";

export namespace TasksCrudDtos {
  export namespace CreateTask {
    export const taskOptionsSchema = z.object( {
      delay: z.number().min(0),
      attempts: z.number().int()
        .min(1),
      priority: z.number().int()
        .min(1)
        .max(10),
      jobId: z.string().optional(),
    } );

    export type TaskOptions = z.infer<typeof taskOptionsSchema>;

    export const createTaskJobSchema = (payloadSchema: z.ZodTypeAny) => {
      return z.object( {
        id: z.string(),
        name: z.string(),
        message: z.string().optional(),
        payload: payloadSchema,
        createdAt: dateSchema,
      } );
    };

    export const createCreatedTaskResultResponseSchema = (
      schema: z.ZodTypeAny,
    ) => createOneResultResponseSchema(z.object( {
      job: createTaskJobSchema(schema),
    } ));

    export type TaskJob<T> = Omit<z.infer<ReturnType<typeof createTaskJobSchema>>, "payload"> & {
      payload: T;
    };
  }

  export namespace TaskStatus {
    // bullmq
    const finishedStatusSchema = z.enum(["completed", "failed"]);
    const jobStateSchema = z.enum([
      "active",
      "delayed",
      "prioritized",
      "waiting-children",
      "waiting",
    ]).or(finishedStatusSchema);

    export const progressSchemaBase = z.object( {
      percentage: z.number().min(0)
        .max(100),
      message: z.string(),
      pausable: z.boolean().optional(),
    } );

    export type ProgressBase = z.infer<typeof progressSchemaBase>;

    type Params<P extends z.infer<typeof progressSchemaBase>, PL, R> = {
       progressSchema: z.ZodType<P>;
    payloadSchema: z.ZodType<PL>;
    returnValueSchema: z.ZodType<R>;
    };

    export const createSchema = <P extends z.infer<typeof progressSchemaBase>, PL, R>(
      params: Params<P, PL, R>,
    ) => z.object( {
        id: z.string(),
        name: z.string(),
        status: z.union([jobStateSchema, z.literal("unknown")]),
        createdAt: dateSchema,
        processedAt: dateSchema.nullable().optional(),
        finishedAt: dateSchema.nullable().optional(),
        failedReason: z.string().nullable()
          .optional(),
        attempts: z.number(),
        maxAttempts: z.number(),
        payload: params.payloadSchema,
        progress: params.progressSchema,
        returnValue: params.returnValueSchema.optional(),
      } );

    export type TaskStatus<P = any, PL=any, R=any> =
      Omit<z.infer<ReturnType<typeof createSchema>>, "payload" | "progress" | "returnValue"> &
      {
        progress: P;
        payload: PL;
        returnValue?: R;
      };
  }
}
