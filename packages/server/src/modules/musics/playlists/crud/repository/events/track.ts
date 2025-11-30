import { MusicPlaylistEntity } from "../../../models";

export namespace MusicPlayListTrackEvents {
  const MAIN_TYPE = "musicPlaylistTack";
  export const WILDCARD = `${MAIN_TYPE}.*`;

  export namespace Added {
    export const TYPE = `${MAIN_TYPE}.added`;
    export type Event = {
      playlist: MusicPlaylistEntity;
      trackListPosition: number;
    };
  }
  export namespace Deleted {
    export const TYPE = `${MAIN_TYPE}.deleted`;
    export type Event = {
      newPlaylist: MusicPlaylistEntity;
      oldPlaylist: MusicPlaylistEntity;
      trackListPosition: number;
    };
  }
  export namespace Moved {
    export const TYPE = `${MAIN_TYPE}.moved`;
    export type Event = {
      playlist: MusicPlaylistEntity;
      trackListOldPosition: number;
      trackListNewPosition: number;
    };
  }
}
