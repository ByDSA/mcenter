import { SetMetadata, Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import z, { ZodError } from "zod";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { isDebugging } from "$shared/utils/vscode";

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

    return next.handle().pipe(
      map(data => {
        try {
          return schema.parse(data);
        } catch (e) {
          if (e instanceof ZodError) {
            let msg;

            if (isDebugging()) {
              const req = context.getArgs()?.[0];
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
                  expected: {
                    schema,
                  },
                },
                issues: e.issues,
              };

              msg = JSON.stringify(msgObj, null, 2);
            }

            throw new Error(msg);
          }

          throw e;
        }
      } ),
    );
  }
}
