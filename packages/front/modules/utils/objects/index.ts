/* eslint-disable no-param-reassign */
/* eslint-disable no-continue */
import { MusicPatchOneByIdReq, MusicVO } from "#shared/models/musics";
import { diff } from "just-diff";

type Settings = {
  ignoreNewUndefined?: boolean;
};
type Ret = MusicPatchOneByIdReq["body"];
export function getDiff(old: MusicVO, neww: MusicVO, settings?: Settings): Ret {
  const d: Partial<MusicVO> = {
  };
  const dTree = diff(old, neww);
  const unset: (number | string)[][] = [];

  for (const ops of dTree) {
    const {value} = ops;

    if (settings?.ignoreNewUndefined && ops.op === "add" && value === undefined)
      continue;

    switch (ops.op) {
      case "remove": {
        if (typeof ops.path.at(-1) === "number") {
          const parentPath = ops.path.toSpliced(-1);
          const got = get(neww, parentPath);

          set(d, parentPath, got);
          continue;
        }

        unset.push(ops.path);
        break;
      }
      case "add": {
        if (typeof ops.path.at(-1) === "number") {
          const parentPath = ops.path.toSpliced(-1);
          const got = get(neww, parentPath);

          set(d, parentPath, got);
          continue;
        }

        set(d, ops.path, value);
        break;
      }
      case "replace": {
        if (value === undefined)
          unset.push(ops.path);
        else
          set(d, ops.path, value);

        break;
      }
      default:
        throw new Error(`Unknown op: ${ops.op}`);
    }
  }

  const ret: Ret = {
    entity: d as Partial<MusicVO>,
  };

  if (unset.length > 0)
    ret.unset = unset;

  return ret;
}

function set(obj: Partial<MusicVO>, path: (number | string)[], value: any) {
  let i: number;

  for (i = 0; i < path.length - 1; i++) {
    obj[path[i]] ??= {
    };
    obj = obj[path[i]];
  }

  obj[path[i]] = value;
}

function get(obj: Partial<MusicVO>, path: (number | string)[]) {
  let i: number;

  for (i = 0; i < path.length - 1; i++) {
    obj = obj[path[i]];

    if (obj === undefined)
      return undefined;
  }

  return obj[path[i]];
}

export function isModified(r1: MusicVO, r2: MusicVO, settings?: Settings) {
  const diffs = getDiff(r1, r2, settings);

  return Object.keys(diffs).length > 1 || Object.keys(diffs.entity).length > 0;
}