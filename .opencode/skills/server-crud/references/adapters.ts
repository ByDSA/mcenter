import { MyEntity, MyEntityModel } from "../../models";
import { Doc, FullDoc } from "./odm";

type Model = MyEntityModel;
type Entity = MyEntity;

export function toEntity(doc: FullDoc): Entity {
  return {
    id: doc._id.toString(),
    title: doc.title,
    createdAt: doc.createdAt.getTime(),
    updatedAt: doc.updatedAt.getTime(),
  };
}

export function toDoc(model: Model): Omit<Doc, "createdAt" | "updatedAt"> {
  return { title: model.title };
}

export function partialToDoc(partial: Partial<Model>): Partial<Doc> {
  const doc: Partial<Doc> = {};
  if (partial.title !== undefined) doc.title = partial.title;
  return doc;
}