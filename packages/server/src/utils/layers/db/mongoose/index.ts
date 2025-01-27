import { throwErrorPopStack } from "#shared/utils/errors";
import mongoose from "mongoose";
import { DatabaseNotConnectedError } from "../NotConnectedError";

export function assertConnected() {
  if (!mongoose.connection.readyState)
    throwErrorPopStack(new DatabaseNotConnectedError("Mongoose database is not connected"));
}
