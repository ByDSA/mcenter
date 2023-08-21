export interface CanUpdateOneById<REQ, RES> {
  updateOneById(req: REQ, res: RES): void;
}
