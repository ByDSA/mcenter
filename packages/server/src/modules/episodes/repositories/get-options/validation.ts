import { z } from "zod";
import { ExpandEnum } from "./ExpandEnum";

const getOptionsSchema = z.object( {
  expand: z.array(z.nativeEnum(ExpandEnum)).optional(),
} );

export type GetOptions = z.infer<typeof getOptionsSchema>;

export function validateGetOptions(opts?: GetOptions) {
  if (opts)
    getOptionsSchema.parse(opts);
}
