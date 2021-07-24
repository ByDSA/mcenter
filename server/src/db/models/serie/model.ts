import mongoose from "mongoose";
import Doc from "./document";
import schema from "./schema";

const NAME = "Serie";

export default mongoose.model<Doc>(NAME, schema);
