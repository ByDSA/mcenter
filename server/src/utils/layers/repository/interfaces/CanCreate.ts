export interface CanCreateMany<T> {
  createMany(models: T[]): Promise<void>;
}

export interface CanCreateOne<T> {
  createOne(model: T): Promise<void>;
}

export interface CanCreateOneAndGet<T> {
  createOneAndGet(model: T): Promise<T>;
}
