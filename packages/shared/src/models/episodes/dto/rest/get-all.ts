import z from "zod";

export const getAll = {
  paramsSchema: z.object( {
    serieId: z.string(),
  } ).strict()
    .required(),
};
