import { throwErrorPopStack } from "#shared/utils/errors";
import mongoose from "mongoose";
import NotConnectedError from "../NotConnectedError";

export function assertConnected() {
  if (!mongoose.connection.readyState)
    throwErrorPopStack(new NotConnectedError("Mongoose database is not connected"));
}