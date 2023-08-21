export interface CanDeleteAll {
  deleteAll(): Promise<void>;
}

export interface CanDeleteOneById<ID> {
  deleteOneById(id: ID): Promise<void>;
}

export interface CanDeleteOneByIdAndGet<T, ID> {
  deleteOneByIdAndGet(id: ID): Promise<T>;
}
