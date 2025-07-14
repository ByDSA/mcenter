import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { DataResponse } from "$shared/utils/http/responses/rest";

@Injectable()
export class ResponseFormatterInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<DataResponse | undefined> {
    return next.handle().pipe(
      map((data) => {
        // Si no hay datos, mantener undefined para 204 No Content
        if (data === undefined)
          return undefined;

        return {
          data: data,
        } satisfies DataResponse;
      } ),
    );
  }
}
