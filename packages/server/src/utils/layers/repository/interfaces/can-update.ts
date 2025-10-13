import { PatchOneParams } from "$shared/models/utils/schemas/patch";

/* Update: (id, model: T). Reemplaza todo el contenido de la entidad */

/* Patch */
export interface CanPatchOneById<T, ID, E = Partial<T>, OPTS = undefined> {
  patchOneById(id: ID, patchParams: PatchOneParams<E>, opts: OPTS): Promise<void>;
}

export interface CanPatchOneByIdAndGet<T, ID, E = Partial<T>, OPTS = undefined> {
  patchOneByIdAndGet(id: ID, patchParams: PatchOneParams<E>, opts: OPTS): Promise<T | null>;
}
