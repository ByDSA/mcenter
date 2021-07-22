import dotenv from "dotenv";
import mongoose from "mongoose";
import { MediaElement } from "../../m3u/MediaElement";

export interface Episode {
    id: string;
    title: string;
    path: string;
    weight: number;
    start: number;
    end: number;
    tags?: string[];
    duration?: number;
    disabled?: boolean
}

const schema = new mongoose.Schema( {
  id: {
    type: String,
    required: true,
    unique: true,
  },
  path: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
  },
  weight: {
    type: Number,
  },
  start: {
    type: Number,
  },
  end: {
    type: Number,
  },
  duration: {
    type: Number,
  },
  tags: {
    type: [String],
  },
  disabled: {
    type: Boolean,
  },
} );

export function episodeToMediaElement(e: Episode): MediaElement {
  dotenv.config();
  const { MEDIA_PATH } = process.env;

  return {
    path: `${MEDIA_PATH}/${e.path}`,
    title: e.title,
    startTime: e.start,
    stopTime: e.end,
    length: e.duration,
  };
}

export {
  schema as EpisodeSchema,
};
