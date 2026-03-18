import { EntityEvent } from "#core/domain-event-emitter";
import { EpisodeHistoryEntryEntity } from "../../models";

type Entity = EpisodeHistoryEntryEntity;
export namespace EpisodeHistoryEntryEvents {
  const MAIN_TYPE = "episodeHistory";
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
