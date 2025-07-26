import mongoose, { UpdateQuery } from "mongoose";
import { throwErrorPopStack } from "$shared/utils/errors";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { DatabaseNotConnectedError } from "../NotConnectedError";

export function assertConnected() {
  if (!mongoose.connection.readyState)
    throwErrorPopStack(new DatabaseNotConnectedError("Mongoose database is not connected"));
}

export * from "./docs";

export function patchParamsToUpdateQuery<T, D>(
  params: PatchOneParams<T>,
  partialToDoc: (partial: Partial<T>)=> Partial<D>,
): UpdateQuery<D> {
  const updateQuery: UpdateQuery<D> = partialToDoc(params.entity);

  if (params.unset && params.unset.length > 0) {
    updateQuery.$unset = params.unset.reduce((acc, path) => {
      const key = path.join(".");

      acc[key] = 1;

      return acc;
    }, {} as Record<string, 1>);
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const key in updateQuery) {
    if ((updateQuery as any)[key] === undefined)
      delete (updateQuery as any)[key];
  }

  return updateQuery;
}
