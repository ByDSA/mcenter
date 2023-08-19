import { NextFunction, Request, Response } from "express";
import NotFoundError from "./NotFoundError";

const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof NotFoundError)
    res.sendStatus(404);
  else
    res.sendStatus(500);

  next();
} ;

export default errorHandler;