/* eslint-disable no-underscore-dangle */
import { MusicVO } from "#shared/models/musics";
import { VOSchema } from "#shared/models/musics/VO";
import * as z from "zod";

export type PropInfo = {
  type: string;
  required: boolean;
  caption?: string;
  };

function schemaToReadableFormat<T>(schema: z.ZodObject<Record<keyof T, z.ZodTypeAny>>): Record<keyof T, PropInfo> {
  return Object.entries(schema.shape).reduce((acc, [k, v]) => {
    acc[k as keyof T] = zodTypeToPropInfo(v);

    return acc;
  }, {
  } as Record<keyof T, PropInfo>);
}

function zodTypeToPropInfo(zodType: z.ZodTypeAny): PropInfo {
  const type = calcNativeType(zodType);

  return {
    type,
    required: calcIsRequired(zodType),
  };
}

function calcIsRequired(zodType: z.ZodTypeAny): boolean {
  const ret = !zodType._def?.typeName?.toString().includes("Optional");

  return ret;
}

function calcNativeType(zodType: z.ZodTypeAny): string {
  const innerType = zodType._def.innerType as z.ZodTypeAny | undefined;

  if (innerType)
    return calcNativeType(innerType);

  const {typeName} = zodType._def;
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

export const MUSIC_PROPS = Object.entries(schemaToReadableFormat<MusicVO>(VOSchema)).reduce((acc, [k, v]) => {
  // eslint-disable-next-line no-param-reassign
  v.caption = (() => {
    switch (k) {
      case "artist":
        return "Artista:";
      case "title":
        return "Título:";
      case "weight":
        return "Peso:";
      case "path":
        return "Path:";
      case "url":
        return "Url:";
      case "album":
        return "Álbum:";
      case "game":
        return "Juego:";
      case "year":
        return "Año:";
      case "country":
        return "País:";
      case "todo":
        return "ToDo:";
      default:
        return `${k}:`;
    }
  } )();

  acc[k] = v;

  return acc;
}
, {
} as Record<keyof MusicVO, PropInfo>);
