import { SerieId } from "#modules/series";
import { CanDurable, Resource } from "#modules/utils/resource";
import { assertIsResource, copyOfResource } from "#modules/utils/resource/Resource.entity";

export type ModelId = string;

export type ModelFullId = {
  episodeId: ModelId;
  serieId: SerieId;
};

export default interface Model
extends
Resource,
CanDurable, ModelFullId {
}

export function compareFullId(a: ModelFullId, b: ModelFullId): boolean {
  return a.episodeId === b.episodeId && a.serieId === b.serieId;
}

export function fullIdOf(episode: Model): ModelFullId {
  return {
    episodeId: episode.episodeId,
    serieId: episode.serieId,
  };
}

export function copyOf(e: Model): Model {
  return {
    ...copyOfResource(e),
    episodeId: e.episodeId,
    serieId: e.serieId,
  };
}

export function assertIsModel(model: unknown): asserts model is Model {
  if (typeof model !== "object" || model === null)
    throw new Error("model is not an object");

  if (!("episodeId" in model))
    throw new Error("model has no episodeId");

  if (typeof (model as Model).episodeId !== "string")
    throw new Error("model.episodeId is not a string");

  if (!("serieId" in model))
    throw new Error("model has no serieId");

  if (typeof (model as Model).serieId !== "string")
    throw new Error("model.serieId is not a string");

  assertIsResource(model);
}