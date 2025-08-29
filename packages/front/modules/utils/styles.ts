export function classes(...classNames: (boolean | string | null | undefined)[]) {
  return classNames
    .filter(Boolean)
    .join(" ")
    .trim();
}
