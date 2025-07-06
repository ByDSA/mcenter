import { HttpError } from "#shared/utils/http";
import { isDebugging } from "#shared/utils/vscode";
import { NextFunction, Request, Response } from "express";
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from "@nestjs/common";

export const errorHandler = (err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if ((process.env.NODE_ENV !== "test" || (process.env.NODE_ENV === "test" && isDebugging())) && err instanceof Error && err.stack && !(err instanceof HttpError) && !(err instanceof HttpException)) { // TODO: usar enums
    let output = `${ err.name }`;

    if (err.message)
      output += `: ${ err.message }`;

    process.stderr.write(["\x1b[", "1;91", "m", output, "\x1b[", "0;30", "m", "\n"].join(""));
    process.stderr.write(err.stack.split("\n").slice(1)
      .map(line => {
        // if (content) is not a path
        if (!line.includes("/"))
          return line;

        const cyanStartIndex = getStartIndex(line);

        if (cyanStartIndex === -1)
          return line;

        const cyanEndIndex = getEndIndex(line);
        const cyan = line.slice(cyanStartIndex, cyanEndIndex);

        // construct full line with cyan
        return `${line.slice(0, cyanStartIndex) }\x1b[0;36m${ cyan }\x1b[0;30m${ line.slice(cyanEndIndex)}`;
      } )
      .join("\n"));
    process.stderr.write("\n\x1b[0m");
  }

  if (typeof err === "object" && err !== null) {
    if ("code" in err)
      res.sendStatus((err as any).code);
    else if ("status" in err)
      res.sendStatus((err as any).status);
    else
      res.sendStatus(500);
  } else
    res.sendStatus(500);

  next();
};

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

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    // Crear un mock de next para compatibilidad
    // eslint-disable-next-line no-empty-function
    const next = () => {};

    // Llamar a tu función original
    errorHandler(exception, request, response, next);
  }
}
