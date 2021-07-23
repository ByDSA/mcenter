import mongoose from "mongoose";
import { MULTIMEDIA_LOCAL_RESOURCE } from "../resource";

export const MUSIC_LOCAL = {
  ...MULTIMEDIA_LOCAL_RESOURCE,
  title: {
    type: String,
  },
  artist: {
    type: String,
  },
  album: {
    type: String,
  },
};

export default new mongoose.Schema(MUSIC_LOCAL);
