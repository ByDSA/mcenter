export interface CanCreateMany<T> {
  createMany(models: T[]): Promise<void>;
}

export interface CanCreateManyAndGet<T> {
  createManyAndGet(models: T[]): Promise<T[]>;
}

export interface CanCreateOne<T> {
  createOne(model: T): Promise<void>;
}

export interface CanCreateOneAndGet<T> {
  createOneAndGet(model: T): Promise<T>;
}
