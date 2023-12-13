/* eslint-disable semi */
import { Document } from "mongoose";

export default interface Music extends Document {
  hash: string;
  title: string;
  url: string;
  path: string;
  weight?: number;
  artist?: string;
  tags?: string[];
  duration?: number;
  disabled?: boolean;
}
