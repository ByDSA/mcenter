import { episodeIdSchema } from "../../episode";

export const getOneById = {
  paramsSchema: episodeIdSchema
    .required(),
};
