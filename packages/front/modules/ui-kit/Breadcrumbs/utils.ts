export const matchesWithOneExtraSegment = (base: string, segment: string): boolean => {
  const prefix = base.endsWith("/") ? base : base + "/";

  return segment.startsWith(prefix) && !segment.slice(prefix.length).includes("/");
};
