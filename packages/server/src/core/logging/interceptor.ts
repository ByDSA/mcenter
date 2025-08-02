import { Injectable, NestInterceptor, Logger, ExecutionContext, CallHandler, HttpException } from "@nestjs/common";
import { Observable, tap, catchError } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body: _ } = request;
    const startTime = Date.now();

    this.logger.log(`Incoming ${method} ${url}`);

    return next.handle().pipe(
      tap((_data) => {
        const duration = Date.now() - startTime;

        this.logger.log(`Completed ${method} ${url} in ${duration}ms`);
      } ),
      catchError((error) => {
        const duration = Date.now() - startTime;

        if (
          error instanceof Error
          && (!(error instanceof HttpException) || error.getStatus().toString()
            .startsWith("5"))
        ) {
          const h = `Failed ${method} ${url} in ${duration}ms.\n${error.name}: ${error.message}`;
          const output = error.stack
            ? `${h}\n${genOutputStackError(error.stack)}`
            : h;

          this.logger.error(output);
        } else {
          const header = `Failed ${method} ${url} in ${duration}ms: ${error.message}`;

          this.logger.warn(header);
        }

        throw error;
      } ),
    );
  }
}

function getStartIndex(line: string) {
  const starts = [" /", "(/", "(node:internal/"];

  for (const start of starts) {
    const index = line.indexOf(start);

    if (index !== -1)
      return index + 1;
  }

  return -1;
}

function getEndIndex(line: string) {
  const lastIndex = line.lastIndexOf(":");
  const preLastIndex = line.lastIndexOf(":", lastIndex - 1);

  return preLastIndex;
}

export function genOutputStackError(stack: string): string {
  let output = "\x1b[0;37m";

  // Añadir el stack trace con formato
  if (stack) {
    output += stack!.split("\n").slice(1)
      .map(line => {
        if (!line.includes("/"))
          return line;

        const cyanStartIndex = getStartIndex(line);

        if (cyanStartIndex === -1)
          return line;

        const cyanEndIndex = getEndIndex(line);
        const cyan = line.slice(cyanStartIndex, cyanEndIndex);

        return `${line.slice(0, cyanStartIndex)}\
\x1b[0;36m${cyan}\x1b[0;30m${line.slice(cyanEndIndex)}`;
      } )
      .join("\n");
  }

  output += "\n\x1b[0m";

  return output;
}
