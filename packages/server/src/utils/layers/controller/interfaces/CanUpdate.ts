import { NextFunction, Response } from "express";

export interface CanUpdateOneById<REQ, RES> {
  updateOneById(req: REQ, res: RES, next: NextFunction): void;
}

export interface CanPatchOneById<REQ, RES extends Response> {
  patchOneById(req: REQ, res: RES, next: NextFunction): void;
}

export interface CanPatchOneByIdAndGet<REQ, RES> {
  patchOneByIdAndGet(req: REQ, res: RES, next: NextFunction): void;
}
