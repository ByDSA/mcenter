import { SetMetadata, Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { z } from "zod";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ZodSerializerSchema = (schema: z.ZodSchema) => SetMetadata("zodSerializerSchema", schema);

@Injectable()
export class ZodSerializerSchemaInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const schema = this.reflector.get<z.ZodSchema>("zodSerializerSchema", context.getHandler());

    if (!schema)
      return next.handle();

    return next.handle().pipe(
      map(data => {
        return schema.parse(data);
      } ),
    );
  }
}
