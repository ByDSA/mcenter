import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { EntityEvent, PatchEvent } from "#core/domain-event-emitter";
import { UserRoleEntity } from "../../models";

type Entity = UserRoleEntity;
export namespace UserRoleEvents {
  const MAIN_TYPE = "user_role";
  export const WILDCARD = `${MAIN_TYPE}.*`;

  export namespace Patched {
    export const TYPE = `${MAIN_TYPE}.patched`;
    export type Event = PatchEvent<PatchOneParams<Entity>["entity"], Entity, Entity["id"]>;
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
