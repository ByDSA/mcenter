import { EntityEvent, PatchEvent } from "#core/domain-event-emitter";
import { MovieFileInfoEntity } from "../../models";

type Entity = MovieFileInfoEntity;

export namespace MovieFileInfoEvents {
  const MAIN_TYPE = "movie_file_infos";
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
