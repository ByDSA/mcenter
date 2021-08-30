import { addRefreshUpdateAtOnSave } from "@models/timestamp/schema";
import mongoose from "mongoose";
import { LocalResourceSchemaObj, MultimediaLocalResourceSchemaObj } from "../resource/schema";
import Doc from "./document";

export const SERIE_LOCAL = {
  ...LocalResourceSchemaObj,
  episodes: {
    type: [MultimediaLocalResourceSchemaObj],
  },
};

const schema = new mongoose.Schema<Doc>(SERIE_LOCAL);

addRefreshUpdateAtOnSave(schema);
export default schema;
