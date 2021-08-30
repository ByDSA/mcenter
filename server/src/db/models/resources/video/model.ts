import mongoose from "mongoose";
import Doc from "./document";
import Schema from "./schema";

const NAME = "Video";

export default mongoose.model<Doc>(NAME, Schema);
