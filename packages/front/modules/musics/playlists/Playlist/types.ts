import { MusicPlaylistEntity } from "../models";
import { MusicEntityWithFileInfos } from "../../models";

export type PlaylistItemEntity = MusicPlaylistEntity["list"][0] & {
  music: MusicEntityWithFileInfos;
};

export type PlaylistEntity = Omit<MusicPlaylistEntity, "list"> & {
  list: PlaylistItemEntity[];
  coverUrl?: string;
};
