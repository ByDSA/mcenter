import { z } from "zod";
import ExpandEnum from "./ExpandEnum";

const GetOptionsSchema = z.object( {
  expand: z.array(z.nativeEnum(ExpandEnum)).optional(),
} );

export type GetOptions = z.infer<typeof GetOptionsSchema>;

export function validateGetOptions(opts?: GetOptions) {
  if (opts)
    GetOptionsSchema.parse(opts);
}
