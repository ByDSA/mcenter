/* eslint-disable no-redeclare */
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

export function generatePatchArraySchema<T extends z.ZodTypeAny>(elementSchema: T) {
  const ret = z.object( {
    push: z.array(elementSchema).optional(),
    pull: z.array(elementSchema).optional(),
    replace: z.array(elementSchema).optional(),
  } )
    .refine(
      (data) => {
        const hasPushOrPull = data.push !== undefined || data.pull !== undefined;
        const hasReplace = data.replace !== undefined;

        return hasPushOrPull !== hasReplace; // XOR: exactamente uno de los dos grupos
      },
      {
        message: "Debe tener push y/o pull, o replace, pero no ambos grupos ni ninguno",
      },
    );

  return ret;
}
interface GeneratePatchBodyOptions {
  transformArrays?: boolean;
}

export function generatePatchBodySchema<T extends z.ZodRawShape>(
  entitySchema: z.ZodObject<T>,
  options: GeneratePatchBodyOptions & { transformArrays: false },
): PatchBodyResult<OriginalEntityShape<T>>;

export function generatePatchBodySchema<T extends z.ZodRawShape>(
  entitySchema: z.ZodObject<T>,
  options?: GeneratePatchBodyOptions,
): PatchBodyResult<TransformedEntityShape<T>>;

export function generatePatchBodySchema<T extends z.ZodRawShape>(
  entitySchema: z.ZodObject<T>,
  options: GeneratePatchBodyOptions = {},
) {
  const { transformArrays = true } = options;
  const resolvedSchema = transformArrays
    ? (applyPatchArrayTransform(entitySchema) as z.ZodObject<z.ZodRawShape>)
    : entitySchema;
  const ret = z.object( {
    entity: resolvedSchema.partial().strict(),
    unset: z.array(patchSchema).optional(),
  } ).refine(...customRefinement);

  return ret;
}

// Define el return type explícitamente
type PatchArraySchema<T extends z.ZodTypeAny> = z.ZodEffects<
  z.ZodObject<{
    push: z.ZodOptional<z.ZodArray<T>>;
    pull: z.ZodOptional<z.ZodArray<typeof patchSchema>>;
    replace: z.ZodOptional<z.ZodArray<T>>;
  }>
>;

// Ahora TransformSchema lo usa directamente, sin ReturnType<typeof ...>
type TransformSchema<T extends z.ZodTypeAny> =
  T extends z.ZodOptional<infer U extends z.ZodTypeAny>
    ? z.ZodOptional<TransformSchema<U>>
  : T extends z.ZodNullable<infer U extends z.ZodTypeAny>
    ? z.ZodNullable<TransformSchema<U>>
  : T extends z.ZodArray<infer E extends z.ZodTypeAny>
    ? PatchArraySchema<TransformSchema<E>> // ← ya no usa ReturnType<typeof ...>
  : T extends z.ZodObject<infer Shape extends z.ZodRawShape>
    ? z.ZodObject<{ [K in keyof Shape]: TransformSchema<Shape[K]> }>
  : T;

type PatchBodyInner<EntityShape extends z.ZodRawShape> = z.ZodObject<{
  entity: z.ZodObject<EntityShape, "strict">;
  unset: z.ZodOptional<z.ZodArray<typeof patchSchema>>;
}>;

type PatchBodyResult<EntityShape extends z.ZodRawShape> =
  z.ZodEffects<PatchBodyInner<EntityShape>>;

type TransformedEntityShape<T extends z.ZodRawShape> = {
  [K in keyof T]: z.ZodOptional<TransformSchema<T[K]>>;
};

type OriginalEntityShape<T extends z.ZodRawShape> = {
  [K in keyof T]: z.ZodOptional<T[K]>;
};

// ─── runtime transform (sin tipado fino, sólo comportamiento) ─────────────────
function applyPatchArrayTransform(schema: z.ZodTypeAny): z.ZodTypeAny {
  if (schema instanceof z.ZodOptional)
    return applyPatchArrayTransform(schema.unwrap()).optional();

  if (schema instanceof z.ZodNullable)
    return applyPatchArrayTransform(schema.unwrap()).nullable();

  if (schema instanceof z.ZodArray)
    return generatePatchArraySchema(applyPatchArrayTransform(schema.element));

  if (schema instanceof z.ZodObject) {
    // eslint-disable-next-line no-underscore-dangle
    const shape = schema._def.shape() as z.ZodRawShape;
    const newShape = Object.fromEntries(
      Object.entries(shape).map(([key, value]) => [
        key,
        applyPatchArrayTransform(value as z.ZodTypeAny),
      ]),
    );

    return z.object(newShape);
  }

  return schema;
}

export type PatchOneParams<T> = {
  entity: Partial<T>;
  unset?: PatchPath[];
};
