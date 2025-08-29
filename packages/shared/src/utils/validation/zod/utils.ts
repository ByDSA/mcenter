/* eslint-disable no-underscore-dangle */
import * as z from "zod";

export type FlattenedKeys<T> = T extends object
  ? {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      [K in keyof T]: T[K] extends Array<any> | Date | Function | RegExp
        ? K extends string
          ? K // Date se trata como hoja
          : never
        : T[K] extends object
          ? K extends string
            ? `${K}.${FlattenedKeys<T[K]>}` // Solo las hojas anidadas, no el objeto padre
            : never
          : K extends string
            ? K
            : never
    }[keyof T]
  : never;

export type PropInfo = {
  type: string;
  required: boolean;
  caption?: string;
};

export function schemaToReadableFormat<T>(
  schema: z.ZodObject<Record<keyof T, z.ZodTypeAny>>,
): Record<FlattenedKeys<T>, PropInfo> {
  const result: Record<string, PropInfo> = {};

  Object.entries(schema.shape).forEach(([key, zodType]) => {
    flattenZodType(key, zodType as any, result);
  } );

  return result;
}

function flattenZodType(
  key: string,
  zodType: z.ZodTypeAny,
  result: Record<string, PropInfo>,
): void {
  const type = calcNativeType(zodType);
  const required = calcIsRequired(zodType);

  // Si es un objeto, aplanamos sus propiedades
  if (type === "ZodObject") {
    const objectSchema = zodType as z.ZodObject<any>;
    const { shape } = objectSchema;

    if (shape) {
      Object.entries(shape).forEach(([nestedKey, nestedZodType]) => {
        const flattenedKey = `${key}.${nestedKey}`;

        flattenZodType(flattenedKey, nestedZodType as any, result);
      } );
    }
  } else {
    // Para tipos no-objeto, agregamos la entrada normalmente
    result[key] = {
      type,
      required,
    };
  }
}

function calcIsRequired(zodType: z.ZodTypeAny): boolean {
  const ret = !zodType._def?.typeName?.toString().includes("Optional");

  return ret;
}

function calcNativeType(zodType: z.ZodTypeAny): string {
  const innerType = zodType._def.innerType as z.ZodTypeAny | undefined;

  if (innerType)
    return calcNativeType(innerType);

  const { typeName } = zodType._def;
  const typeNameStr = typeName?.toString() as string | undefined;

  switch (typeNameStr) {
    case "ZodString":
      return "string";
    case "ZodNumber":
      return "number";
    case "ZodBoolean":
      return "boolean";
    case "ZodArray":
    {
      const array = zodType._def;
      const arrayElementTypeName = array.type;

      return `${calcNativeType(arrayElementTypeName) }[]`;
    }
    case "ZodEffects":
    {
      const effect = zodType._def;
      const effectType = effect.schema;

      return calcNativeType(effectType);
    }
    default:
      return typeNameStr ?? "unknown";
  }
}
