import { SLUG_MAX_LENGTH, slugSchema } from "$shared/models/utils/schemas/slug";

export async function getUniqueString(
  base: string,
  isAvailable: (candidate: string)=> Promise<boolean>,
): Promise<string> {
  const maxLength = SLUG_MAX_LENGTH;
  let current = base.substring(0, maxLength);

  current = slugSchema.parse(current);

  let i = 1;

  while (true) {
    const available = await isAvailable(current);

    if (available)
      return current;

    i++;
    const suffix = `-${i}`;
    // Calculamos cuánto espacio queda para la base restando el sufijo a la longitud máxima
    const baseLength = Math.min(base.length, maxLength - suffix.length);

    current = `${base.substring(0, baseLength)}${suffix}`;

    current = slugSchema.parse(current);
  }
}
