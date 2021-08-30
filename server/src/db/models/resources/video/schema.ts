import { addRefreshUpdateAtOnSave } from "@models/timestamp";
import { Schema } from "mongoose";
import { MultimediaLocalResourceSchemaObj } from "../resource/schema";
import Doc from "./document";

const s = new Schema<Doc>(MultimediaLocalResourceSchemaObj);

addRefreshUpdateAtOnSave(s);
export default s;
