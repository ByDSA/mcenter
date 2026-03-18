import { ImageCoverEntity } from "$shared/models/image-covers";
import { ImageCoverCrudDtos } from "$shared/models/image-covers/dto/transport";
import { EntityEvent, PatchEvent } from "#core/domain-event-emitter";

type Entity = ImageCoverEntity;
export namespace ImageCoverEvents {
  const MAIN_TYPE = "imageCovers";
  export const WILDCARD = `${MAIN_TYPE}.*`;

  export namespace Patched {
    export const TYPE = `${MAIN_TYPE}.patched`;
    export type Event = PatchEvent<ImageCoverCrudDtos.Patch.Body["entity"], Entity, Entity["id"]>;
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
