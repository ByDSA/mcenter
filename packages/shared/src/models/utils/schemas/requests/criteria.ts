import { z } from "zod";

const createExpandSchema = <T extends readonly string[]>(
  expandKeys: T,
): T extends readonly []
  ? z.ZodOptional<z.ZodArray<z.ZodNever>>
  : z.ZodOptional<
    z.ZodArray<z.ZodEnum<T extends readonly [infer U, ...infer Rest] ? [U, ...Rest] : never>>
  > => {
  if (expandKeys.length === 0)
    return z.array(z.never()).optional() as any;

  return z.array(z.enum(expandKeys as any)).optional() as any;
};
// Función auxiliar para crear el schema de sort
const createSortSchema = <T extends readonly string[]>(
  sortKeys: T,
) => {
  const sortShape = sortKeys.reduce((acc, key) => {
    (acc as any)[key] = z.enum(["asc", "desc"]).optional();

    return acc;
  }, {} as Record<T[number], z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>);

  return z.object(sortShape).strict()
    .optional();
};

// Función que fuerza la inferencia de tipos literales
export const createCriteriaSchema = <
  TFilter extends z.ZodRawShape,
  const TSortKeys extends readonly string[],
  const TExpand extends readonly string[]
>(config: {
  filterShape: TFilter;
  sortKeys: TSortKeys;
  expandKeys: TExpand;
} ) => {
  const { expandKeys, filterShape, sortKeys } = config;

  return z.object( {
    filter: z.object(filterShape).strict()
      .optional(),
    sort: createSortSchema(sortKeys),
    expand: createExpandSchema(expandKeys),
    limit: z.number().optional(),
    offset: z.number().optional(),
  } );
};
