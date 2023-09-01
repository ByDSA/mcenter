export interface CanGetOneById<T, ID> {
  getOneById(id: ID): Promise<T | null>;
}

export interface CanGetAll<T> {
  getAll(): Promise<T[]>;
}