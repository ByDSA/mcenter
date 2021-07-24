/* eslint-disable semi */
import { Resource } from "../resource";

export type ResourceType = "Group" | "Music" | "Video";

export type FixedContentGroup = {
  type: ResourceType;
  id: string;
  url: string;
}[];

export type QueryContentGroup = {
  query: string;
  groupId: string;
};

export type ContentType = "Fixed"|"Query";

export type Content = FixedContentGroup|QueryContentGroup;

export default interface Interface extends Resource {
  type: ContentType;
    content: Content;
}
