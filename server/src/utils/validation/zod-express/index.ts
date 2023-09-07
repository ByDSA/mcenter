import { HttpStatusCode } from "#shared/utils/http";
import { ExpressMiddleware } from "#utils/express";
import { NextFunction, Request, Response } from "express";

type AssertFunction = (obj: unknown)=> unknown;
export const validateRequest: (assertFunc: AssertFunction)=> ExpressMiddleware =
  (assertFunc: AssertFunction) =>
    (req: Request, res: Response, next: NextFunction) => {
      try {
        assertFunc(req);

        return next();
      } catch (error) {
        return res.status(HttpStatusCode.UNPROCESSABLE_ENTITY).json(error);
      }
    };