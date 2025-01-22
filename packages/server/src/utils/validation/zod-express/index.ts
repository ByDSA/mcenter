import { HttpStatusCode } from "#shared/utils/http";
import { NextFunction, Request, Response } from "express";
import { ExpressMiddleware } from "#utils/express";

export type ResponseWithBody<T> = Response<T> & {
  body?: T;
};

type AssertFunction<T> = (obj: T)=> T;
export function validateReq<T>(assertFunc: AssertFunction<T>): ExpressMiddleware {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      assertFunc(req as any);

      return next();
    } catch (error) {
      return res.status(HttpStatusCode.UNPROCESSABLE_ENTITY).json( {
        errors: [error],
      } );
    }
  };
}

export function validateResBody<T>(assertFunc: AssertFunction<T>) {
  return (_req: Request, res: ResponseWithBody<T>, next: NextFunction) => {
    assertFunc(res.body as any);

    return next();
  };
};

export function sendBody<T>(_: Request, res: ResponseWithBody<T>, next: NextFunction) {
  res.send(res.body);

  next();
};
