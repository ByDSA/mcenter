import mongoose from "mongoose";
import { MULTIMEDIA_LOCAL_RESOURCE } from "../resource";
import { addRefreshUpdateAtOnSave } from "../timestamp";

const schema = new mongoose.Schema(MULTIMEDIA_LOCAL_RESOURCE);

addRefreshUpdateAtOnSave(schema);
export default schema;
