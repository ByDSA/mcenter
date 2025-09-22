/* Find: lanza excepción si no lo encuentra */
export interface CanFindOneById<T, ID> {
  findOneById(id: ID): Promise<T>;
}

/* Get: permite null como resultado */
export interface CanGetOneById<E, ID> {
  getOneById(id: ID): Promise<E | null>;
}

export interface CanGetAll<E> {
  getAll(): Promise<E[]>;
}

export interface CanGetMany<T, PARTIAL=Partial<T>> {
  getMany(partial: PARTIAL): Promise<T[]>;
}

export interface CanGetManyByCriteria<T, C> {
  getManyByCriteria(criteria: C): Promise<T[]>;
}

export interface CanGetOneByCriteria<T, C> {
  getOneByCriteria(criteria: C): Promise<T | null>;
}
