import { assertIsGetOneByStringIdRequest, getOneByStringIdRequestSchema, GetOneByStringIdRequest } from "../../../utils/schemas/requests/GetOneById";

export {
  getOneByStringIdRequestSchema as getOneByIdReqSchema,
  type GetOneByStringIdRequest as GetOneByIdReq,
  assertIsGetOneByStringIdRequest as assertIsGetOneByIdReq,
};
