import { z } from "zod";
import { AtLeastOneDefinedRefinement, RefinementWithMessage } from "../../../utils/validation/zod";

const pathSchema = z.array(z.string().or(z.number()));

export type PatchPath = z.infer<typeof pathSchema>;

const CustomRefinement: RefinementWithMessage<Record<any, any>> = [
  (o=>{
    const entityHasKeys = AtLeastOneDefinedRefinement[0](o.entity as any);
    const hasAnyMoreKeys = Object.values(o).filter(a=>!!a).length > 1;

    return entityHasKeys || hasAnyMoreKeys;
  }
  ),
  "At least one property must be defined",
];

export function generatePatchBodySchema<T extends z.ZodRawShape>(entitySchema: z.ZodObject<T>) {
  const ret = z.object( {
    entity: entitySchema.partial().strict(),
    unset: z.array(pathSchema).optional(),
  } ).refine(...CustomRefinement);

  return ret;
}