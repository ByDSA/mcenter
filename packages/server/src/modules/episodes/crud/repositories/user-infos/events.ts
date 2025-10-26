import { EpisodeUserInfoEntity } from "$shared/models/episodes";
import { EntityEvent, PatchEvent } from "#core/domain-event-emitter";

type Key = {
  _id: string;
  userId: string;
  episodeId: string;
};

type Entity = EpisodeUserInfoEntity;
export namespace EpisodesUsersEvents {
  const MAIN_TYPE = "episodes_users";
  export const WILDCARD = `${MAIN_TYPE}.*`;

  export namespace Patched {
    export const TYPE = `${MAIN_TYPE}.patched`;
    export type Event = PatchEvent<Entity, Key>;
  }
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
