import { EntityEvent } from "#core/domain-event-emitter";
import { MusicHistoryEntryEntity } from "../../models";

type Entity = MusicHistoryEntryEntity;
export namespace MusicHistoryEntryEvents {
  const MAIN_TYPE = "music_history";
  export const WILDCARD = `${MAIN_TYPE}.*`;

  export namespace Created {
    export const TYPE = `${MAIN_TYPE}.created`;
    export type Event = EntityEvent<Entity>;
  }
  export namespace Deleted {
    export const TYPE = `${MAIN_TYPE}.deleted`;
    export type Event = EntityEvent<Entity>;
  }
  export namespace Updated {
    export const TYPE = `${MAIN_TYPE}.updated`;
    export type Event = EntityEvent<Entity>;
  }
}
