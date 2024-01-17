import { NextFunction } from "express";

export interface CanDeleteOneById<REQ, RES> {
  deleteOneById(req: REQ, res: RES, next: NextFunction): void;
}
