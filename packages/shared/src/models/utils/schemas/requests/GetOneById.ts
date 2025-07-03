import { z } from "zod";

const schema = z.object( {
  params: z.object( {
    id: z.string( {
      // eslint-disable-next-line camelcase
      required_error: "id is required",
    } ),
  } ),
} );

type Type = z.infer<typeof schema>;

function assertIs(o: unknown): asserts o is Type {
  schema.parse(o);
}

export {
  schema as getOneByStringIdRequestSchema,
  assertIs as assertIsGetOneByStringIdRequest,
  type Type as GetOneByStringIdRequest,
};
