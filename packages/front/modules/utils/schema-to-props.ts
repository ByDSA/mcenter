import { zodSchemaToReadableFormat } from "$shared/utils/validation/zod";
import { FlattenedKeys, PropInfo } from "$shared/utils/validation/zod/utils";

export function schemaToProps<T>(
  s: Parameters<typeof zodSchemaToReadableFormat<T>>[0],
  captionMap: Record<FlattenedKeys<T>, string>,
) {
  const flattenedSchema = zodSchemaToReadableFormat<T>(s);
  const result: Record<FlattenedKeys<T>, PropInfo> = {} as any;

  for (const [key, propInfo] of Object.entries(flattenedSchema) as [string, PropInfo][]) {
    const caption = (captionMap[key] !== undefined)
      ? captionMap[key]
      : `${key}:`;

    result[key] = {
      ...propInfo,
      caption,
    };
  }

  return result;
}
