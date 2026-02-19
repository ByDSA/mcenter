import { EntityEvent, PatchEvent } from "#core/domain-event-emitter";
import { MyEntityModel } from "../../models";

type Entity = MyEntityModel;

export namespace MyEntityEvents {
  const MAIN_TYPE = "my-entities";
  export const WILDCARD = `${MAIN_TYPE}.*`;

  export namespace Created {
    export const TYPE = `${MAIN_TYPE}.created`;
    export type Event = EntityEvent<Entity>;
  }

  export namespace Patched {
    export const TYPE = `${MAIN_TYPE}.patched`;
    export type Event = PatchEvent<Entity, Entity["id"]>;
  }

  export namespace Deleted {
    export const TYPE = `${MAIN_TYPE}.deleted`;
    export type Event = EntityEvent<Entity>;
  }
}