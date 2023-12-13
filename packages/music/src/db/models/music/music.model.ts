import mongoose from "mongoose";
import Music from "./music.document";
import MusicSchema from "./music.schema";

const NAME = "Music";

export default mongoose.model<Music>(NAME, MusicSchema);
