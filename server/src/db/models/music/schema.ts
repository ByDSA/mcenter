import mongoose from "mongoose";
import { MULTIMEDIA_LOCAL_RESOURCE } from "../resource";
import { addRefreshUpdateAtOnSave } from "../timestamp";

export const MUSIC_LOCAL = {
  ...MULTIMEDIA_LOCAL_RESOURCE,
  artist: {
    type: String,
  },
  album: {
    type: String,
  },
};

const schema = new mongoose.Schema(MUSIC_LOCAL);

addRefreshUpdateAtOnSave(schema);
export default schema;
