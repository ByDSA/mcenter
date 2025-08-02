import { NextFunction } from "express";

export interface CanCreateOne<REQ, RES> {
  createOne(req: REQ, res: RES, next: NextFunction): void;
}
