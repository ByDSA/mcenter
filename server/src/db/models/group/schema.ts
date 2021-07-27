import { Schema } from "mongoose";
import { RESOURCE } from "../resource";

export const GroupSchemaObj = {
  ...RESOURCE,
  content: {
    type: [{
      id: {
        type: String,
      },
      url: {
        type: String,
      },
      weight: {
        type: Number,
        required: true,
        default: 0,
      },
    }],
  },
  visibility: {
    type: String,
  },
};

export default new Schema(GroupSchemaObj);
