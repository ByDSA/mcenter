import HttpStatusCode from "#shared/utils/http/StatusCode";
import { ExpressMiddleware } from "#utils/express";
import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

export const validateRequest: (schema: AnyZodObject)=> ExpressMiddleware =
  (schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await schema.parseAsync(req);

        return next();
      } catch (error) {
        return res.status(HttpStatusCode.UNPROCESSABLE_ENTITY).json(error);
      }
    };