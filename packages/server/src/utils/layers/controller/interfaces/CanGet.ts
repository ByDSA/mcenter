import { NextFunction } from "express";

export interface CanGetAll<REQ, RES> {
  getAll(req: REQ, res: RES, next: NextFunction): void;
}

export interface CanGetMany<REQ, RES> {
  getMany(req: REQ, res: RES, next: NextFunction): void;
}

export interface CanGetOneById<REQ, RES> {
  getOneById(req: REQ, res: RES, next: NextFunction): void;
}
