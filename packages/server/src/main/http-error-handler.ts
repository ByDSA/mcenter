import { NextFunction, Request, Response } from "express";
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from "@nestjs/common";
import { ZodError } from "zod";
import { isDebugging } from "$shared/utils/vscode";
import { CustomValidationError } from "$shared/utils/validation/zod";

export const errorHandler = (err: unknown, _req: Request, res: Response, next: NextFunction) => {
  let unhandled = true;

  if (err instanceof ZodError || err instanceof CustomValidationError) {
    unhandled = false;
    res.sendStatus(HttpStatus.UNPROCESSABLE_ENTITY);
  } else if (typeof err === "object" && err !== null) {
    const code = (err as any).code ?? (err as any).status;

    if (code !== undefined && code !== 500) {
      unhandled = false;
      res.sendStatus(code);
    }
  }

  if (unhandled) {
    if (isDebugging()) {
      res.status(500).json( {
        message: (err as any).message ?? String(err),
      } );
    } else
      res.sendStatus(500);
  }

  next();
};

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
