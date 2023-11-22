export interface CanCreateOne<REQ, RES> {
  createOne(req: REQ, res: RES): void;
}
