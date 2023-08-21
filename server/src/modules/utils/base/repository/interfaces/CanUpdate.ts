export interface CanUpdateOneById<T, ID> {
  updateOneById(id: ID, partialModel: T): Promise<void>;
}

export interface CanUpdateOneByIdAndGet<T, ID> {
  updateOneByIdAndGet(id: ID, partialModel: T): Promise<T>;
}
