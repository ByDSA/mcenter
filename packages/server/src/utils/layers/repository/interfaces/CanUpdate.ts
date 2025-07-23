import { PatchOneParams } from "$shared/models/utils/schemas/patch";

/* Update: (id, model: T). Reemplaza todo el contenido de la entidad */

/* Patch */
export interface CanPatchOneById<T, ID, E = Partial<T>> {
  patchOneById(id: ID, patchParams: PatchOneParams<E>): Promise<void>;
}

export interface CanPatchOneByIdAndGet<T, ID, E = Partial<T>> {
  patchOneByIdAndGet(id: ID, patchParams: PatchOneParams<E>): Promise<T | null>;
}
