import { ResourceVO } from "#shared/models/resource";

export type CompareResourceIdFunc<R extends ResourceVO, ID> = (resource: R, id: ID)=> boolean;

export type CompareFunc<ID> = (a: ID, b: ID)=> boolean;