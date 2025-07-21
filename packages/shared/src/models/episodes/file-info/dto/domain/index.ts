import z from "zod";
import { episodeFileInfoEntitySchema, episodeFileInfoSchema } from "../../file-info";

export namespace EpisodeFileInfoDtos {
  export namespace Model {
  export const schema = episodeFileInfoSchema;
  export type Dto = z.infer<typeof schema>;
  }
  export namespace Entity {
  export const schema = episodeFileInfoEntitySchema;
  }
};
