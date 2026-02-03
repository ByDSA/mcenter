import z from "zod";

export function createUploadFileResponseSchema<T extends z.ZodRawShape>(data: T) {
  return z.object( {
    message: z.string(),
    data: z.object(data),
  } );
}
