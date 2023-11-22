export interface CanUpdateOneById<REQ, RES> {
  updateOneById(req: REQ, res: RES): void;
}

export interface CanPatchOneById<REQ, RES> {
  patchOneById(req: REQ, res: RES): void;
}

export interface CanPatchOneByIdAndGet<REQ, RES> {
  patchOneByIdAndGet(req: REQ, res: RES): void;
}
