import z from "zod";
import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching";
import { FetchApi } from "#modules/fetching/fetch-api";
import { taskStatusAnySchema } from "./types";

const taskControlResponseSchema = z.object( {
  data: z.object( {
    message: z.string(),
  } ),
} );
const queueStatusResponseSchema = z.object( {
  data: taskStatusAnySchema.array(),
  errors: z.any().array()
    .optional(),
} );
const queueIdsResponseSchema = z.object( {
  data: z.string().array(),
} );

export class TasksApi {
  static {
    FetchApi.register(this, new this());
  }

  async getQueueStatus(queue: string, n?: number) {
    const fetcher = makeFetcher( {
      method: "GET",
      responseSchema: queueStatusResponseSchema,
    } );

    return await fetcher( {
      url: backendUrl(PATH_ROUTES.tasks.queue.status.withParams(queue, n)),
    } );
  }

  async getQueueIds(queue: string, n?: number) {
    const fetcher = makeFetcher( {
      method: "GET",
      responseSchema: queueIdsResponseSchema,
    } );

    return await fetcher( {
      url: backendUrl(PATH_ROUTES.tasks.queue.ids.withParams(queue, n)),
    } );
  }

  async getTaskStatus(id: string) {
    const fetcher = makeFetcher( {
      method: "GET",
      responseSchema: taskStatusAnySchema,
    } );

    return await fetcher( {
      url: backendUrl(PATH_ROUTES.tasks.status.withParams(id)),
    } );
  }

  async pauseTask(id: string) {
    const fetcher = makeFetcher( {
      method: "POST",
      responseSchema: taskControlResponseSchema,
    } );

    return await fetcher( {
      url: backendUrl(PATH_ROUTES.tasks.pause.withParams(id)),
    } );
  }

  async resumeTask(id: string) {
    const fetcher = makeFetcher( {
      method: "POST",
      responseSchema: taskControlResponseSchema,
    } );

    return await fetcher( {
      url: backendUrl(PATH_ROUTES.tasks.resume.withParams(id)),
    } );
  }

  async killTask(id: string) {
    const fetcher = makeFetcher( {
      method: "POST",
      responseSchema: taskControlResponseSchema,
    } );

    return await fetcher( {
      url: backendUrl(PATH_ROUTES.tasks.kill.withParams(id)),
    } );
  }
}
