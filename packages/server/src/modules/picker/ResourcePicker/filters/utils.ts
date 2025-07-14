// export type CompareResourceIdFunc<R extends Resource, ID> = (resource: R, id: ID)=> boolean;
export type CompareIdFunc<ID> = (a: ID, b: ID)=> boolean;
