import { Controller,
  Get,
  Param,
  MessageEvent,
  HttpStatus,
  HttpException,
  Sse,
  Query,
  UnprocessableEntityException } from "@nestjs/common";
import { Observable, switchMap, catchError, timer, fromEvent, merge, of, auditTime } from "rxjs";
import { TasksCrudDtos } from "$shared/models/tasks";
import { assertFoundClient } from "#utils/validation/found";
import { SingleTasksService } from "./task.service";

type TaskMessageEvent = Omit<MessageEvent, "id" | "type"> & {
  id: string;
  type: "error" | "task-status";
};

@Controller()
export class TaskController {
  constructor(private readonly singleTaskService: SingleTasksService) {}

  /**
   * Obtiene estadísticas generales de la cola de tareas
   */
  @Get("queue/:name/status")
  async getQueueStatus(
    @Param("name") _name: string,
    @Query("n") n: number | undefined,
  ) {
    return {
      data: await this.singleTaskService.getQueueStatus(n),
    };
  }

  @Get("queue/:name/ids")
  async getQueueIds(
    @Param("name") _name: string,
    @Query("n") n: number | undefined,
  ) {
    return {
      data: await this.singleTaskService.getQueueIds(n),
    };
  }

  /**
   * Obtiene el estado de una tarea específica por su ID
   */
  @Get(":id/status")
  async getTaskStatus(
    @Param("id") id: string,
  ): Promise<TasksCrudDtos.TaskStatus.TaskStatus> {
    try {
      return await this.singleTaskService.getTaskStatus(id);
    } catch (error) {
      if (!(error instanceof Error))
        throw error;

      if (error.message.includes("not found")) {
        const err = new UnprocessableEntityException();

        err.message = error.message;
        throw err;
      }

      throw error;
    }
  }

  private async getSecureTaskStatusResponse(id: string) {
    try {
      const status = await this.singleTaskService.getTaskStatus(id);

      assertFoundClient(status);

      return createTaskSuccessMessageEvent(status);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return createTaskErrorMessageEvent(
          new HttpException(
            `Task with ID ${id} not found`,
            HttpStatus.UNPROCESSABLE_ENTITY,
          ),
          {
            taskId: id,
          },
        );
      }

      throw error;
    }
  }

  /**
   * SSE endpoint para monitorear el estado de una tarea específica en tiempo real
   */
  @Sse(":id/status/stream")
  streamTaskStatus(
    @Param("id") id: string,
    @Query("heartbeat") heartbeatMsStr: string,
  ): Observable<TaskMessageEvent> {
    let heartbeatMs = +heartbeatMsStr;

    if (Number.isNaN(heartbeatMs))
      heartbeatMs = 30_000; // 30 segundos por defecto

    // Observable para cambios de estado de la tarea específica
    const taskChanges$ = fromEvent(this.singleTaskService, "task-change").pipe(
      switchMap(async (jobId: unknown) => {
        if (jobId !== id)
          return null;

        return await this.getSecureTaskStatusResponse(jobId);
      } ),
      // Filtrar valores null (cuando el evento no es para nuestra tarea)
      switchMap(result => result ? of(result) : []),
      auditTime(1_000), // Esperar X tiempo entre envíos
    );
    // Observable para heartbeat
    const heartbeat$ = timer(heartbeatMs, heartbeatMs).pipe(
      switchMap(async () => await this.getSecureTaskStatusResponse(id)),
    );
    // Estado inicial
    const initialState$ = new Observable<TaskMessageEvent>(observer => {
      this.singleTaskService.getTaskStatus(id)
        .then(status => {
          if (status)
            observer.next(createTaskSuccessMessageEvent(status));

          observer.complete();
        } )
        .catch(error => {
          if (error instanceof Error && error.message.includes("not found")) {
            observer.next(createTaskErrorMessageEvent(
              new HttpException(
                `Task with ID ${id} not found`,
                HttpStatus.UNPROCESSABLE_ENTITY,
              ),
              {
                taskId: id,
              },
            ));
          } else
            observer.next(createTaskErrorMessageEvent(error));

          observer.complete();
        } );
    } );

    return merge(
      initialState$,
      taskChanges$,
      heartbeat$,
    ).pipe(
      catchError((error: unknown) => {
        // Retornar un Observable con un solo TaskMessageEvent, no un array
        return of(createTaskErrorMessageEvent(error));
      } ),
    );
  }
}

function createTaskSuccessMessageEvent(data: object): TaskMessageEvent {
  return {
    data,
    type: "task-status",
    id: Date.now().toString(),
  };
}

function createTaskErrorMessageEvent(error: unknown, meta?: Record<string, any>): TaskMessageEvent {
  return {
    data: JSON.stringify( {
      error: error instanceof Error ? error.message : "Unknown error",
      meta,
    } ),
    type: "error",
    id: Date.now().toString(),
  };
}
