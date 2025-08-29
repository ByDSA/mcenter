import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ResultResponse } from "$shared/utils/http/responses";

@Injectable()
export class ResponseFormatterInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ResultResponse | undefined> {
    return next.handle().pipe(
      map((data) => {
        // Si no hay datos, mantener undefined para 204 No Content
        if (data === undefined)
          return undefined;

        if (Array.isArray(data.data))
          return data;

        return {
          data,
        } satisfies ResultResponse;
      } ),
    );
  }
}
