export interface CanUpdateOneById<T, ID> {
  updateOneById(id: ID, partialModel: T): Promise<void>;
}

export interface CanUpdateOneByIdAndGet<T, ID> {
  updateOneByIdAndGet(id: ID, partialModel: T): Promise<T | null>;
  // Puede devolver null cuando hay algún error en el procesamiento y no se ha podido crear, como que depende de otra entidad que no existe y no se puede crear en el proceso sin más infrmación.
}
