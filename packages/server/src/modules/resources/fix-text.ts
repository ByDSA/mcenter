import clone from "just-clone";

export function fixTxt(txt: string): string {
  return txt
    .replaceAll(" ", " ")
    .replace(/ \((Official )?(Lyric|Music) Video\)/ig, "")
    .replace(/\(videoclip\)/ig, "")
    .replace(/ $/g, "");
}

export function fixTxtFields<T extends object>(
  model: T,
  fields: (string & keyof T)[],
): T {
  const copy = clone(model);

  for (const f of fields) {
    const val = copy[f];

    if (typeof val === "string")
      copy[f] = fixTxt(val) as T[typeof f];
  }

  return copy;
}
