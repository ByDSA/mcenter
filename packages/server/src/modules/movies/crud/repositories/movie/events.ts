import { MovieEntity } from "$shared/models/movies";
import { MovieCrudDtos } from "$shared/models/movies/dto/transport";
import { EntityEvent, PatchEvent } from "#core/domain-event-emitter";

type Entity = MovieEntity;

export namespace MovieEvents {
  const MAIN_TYPE = "movies";
  export const WILDCARD = `${MAIN_TYPE}.*`;

  export namespace Created {
    export const TYPE = `${MAIN_TYPE}.created`;
    export type Event = EntityEvent<Entity>;
  }

  export namespace Patched {
    export const TYPE = `${MAIN_TYPE}.patched`;
    export type Event = PatchEvent<MovieCrudDtos.Patch.Body["entity"], Entity, Entity["id"]>;
  }

  export namespace Deleted {
    export const TYPE = `${MAIN_TYPE}.deleted`;
    export type Event = EntityEvent<Entity>;
  }
}
