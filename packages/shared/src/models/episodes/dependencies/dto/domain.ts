import z from "zod";
import { episodeDependencySchema } from "../dependency";

export namespace EpisodeDependencyDtos {
  export namespace Model {
    export const schema = episodeDependencySchema;
    export type Dto = z.infer<typeof schema>;
  }
};
