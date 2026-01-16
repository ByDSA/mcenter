import { MusicUserListEntity } from "$shared/models/musics/users-lists";
import { EntityEvent, PatchEvent } from "#core/domain-event-emitter";

type Entity = MusicUserListEntity;

export namespace MusicUserListEvents {
  const MAIN_TYPE = "music-user-list";
  export const WILDCARD = `${MAIN_TYPE}.*`;

  export namespace Patched {
    export const TYPE = `${MAIN_TYPE}.patched`;
    export type Event = PatchEvent<Entity, Entity["id"]>;
  }
  export namespace Created {
    export const TYPE = `${MAIN_TYPE}.created`;
    export type Event = EntityEvent<Entity>;
  }
}
