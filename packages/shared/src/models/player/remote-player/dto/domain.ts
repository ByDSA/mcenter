import z from "zod";
import { mongoDbId } from "../../../resources/partial-schemas";

export namespace RemotePlayerDtos {
  export namespace Front {
    export const schema = z.object( {
      id: mongoDbId,
      publicName: z.string(),
      status: z.enum(["open", "closed", "offline"]),
    } );
    export type Dto = z.infer<typeof schema>;
  }
}
