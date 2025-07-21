export interface CanGetOneById<T, ID> {
  getOneById(id: ID): Promise<T | null>;
}

export interface CanFindOneById<T, ID> {
  findOneById(id: ID): Promise<T>;
}

export interface CanGetAll<T> {
  getAll(): Promise<T[]>;
}

export interface CanGetMany<T, PARTIAL=Partial<T>> {
  getMany(partial: PARTIAL): Promise<T[]>;
}

export interface CanGetManyCriteria<T, C> {
  getManyCriteria(criteria: C): Promise<T[]>;
}
