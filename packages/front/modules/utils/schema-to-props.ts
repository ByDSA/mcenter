import { zodSchemaToReadableFormat } from "$shared/utils/validation/zod";
import { FlattenedKeys, PropInfo } from "$shared/utils/validation/zod/utils";

export function schemaToProps<T>(
  s: Parameters<typeof zodSchemaToReadableFormat<T>>[0],
) {
  return <C extends Partial<Record<FlattenedKeys<T>, string>>>(
    captionMap: C,
  ) => {
    const flattenedSchema = zodSchemaToReadableFormat<T>(s);
    const result: Record<keyof C, PropInfo> = {} as any;

    for (const [key, propInfo] of Object.entries(flattenedSchema) as [string, PropInfo][]) {
      if (key in captionMap) {
        const caption = (captionMap[key as keyof C] !== undefined)
          ? captionMap[key as keyof C]
          : `${key}:`;

        result[key as keyof C] = {
          ...propInfo,
          caption,
        };
      }
    }

    return result;
  };
}
