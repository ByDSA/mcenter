import { SetMetadata, Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import z, { ZodError } from "zod";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { isDebugging } from "$shared/utils/vscode";
import { Request } from "express";

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
    return schema.parse(data);
  } catch (e) {
    if (e instanceof ZodError) {
      let msg;

      if (isDebugging()) {
        const msgObj = {
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
          issues: e.issues,
        };

        msg = JSON.stringify(msgObj);
      }

      throw new Error(msg);
    }

    throw e;
  }
}
