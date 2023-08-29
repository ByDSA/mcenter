import mongoose from "mongoose";
import { Model } from "../models";

export interface DocOdm extends Model {
}

const NAME = "Stream";

export const Schema = new mongoose.Schema<DocOdm>( {
  id: {
    type: String,
    required: true,
  },
  group: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    required: true,
  },
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, Schema);