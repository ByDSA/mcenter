import { Schema } from "mongoose";
import { RESOURCE } from "../resource";

const ContentGroupSchema = new Schema( {
  id: {
    type: String,
  },
  url: {
    type: String,
  },
} );

export default new Schema( {
  ...RESOURCE,
  content: {
    type: [ContentGroupSchema],
  },
} );
