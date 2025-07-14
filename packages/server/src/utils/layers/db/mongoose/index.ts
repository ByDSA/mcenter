import mongoose from "mongoose";
import { throwErrorPopStack } from "$shared/utils/errors";
import { DatabaseNotConnectedError } from "../NotConnectedError";

export function assertConnected() {
  if (!mongoose.connection.readyState)
    throwErrorPopStack(new DatabaseNotConnectedError("Mongoose database is not connected"));
}
