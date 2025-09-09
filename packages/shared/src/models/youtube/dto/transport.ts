import z from "zod";
import { musicFileInfoEntitySchema } from "../../musics/file-info";
import { musicEntitySchema } from "../../musics";
import { TasksCrudDtos } from "../../tasks/";

export namespace YoutubeCrudDtos {
  export namespace ImportOne {
    export namespace CreateTask {
      export const payloadSchema = z.object( {
        id: z.string(),
      } );

      export type Payload = z.infer<typeof payloadSchema>;

      export const paramsSchema = payloadSchema;
      export type Params = z.infer<typeof paramsSchema>;

      export const responseSchema = TasksCrudDtos.CreateTask
        .createCreatedTaskResultResponseSchema(payloadSchema);
      export type Response = z.infer<typeof responseSchema>;
    }

    export const resultSchema = z.object( {
      videoId: z.string(),
      created: z.object( {
        music: musicEntitySchema,
        fileInfo: musicFileInfoEntitySchema,
      } ).optional(),
    } );
    export type Result = z.infer<typeof resultSchema>;

    export namespace TaskStatus {
      export const progressSchema = z.object( {
        percentage: z.number().min(0)
          .max(100),
        message: z.string(),
      } );

      export type Progress = z.infer<typeof progressSchema>;

      export const statusSchema = TasksCrudDtos.TaskStatus.createSchema( {
        progressSchema,
        returnValueSchema: resultSchema,
        payloadSchema: CreateTask.payloadSchema,
      } );
      export type Status = z.infer<typeof statusSchema>;
    }
  }

  export namespace ImportPlaylist {
    export namespace CreateTask {
      export const payloadSchema = z.object( {
        id: z.string(),
      } );
      export type Payload = z.infer<typeof payloadSchema>;

      export const paramsSchema = payloadSchema;
      export type Params = z.infer<typeof paramsSchema>;

      export const responseSchema = TasksCrudDtos.CreateTask
        .createCreatedTaskResultResponseSchema(payloadSchema);
      export type Response = z.infer<typeof responseSchema>;
  }

    const valueSchema = z.object( {
      music: musicEntitySchema,
      fileInfo: musicFileInfoEntitySchema,
    } );
    const createdSchema = z.record(z.string(), valueSchema);
    const videoIdArraySchema = z.array(z.string());
    const classificationSchema = z.object( {
      done: videoIdArraySchema,
      failed: videoIdArraySchema,
      ignored: videoIdArraySchema,
      remaining: videoIdArraySchema,
    } ).strict();

    export const resultSchema = z.object( {
      playlistId: z.string(),
      created: createdSchema,
      classification: classificationSchema,
    } );

    export type Result = z.infer<typeof resultSchema>;

    export namespace TaskStatus {

      export const progressSchema = z.object( {
        percentage: z.number().min(0)
          .max(100),
        created: createdSchema.optional(),
        message: z.string(),
        classification: classificationSchema.optional(),
      } );

      export type Progress = z.infer<typeof progressSchema>;

      export const statusSchema = TasksCrudDtos.TaskStatus.createSchema( {
        payloadSchema: CreateTask.payloadSchema,
        returnValueSchema: resultSchema,
        progressSchema,
      } );
      export type Status = z.infer<typeof statusSchema>;
    }
  }
}
