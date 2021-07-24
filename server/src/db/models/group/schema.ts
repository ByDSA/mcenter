import { Schema } from "mongoose";
import { RESOURCE } from "../resource";

export const ContentGroupSchemaObj = {
  id: {
    type: String,
  },
  url: {
    type: String,
  },
};

export const ContentGroupSchema = new Schema(ContentGroupSchemaObj);

export default new Schema( {
  ...RESOURCE,
  content: {
    type: [ContentGroupSchema],
  },
} );
