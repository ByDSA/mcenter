export interface CanGetOneById<T, ID> {
  getOneById(id: ID): Promise<T | null>;
}
