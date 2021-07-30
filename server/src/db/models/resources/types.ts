import { findUserByName, getGroupInUserById } from "@models/user";
import { Schema } from "mongoose";
import { GroupModel } from "./group";
import { MusicModel } from "./music";
import { ResourceInterface } from "./resource/interface";
import { getEpisodeById, SerieModel } from "./serie";
import { VideoModel } from "./video";

export const MusicTypeStr = "music";

export const VideoTypeStr = "video";

export type TypeMusic = typeof MusicTypeStr;

export type TypeVideo = typeof VideoTypeStr;

export type TypeGroup = {username?: string};

export type TypeEpisode = {
  serieId: Schema.Types.ObjectId
};

export type ResourceType = TypeEpisode | TypeGroup | TypeMusic | TypeVideo;

type Params = {
  type: ResourceType,
  id: Schema.Types.ObjectId
};

export async function findResourceByTypeAndId(
  { type, id }: Params,
): Promise<ResourceInterface | null> {
  if (type === VideoTypeStr)
    return VideoModel.findById(id);

  if (type === MusicTypeStr)
    return MusicModel.findById(id);

  if (typeof type === "object") {
    if ("serieId" in type) {
      const serie = await SerieModel.findById(type.serieId);

      if (!serie)
        return null;

      const episode = getEpisodeById( {
        serie,
        id,
      } );

      return episode;
    }

    if ("username" in type && type.username) {
      const user = await findUserByName(type.username);

      if (!user)
        return null;

      return getGroupInUserById( {
        user,
        id,
      } ) ?? null;
    }

    return GroupModel.findById(id);
  }

  throw new Error(`type "${type}" incorrect`);
}
