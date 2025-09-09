import { NextFunction, Request, Response } from "express";
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from "@nestjs/common";
import { ZodError } from "zod";
import { isDebugging } from "$shared/utils/vscode";
import { CustomValidationError } from "$shared/utils/validation/zod";
import { errorToErrorElementResponse, ResultResponse } from "$shared/utils/http/responses";

const ignoreTraceCodes = [404];

export const errorHandler = (err: unknown, _req: Request, res: Response, next: NextFunction) => {
  let code = HttpStatus.INTERNAL_SERVER_ERROR;

  if (err instanceof ZodError || err instanceof CustomValidationError)
    code = HttpStatus.UNPROCESSABLE_ENTITY;
  else if (typeof err === "object" && err !== null)
    code = (err as any).code ?? (err as any).status;

  const errObj: NonNullable<ResultResponse<null>["errors"]>[0] = errorToErrorElementResponse(err, {
    ignoreTrace: !isDebugging() || ignoreTraceCodes.includes(code),
  } );

  res.status(code).json( {
    data: null,
    errors: [errObj],
  } satisfies ResultResponse<null>);

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
