import mongoose from "mongoose";
import Group from "./document";
import GroupSchema from "./schema";

const NAME = "Group";

export default mongoose.model<Group>(NAME, GroupSchema);
