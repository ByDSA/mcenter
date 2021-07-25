import mongoose from "mongoose";
import { LocalResourceSchemaObj } from "../resource/schema";
import { addRefreshUpdateAtOnSave } from "../timestamp/schema";
import { VideoSchema } from "../video";

export const SERIE_LOCAL = {
  ...LocalResourceSchemaObj,
  episodes: {
    type: [VideoSchema],
  },
};

const schema = new mongoose.Schema(SERIE_LOCAL);

addRefreshUpdateAtOnSave(schema);
export default schema;
