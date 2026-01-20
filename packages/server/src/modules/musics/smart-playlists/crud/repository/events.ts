import { EntityEvent, PatchEvent } from "#core/domain-event-emitter";
import { MusicSmartPlaylistEntity } from "../../models";

type Entity = MusicSmartPlaylistEntity;
export namespace MusicSmartPlaylistEvents {
  const MAIN_TYPE = "music-query";
  export const WILDCARD = `${MAIN_TYPE}.*`;

  export namespace Patched {
    export const TYPE = `${MAIN_TYPE}.patched`;
    export type Event = PatchEvent<Entity, Entity["id"]>;
  }
  export namespace Created {
    export const TYPE = `${MAIN_TYPE}.created`;
    export type Event = EntityEvent<Entity>;
  }
  export namespace Deleted {
    export const TYPE = `${MAIN_TYPE}.deleted`;
    export type Event = EntityEvent<Entity>;
  }
}
