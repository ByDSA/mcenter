import { assertIsGetOneByStringIdRequest, getOneByStringIdRequestSchema, GetOneByStringIdRequest } from "../../utils/schemas/requests/GetOneById";

export {
  getOneByStringIdRequestSchema as getOneByIdSchema,
  type GetOneByStringIdRequest as GetOneByIdRequest,
  assertIsGetOneByStringIdRequest as assertIsGetOneByIdRequest,
};
