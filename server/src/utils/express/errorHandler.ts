import { NotFoundError } from "#utils/http/validation";
import { NextFunction, Request, Response } from "express";

const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof NotFoundError)
    res.sendStatus(404);
  else
    res.sendStatus(500);

  next();
} ;

export default errorHandler;