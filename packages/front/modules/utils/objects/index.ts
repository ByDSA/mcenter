import { diff } from "just-diff";

type Settings = {
  ignoreNewUndefined?: boolean;
};
export function getDiff<T extends Object>(old: T, neww: T, settings?: Settings): Partial<T> {
  const d: Partial<T> = {
  };
  const dTree = diff(old, neww);

  for (const ops of dTree) {
    const {value} = ops;

    if (settings?.ignoreNewUndefined && ops.op === "add" && value === undefined)
      // eslint-disable-next-line no-continue
      continue;

    switch (ops.path.length) {
      case 1: d[ops.path[0]] = value;
        break;
      case 2:
        d[ops.path[0]][ops.path[1]] = value;
        break;
      default:
        throw new Error("Not implemented");
    }
  }

  return d;
}

export function isModified(r1: Object, r2: Object, settings?: Settings) {
  const diffs = getDiff(r1, r2, settings);

  return Object.keys(diffs).length > 0;
}