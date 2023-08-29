import { throwErrorPopStack } from "#utils/errors";
import { assertIsDefined } from "#utils/validation";
import Entry, { assertIsEntry } from "./HistoryEntry";

export type ModelId = string;

export default interface Model {
  id: ModelId;
  entries: Entry[];
  maxSize: number;
}

export function assertIsModel(model: Model): asserts model is Model {
  try {
    assertIsDefined(model);

    if (typeof model !== "object")
      throw new Error("model is not an object");

    const {id} = model;

    if (typeof id !== "string")
      throw new Error("model.id is not a string");

    const {entries} = model;

    if (!Array.isArray(entries))
      throw new Error("model.entries is not an array");

    for (const entry of entries)
      assertIsEntry(entry);

    const {maxSize} = model;

    if (typeof maxSize !== "number")
      throw new Error("model.maxSize is not a number");
  } catch (e) {
    if (e instanceof Error)
      throwErrorPopStack(e);

    throw e;
  }
}