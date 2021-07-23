import mongoose from "mongoose";
import Music from "./document";
import MusicSchema from "./schema";

const NAME = "Music";

export default mongoose.model<Music>(NAME, MusicSchema);
