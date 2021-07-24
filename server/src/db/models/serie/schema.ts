import mongoose from "mongoose";
import { LocalResourceSchemaObj } from "../resource/schema";
import { addRefreshUpdateAtOnSave } from "../timestamp/schema";

export const SERIE_LOCAL = {
  ...LocalResourceSchemaObj,
  title: {
    type: String,
  },
};

const schema = new mongoose.Schema(SERIE_LOCAL);

addRefreshUpdateAtOnSave(schema);
export default schema;
