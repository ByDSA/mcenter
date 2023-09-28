export interface CanGetAll<REQ, RES> {
  getAll(req: REQ, res: RES): void;
}

export interface CanGetMany<REQ, RES> {
  getMany(req: REQ, res: RES): void;
}

export interface CanGetOneById<REQ, RES> {
  getOneById(req: REQ, res: RES): void;
}