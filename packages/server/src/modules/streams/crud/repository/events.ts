import { EntityEvent, PatchEvent } from "#core/domain-event-emitter";
import { StreamEntity } from "../../models";

type Entity = StreamEntity;
export namespace StreamEvents {
  const MAIN_TYPE = "stream";
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
  export namespace Updated {
    export const TYPE = `${MAIN_TYPE}.updated`;
    export type Event = EntityEvent<Entity>;
  }
}
