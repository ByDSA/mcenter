/* eslint-disable semi */
import { Document } from "mongoose";

export interface Resource extends Document {
  url: string;
}

export interface LocalResource extends Resource {
  hash: string;
  path: string;
}

export interface MultimediaLocalResource extends LocalResource {
  title: string;
  weight?: number;
  duration?: number;
  tags?: string[];
  disabled?: boolean;
  start?: number;
  end?: number;
}
