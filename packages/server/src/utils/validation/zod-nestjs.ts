import { SetMetadata, Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import z, { ZodError } from "zod";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { isDebugging } from "$shared/utils/vscode";
import { Request } from "express";
import { parseZod } from "$shared/utils/validation/zod";
import { CustomValidationError } from "$shared/utils/validation/zod";
import { toGenericError } from "$shared/utils/errors";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ValidateResponseWithZodSchema = (
  schema: z.ZodSchema,
) => SetMetadata("zodSerializerSchema", schema);

@Injectable()
export class ZodSerializerSchemaInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const schema = this.reflector.get<z.ZodSchema>("zodSerializerSchema", context.getHandler());

    if (!schema)
      return next.handle();

    const req = context.getArgs()?.[0];

    return next.handle().pipe(
      map(data => {
        return validateResponseWithZodSchema(data, schema, req);
      } ),
    );
  }
}

export function validateResponseWithZodSchema<D>(data: D, schema: z.ZodSchema, req?: Request): D {
  try {
    return parseZod(schema, data);
  } catch (e) {
    if (e instanceof CustomValidationError)
      // eslint-disable-next-line no-ex-assign
      e = toGenericError(e);

    if (!isDebugging() || !(e instanceof Error))
      throw e;

    const msgObj = {
      message: e.message,
      issues: e instanceof ZodError ? e.issues : undefined,
      ctx: {
        request: {
          body: req?.body,
          method: req?.method,
          url: req?.originalUrl,
        },
        response: {
          data,
        },
      },
      schema: JSON.stringify(schema, null, 2),
    };

    e.message = JSON.stringify(msgObj);

    throw e;
  }
}
