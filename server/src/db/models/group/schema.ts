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

export const GroupSchemaObj = {
  ...RESOURCE,
  content: {
    type: [ContentGroupSchema],
  },
};

export default new Schema(GroupSchemaObj);
