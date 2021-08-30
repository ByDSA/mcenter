import { Schema } from "mongoose";
import { getLastItemFromHistory } from "../../../db/models/history";
import { ItemGroup } from "../../../db/models/resources/group/interface";
import { FuncParams } from "../Params";

type Obj = {
  [key: string]: [string, string][];
};

export default function dependent( { self, history, group }: FuncParams) {
  if (!history)
    return true;

  let ret = true;
  const obj: Obj = {
    simpsons: [
      ["6x23", "6x24"],
    ],
    fguy: [
      ["6x04", "6x05"],
      ["4x28", "6x29"],
      ["4x29", "6x30"],
      ["12x06", "12x07"],
      ["12x07", "12x08"],
    ],
  }; // TODO: pasar a db dentro de group
  const dependencies = <Schema.Types.ObjectId[][]><any>obj[group.url];
  const lastItem = getLastItemFromHistory(history);
  const lastId = lastItem.idResource;

  for (const d of dependencies)
    ret &&= dependency(lastId, d, self);

  return ret;
}

function dependency(
  lastId: Schema.Types.ObjectId,
  [mapFirst, mapSecond]: Schema.Types.ObjectId[],
  self: ItemGroup,
): boolean {
  return (lastId === mapFirst && self.id === mapSecond)
  || (lastId !== mapFirst && self.id !== mapSecond);
}
