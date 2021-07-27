/* eslint-disable semi */
import { ObjectId } from "mongoose";
import { ResourceInterface, TypeResource } from "../resource";

export type ItemGroup = {
  type: TypeResource;
  id: ObjectId;
  url?: string;
  weight: number;
};
type FixedContentGroup = ItemGroup[];

type QueryContentGroup = {
  query: string;
  groupId: string;
};

export type ContentType = "fixed" | "query";

export type Content = FixedContentGroup | QueryContentGroup;

export type Visibility = "hidden" | "private" | "public";

export default interface Interface extends ResourceInterface {
  type: ContentType;
  content: Content;
  visibility: Visibility;
}
