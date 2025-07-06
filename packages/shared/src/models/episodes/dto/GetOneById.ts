import { z } from "zod";

export const getOneById = {
  paramsSchema: z.object( {
    episodeId: z.string(),
    serieId: z.string(),
  } ).strict()
    .required(),
};
