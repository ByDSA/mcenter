// export type CompareResourceIdFunc<R extends ResourceVO, ID> = (resource: R, id: ID)=> boolean;
export type CompareIdFunc<ID> = (a: ID, b: ID)=> boolean;
