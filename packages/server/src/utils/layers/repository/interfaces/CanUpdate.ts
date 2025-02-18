export interface CanUpdateOneById<T, ID> {
  updateOneById(id: ID, model: T): Promise<void>;
}

export interface CanUpdateOneBySuperId<T, ID> {
  updateOneBySuperId(id: ID, model: T): Promise<void>;
}

export interface CanUpdateOneByIdAndGet<T, ID> {
  updateOneByIdAndGet(id: ID, model: T): Promise<T | null>;
  // eslint-disable-next-line max-len
  // Puede devolver null cuando hay algún error en el procesamiento y no se ha podido crear, como que depende de otra entidad que no existe y no se puede crear en el proceso sin más información.
}

export interface CanUpdateMany<T> {
  updateMany(models: T[]): Promise<void>;
}

export interface CanPatchOneById<T, ID, PARTIAL = Partial<T>> {
  patchOneById(id: ID, partialModel: PARTIAL): Promise<void>;
}

export interface CanPatchOneByIdAndGet<T, ID, PARTIAL = Partial<T>> {
  patchOneByIdAndGet(id: ID, partialModel: PARTIAL): Promise<T | null>;
}
