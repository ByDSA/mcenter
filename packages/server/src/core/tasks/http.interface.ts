import z from "zod";
import { applyDecorators, HttpCode, HttpStatus, UseInterceptors } from "@nestjs/common";
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ResultResponse } from "$shared/utils/http/responses";
import { TasksCrudDtos } from "$shared/models/tasks";
import { ValidateResponseWithZodSchema } from "#utils/validation/zod-nestjs";
import { ResponseFormatterInterceptor } from "#utils/nestjs/rest/responses/response-formatter.interceptor";
import { DataNotFoundOnNullInterceptor } from "#utils/nestjs/rest";

export function TaskCreatedResponseValidation(schema: z.ZodSchema) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    // los interceptors se ejecutan al revés:
    UseInterceptors(
      MessageInterceptor,
      ResponseFormatterInterceptor,
      DataNotFoundOnNullInterceptor,
    ),
    ValidateResponseWithZodSchema(
      TasksCrudDtos.CreateTask.createCreatedTaskResultResponseSchema(schema),
    ),
    HttpCode(HttpStatus.OK),
  ];

  return applyDecorators(...decorators);
}

@Injectable()
export class MessageInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ResultResponse | undefined> {
    return next.handle().pipe(
      map((res) => {
        if (res.data.job.message === undefined) {
          return {
            data: {
              ...res.data,
              job: {
                ...res.data.job,
                message: "Task created successfully",
              },
            },
          } satisfies ResultResponse;
        }

        return res;
      } ),

    );
  }
}
