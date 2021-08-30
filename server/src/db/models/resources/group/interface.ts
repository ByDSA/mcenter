import { ResourceInterface, ResourceType } from "@models/resources/resource";
import { ObjectId } from "mongoose";

export type ItemGroup = {
  type: ResourceType;
  id: ObjectId;
  url?: string;
  weight?: number;
  tags?: string[];
};

export type FixedContentGroup = ItemGroup[];

export type QueryContentGroup = {
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
