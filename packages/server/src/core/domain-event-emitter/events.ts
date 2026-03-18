export interface DomainEvent<P> {
  readonly type: string;
  readonly payload: P;
}

type ModelPayload<M> = {
  entity: M;
};

// Objeto que tenga campo id:
export type Entity<ID> = { id: ID};

export type EntityEvent<M extends Entity<any>> = DomainEvent<ModelPayload<M>>;

export type ModelEvent<M extends object> = DomainEvent<ModelPayload<M>>;

type PatchPayload<P extends object, M extends object, ID extends unknown> = {
  entityId: ID;
  key: keyof M;
  value: M[keyof M];
  oldValue?: M[keyof M];
  hasOld: boolean;
  partialEntity: P;
  newEntity?: M;
  oldEntity?: M;
};

export type PatchEvent<P extends object, M extends object, ID extends unknown = string> =
  DomainEvent<PatchPayload<P, M, ID>>;
