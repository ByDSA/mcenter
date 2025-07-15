import z from "zod";
import { atLeastOneDefinedRefinement, RefinementWithMessage } from "../../../utils/validation/zod";

const patchSchema = z.array(z.string().or(z.number()));

export type PatchPath = z.infer<typeof patchSchema>;

const customRefinement: RefinementWithMessage<Record<any, any>> = [
  (o=>{
    const entityHasKeys = atLeastOneDefinedRefinement[0](o.entity as any);
    const hasAnyMoreKeys = Object.values(o).filter(a=>!!a).length > 1;

    return entityHasKeys || hasAnyMoreKeys;
  }
  ),
  "At least one property must be defined",
];

export function generatePatchBodySchema<T extends z.ZodRawShape>(entitySchema: z.ZodObject<T>) {
  const ret = z.object( {
    entity: entitySchema.partial().strict(),
    unset: z.array(patchSchema).optional(),
  } ).refine(...customRefinement);

  return ret;
}

export type PatchOneParams<T> = {
  entity: Partial<T>;
  unset?: PatchPath[];
};
