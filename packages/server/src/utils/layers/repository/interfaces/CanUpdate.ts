import { PatchOneParams } from "$shared/models/utils/schemas/patch";

export interface CanUpdateOneById<T, ID> {
  updateOneById(id: ID, model: T): Promise<void>;
}

export interface CanUpdateOneBySuperId<T, ID> {
  updateOneByEpisodeDbId(id: ID, model: T): Promise<void>;
}

export interface CanUpdateOneByIdAndGet<T, ID> {
  updateOneByIdAndGet(id: ID, model: T): Promise<T | null>;
  // eslint-disable-next-line max-len
  // Puede devolver null cuando hay algún error en el procesamiento y no se ha podido crear, como que depende de otra entidad que no existe y no se puede crear en el proceso sin más información.
}

export interface CanUpdateMany<T> {
  updateMany(models: T[]): Promise<void>;
}

export interface CanPatchOneById<T, ID, E = Partial<T>> {
  patchOneById(id: ID, patchParams: PatchOneParams<E>): Promise<void>;
}

export interface CanPatchOneByIdAndGet<T, ID, E = Partial<T>> {
  patchOneByIdAndGet(id: ID, patchParams: PatchOneParams<E>): Promise<T | null>;
}
