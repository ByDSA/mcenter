import { addRefreshUpdateAtOnSave } from "@models/timestamp";
import mongoose from "mongoose";
import { MultimediaLocalResourceSchemaObj } from "../resource/schema";

export const musicSchemaObj = {
  ...MultimediaLocalResourceSchemaObj,
  artist: String,
  album: String,
};

const schema = new mongoose.Schema(musicSchemaObj);

addRefreshUpdateAtOnSave(schema);
export default schema;
